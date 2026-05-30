const form = document.querySelector("#mission-form");
const cards = document.querySelector("#cards");
const banner = document.querySelector("#decision-banner");
const caoDate = document.querySelector("#cao-date");
const pulledAt = document.querySelector("#pulled-at");
const missionSummary = document.querySelector("#mission-summary");
const filterButtons = document.querySelectorAll(".filter-button");
const defaultAlternates = "KTPA, KCOF, KHST, KPAM, KVPS, KWRB, KCHS, KBHM, KMEI, KGSB";
let currentFilter = "all";
let latestEvaluation = null;

init();

function init() {
  setDefaultTimes();
  registerServiceWorker();
  render();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    normalizeZuluFields();
    render();
  });
  document.querySelector("#takeoffTime").addEventListener("blur", normalizeZuluField);
  document.querySelector("#landingTime").addEventListener("blur", normalizeZuluField);
  document.querySelector("#clear-alternates").addEventListener("click", () => {
    clearMissionInputs();
    render();
  });
  document.querySelector("#reset-alternates").addEventListener("click", () => {
    resetMissionDefaults();
    render();
  });
  document.querySelector("#expand-all").addEventListener("click", () => setAllCardsOpen(true));
  document.querySelector("#collapse-all").addEventListener("click", () => setAllCardsOpen(false));
  banner.addEventListener("click", scrollToHighestPriorityItem);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = currentFilter === button.dataset.filter ? "all" : button.dataset.filter;
      updateFilterButtons();
      renderCards();
    });
  });
  document.querySelectorAll("button, .decision-banner[role='button']").forEach((element) => {
    element.addEventListener("click", addTapFeedback);
  });
  banner.addEventListener("click", handleSummaryIssueClick);
  banner.addEventListener("keydown", handleSummaryIssueKeydown);
}

function setDefaultTimes() {
  resetMissionDefaults();
}

function resetMissionDefaults() {
  const takeoff = new Date();
  const landing = new Date(takeoff.getTime() + 3 * 60 * 60 * 1000);
  document.querySelector("#departure").value = "KMCF";
  document.querySelector("#destination").value = "KMCF";
  document.querySelector("#missionDate").value = takeoff.toISOString().slice(0, 10);
  document.querySelector("#takeoffTime").value = formatZuluTime(takeoff);
  document.querySelector("#landingTime").value = formatZuluTime(landing);
  document.querySelector("#alternates").value = defaultAlternates;
}

function clearMissionInputs() {
  document.querySelector("#departure").value = "";
  document.querySelector("#destination").value = "";
  document.querySelector("#missionDate").value = "";
  document.querySelector("#takeoffTime").value = "";
  document.querySelector("#landingTime").value = "";
  document.querySelector("#alternates").value = "";
}

async function render() {
  const inputs = getInputs();
  setLoadingState(true);
  const missionData = await getLiveMissionData(getRequestedIcaos(inputs));
  latestEvaluation = evaluateMission(inputs, missionData);

  caoDate.textContent = `CAO ${formatCaoDate(rulesMetadata.caoDate)}`;
  pulledAt.innerHTML = `Data pulled: ${formatDateTime(latestEvaluation.pulledAt)} ${renderDataAgeBadge(latestEvaluation.sourceIssuedAt)}`;
  missionSummary.textContent = formatMissionSummary(inputs);
  missionSummary.dataset.source = rulesMetadata.weatherSource;
  if (rulesMetadata.weatherSource !== "AWC") {
    missionSummary.textContent += " | WX LIVE UNAVAILABLE";
  }

  banner.className = `decision-banner status-${latestEvaluation.summary.status}`;
  banner.dataset.status = latestEvaluation.summary.status;
  banner.tabIndex = latestEvaluation.summary.status === "green" ? -1 : 0;
  banner.setAttribute("role", latestEvaluation.summary.status === "green" ? "status" : "button");
  banner.setAttribute(
    "aria-label",
    latestEvaluation.summary.status === "green"
      ? "Mission summary"
      : `Mission summary. Click to jump to first ${latestEvaluation.summary.status} item.`
  );
  banner.innerHTML = renderDecisionBanner();

  renderCards();
  updateFilterButtons();
  updateFilterCounts();
  setLoadingState(false);
}

function renderCards() {
  if (!latestEvaluation) return;
  const filteredResults = currentFilter === "all"
    ? latestEvaluation.results
    : latestEvaluation.results.filter((result) => result.status === currentFilter);

  cards.innerHTML = filteredResults.length
    ? filteredResults.map(renderCard).join("")
    : `<p class="empty-filter">No ${currentFilter} items for this mission.</p>`;
}

function updateFilterButtons() {
  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function updateFilterCounts() {
  if (!latestEvaluation) return;
  const counts = latestEvaluation.results.reduce(
    (totals, result) => {
      totals.all += 1;
      totals[result.status] += 1;
      return totals;
    },
    { all: 0, red: 0, yellow: 0, green: 0 }
  );

  document.querySelector("#count-red").textContent = counts.red;
  document.querySelector("#count-yellow").textContent = counts.yellow;
  document.querySelector("#count-green").textContent = counts.green;
}

function renderDecisionBanner() {
  if (latestEvaluation.summary.status === "green") {
    return `
      <p class="decision-label">${latestEvaluation.summary.label}</p>
      <h2>${latestEvaluation.summary.headline}</h2>
      <p class="alternate-required">Alternate Required: <strong>${latestEvaluation.alternateRequired ? "Yes" : "No"}</strong></p>
    `;
  }

  const items = latestEvaluation.summary.items || [];
  const itemMarkup = items.map((item) => `
    <div class="summary-issue">
      <span class="summary-icao">${escapeHtml(item.icao)}</span>
      <div class="issue-chips summary-chips">${item.chips.map((chip) => renderIssueChip(chip, item.icao)).join("")}</div>
    </div>
  `).join("");

  return `
    <p class="decision-label">${latestEvaluation.summary.label}</p>
    <div class="summary-issues">${itemMarkup}</div>
  `;
}

function setAllCardsOpen(open) {
  document.querySelectorAll(".card-disclosure").forEach((details) => {
    details.open = open;
  });
}

function scrollToHighestPriorityItem() {
  if (!latestEvaluation || latestEvaluation.summary.status === "green") return;

  const targetStatus = latestEvaluation.results.some((result) => result.status === "red") ? "red" : "yellow";
  if (currentFilter !== "all" && currentFilter !== targetStatus) {
    currentFilter = targetStatus;
    updateFilterButtons();
    renderCards();
  }

  const target = document.querySelector(`.result-card.status-${targetStatus}, .notam-closed`);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.classList.add("scroll-focus");
    window.setTimeout(() => target.classList.remove("scroll-focus"), 1400);
  }
}

function addTapFeedback(event) {
  const target = event.currentTarget;
  target.classList.remove("tap-glow");
  void target.offsetWidth;
  target.classList.add("tap-glow");
  window.setTimeout(() => target.classList.remove("tap-glow"), 420);
}

function handleSummaryIssueClick(event) {
  const chip = event.target.closest("[data-issue-icao]");
  if (!chip) return;
  event.stopPropagation();
  scrollToIssue(chip.dataset.issueIcao, chip.dataset.issueLabel);
}

function handleSummaryIssueKeydown(event) {
  const chip = event.target.closest("[data-issue-icao]");
  if (!chip || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  scrollToIssue(chip.dataset.issueIcao, chip.dataset.issueLabel);
}

function scrollToIssue(icao, label) {
  if (currentFilter !== "all") {
    currentFilter = "all";
    updateFilterButtons();
    renderCards();
  }

  const card = document.querySelector(`.result-card[data-icao="${icao}"]`);
  if (!card) return;

  const details = card.querySelector(".card-disclosure");
  details.open = true;
  const target = findIssueTarget(card, label) || card;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusClass = getIssueFocusClass(label);
  target.classList.add("scroll-focus", focusClass);
  window.setTimeout(() => target.classList.remove("scroll-focus", focusClass), 1400);
}

function findIssueTarget(card, label) {
  const normalizedLabel = label.toUpperCase();
  if (normalizedLabel.includes("CEILING")) return card.querySelector(".wx-grid div:nth-child(1)");
  if (normalizedLabel.includes("VIS")) return card.querySelector(".wx-grid div:nth-child(2)");
  if (normalizedLabel.includes("WIND")) return card.querySelector(".wx-grid div:nth-child(3)");
  if (normalizedLabel.includes("CLOSED") || normalizedLabel.includes("NOTAM")) return card.querySelector(".notam-closed, .notam-limiting");
  if (normalizedLabel.includes("OCONUS")) return card.querySelector("h3.impact-red");
  return null;
}

function getIssueFocusClass(label) {
  const normalizedLabel = label.toUpperCase();
  if (normalizedLabel.includes("LOW") || normalizedLabel.includes("CLOSED") || normalizedLabel.includes("OCONUS")) {
    return "scroll-focus-red";
  }
  if (normalizedLabel.includes("NOTAM") || normalizedLabel.includes("DATA")) {
    return "scroll-focus-yellow";
  }
  return "scroll-focus-green";
}

function getInputs() {
  const missionDate = document.querySelector("#missionDate").value;
  return {
    departure: normalizeIcao(document.querySelector("#departure").value),
    destination: normalizeIcao(document.querySelector("#destination").value),
    takeoffTime: buildZuluIso(missionDate, document.querySelector("#takeoffTime").value),
    landingTime: buildZuluIso(missionDate, document.querySelector("#landingTime").value),
    alternates: document
      .querySelector("#alternates")
      .value.split(",")
      .map(normalizeIcao)
      .filter(Boolean)
  };
}

function getRequestedIcaos(inputs) {
  return [inputs.departure, inputs.destination, ...inputs.alternates].filter(Boolean);
}

function setLoadingState(isLoading) {
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Checking..." : "Check Mission";
}

function formatMissionSummary(inputs) {
  return `DEP ${inputs.departure} ${formatZuluFromIso(inputs.takeoffTime)} | DEST ${inputs.destination} ${formatZuluFromIso(inputs.landingTime)} | ALTS ${inputs.alternates.length}`;
}

function formatZuluFromIso(value) {
  return formatZuluTime(new Date(value));
}

function renderCard(result) {
  const taf = result.tafRaw
    ? `<div class="taf-line">${renderHighlightedTaf(result)}</div>`
    : `<p class="raw-line">No full TAF available.</p>`;

  const notams = result.notams.length
    ? result.notams.map(renderNotam).join("")
    : rulesMetadata.notamAvailable
      ? "<li>No active NOTAMs for selected time.</li>"
      : '<li class="notam-unavailable">NOTAM feature currently unavailable.</li>';
  const chips = `<div class="issue-chips">${(result.chips || [{ label: "NO ISSUES", status: "green" }]).map(renderIssueChip).join("")}</div>`;
  const period = result.period
    ? `
      <dl class="wx-grid">
        <div class="${impactClass(result.weatherImpacts.ceiling)}"><dt>Ceiling</dt><dd>${formatCeilingDisplay(result.period)}</dd></div>
        <div class="${impactClass(result.weatherImpacts.visibility)}"><dt>Visibility</dt><dd>${formatVisibilityDisplay(result.period)}</dd></div>
        <div class="${impactClass(result.weatherImpacts.wind)}"><dt>Wind</dt><dd>${result.period.wind}</dd></div>
      </dl>
    `
    : `<p class="raw-line">No matching TAF period for selected time.</p>`;

  return `
    <article class="result-card status-${result.status}" data-icao="${result.icao}">
      <details class="card-disclosure">
        <summary>
          <div class="card-header">
            <div class="card-main">
              <p class="role">${result.role}</p>
              <div class="airport-row">
                <h3 class="${impactClass(result.locationImpact)}">${result.icao}</h3>
                <p class="airport-name">${result.name || "Airfield"}</p>
              </div>
            </div>
            <div class="card-meta">
              <p class="evaluated-at">Evaluated at ${formatDateTime(result.evaluatedAt)}</p>
              <p class="source-labels">WX: ${escapeHtml(rulesMetadata.weatherSource)} | NOTAM: ${escapeHtml(rulesMetadata.notamSource)}</p>
            </div>
            <div class="card-status">
              <span class="status-pill">${result.status}</span>
            </div>
          </div>
          ${chips}
          <span class="expand-toggle" aria-hidden="true"></span>
        </summary>
        <div class="card-expanded">
          ${period}
          <details class="details-block" open>
            <summary>METAR / TAF / NOTAMs</summary>
            <section class="metar-block">
              <h4>METAR</h4>
              <p>${result.metar || "No METAR available."}</p>
            </section>
            <section class="taf-block">
              <h4>Full TAF</h4>
              ${taf}
            </section>
            <section class="notam-block">
              <h4>NOTAMs</h4>
              <ul>${notams}</ul>
            </section>
          </details>
        </div>
      </details>
    </article>
  `;
}

function renderIssueChip(chip, icao = "") {
  const attrs = icao
    ? ` role="button" tabindex="0" data-issue-icao="${escapeHtml(icao)}" data-issue-label="${escapeHtml(chip.label)}"`
    : "";
  return `<span class="issue-chip chip-${chip.status}"${attrs}>${escapeHtml(chip.label)}</span>`;
}

function renderDataAgeBadge(pulledAtValue) {
  const ageMinutes = Math.floor((Date.now() - new Date(pulledAtValue).getTime()) / 60000);
  if (ageMinutes >= 60) {
    return `<span class="data-age age-red">60+ min</span>`;
  }
  if (ageMinutes >= 30) {
    return `<span class="data-age age-yellow">30+ min</span>`;
  }
  return `<span class="data-age age-green">Fresh</span>`;
}

function renderNotam(notam) {
  const impactClass = notam.impact === "closed" ? " notam-closed" : notam.impact === "limiting" ? " notam-limiting" : "";
  return `<li class="notam-item${impactClass}"><strong>${escapeHtml(notam.id)}</strong> ${escapeHtml(notam.raw)}</li>`;
}

function impactClass(status) {
  return status ? `impact-${status}` : "";
}

function formatCeilingDisplay(period) {
  if (!Number.isFinite(period.ceilingFt)) {
    return "None";
  }

  return `${period.ceilingFt.toLocaleString("en-US")} ft AGL`;
}

function formatVisibilityDisplay(period) {
  return period.visibilitySource || `${period.visibilitySm} SM`;
}

function renderHighlightedTaf(result) {
  if (!result.period || !result.period.raw) {
    return splitTafLines(result.tafRaw).map((line) => `<div>${escapeHtml(line)}</div>`).join("");
  }

  return splitTafLines(result.tafRaw)
    .map((line) => {
      const escapedLine = escapeHtml(line);
      return isApplicableTafLine(line, result.period.raw)
        ? `<mark title="Applicable TAF period">${escapedLine}</mark>`
        : `<div>${escapedLine}</div>`;
    })
    .join("");
}

function splitTafLines(value) {
  return String(value)
    .replace(/\s+(?=(FM\d{6}|BECMG|TEMPO|PROB\d{2}))/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isApplicableTafLine(line, periodRaw) {
  if (line.includes(periodRaw)) {
    return true;
  }

  const periodWithoutChange = periodRaw.replace(/^FM\d{6}\s+/, "");
  return periodWithoutChange.length > 0 && line.includes(periodWithoutChange);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeIcao(value) {
  return value.trim().toUpperCase();
}

function formatDateTime(value) {
  const date = new Date(value);
  return `${formatDisplayDate(date)} ${formatZuluTime(date)} ${formatLocalGmtOffset(date)}`;
}

function formatDateOnly(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

function formatCaoDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return formatDisplayDate(date);
}

function formatDisplayDate(date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day} ${month} ${year}`;
}

function formatZuluTime(date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}${String(date.getUTCMinutes()).padStart(2, "0")}Z`;
}

function formatLocalGmtOffset(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return minutes === 0 ? `GMT${sign}${hours}` : `GMT${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

function normalizeZuluFields() {
  document.querySelector("#takeoffTime").value = normalizeZuluTime(document.querySelector("#takeoffTime").value);
  document.querySelector("#landingTime").value = normalizeZuluTime(document.querySelector("#landingTime").value);
}

function normalizeZuluField(event) {
  event.target.value = normalizeZuluTime(event.target.value);
}

function normalizeZuluTime(value) {
  const compact = value.trim().toUpperCase().replace(/[^0-9Z]/g, "");
  const rawDigits = compact.replace("Z", "");
  const digits = rawDigits.padStart(4, "0").slice(-4);
  const hours = Math.min(Number(digits.slice(0, 2)), 23);
  const minutes = Math.min(Number(digits.slice(2, 4)), 59);
  return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}Z`;
}

function buildZuluIso(dateValue, timeValue) {
  const date = dateValue || new Date().toISOString().slice(0, 10);
  const zulu = normalizeZuluTime(timeValue);
  return `${date}T${zulu.slice(0, 2)}:${zulu.slice(2, 4)}:00.000Z`;
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Local previews still work without offline caching.
    });
  }
}
