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

  const target = document.querySelector(`.result-card[data-rule-status="${targetStatus}"], .notam-closed`);
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
  const cardStatus = result.cardStatus || result.status;
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
    <article class="result-card status-${cardStatus}" data-icao="${result.icao}" data-rule-status="${result.status}">
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
              <span class="status-pill">${cardStatus}</span>
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
              ${renderMetar(result.metar)}
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
  const source = period.visibilitySource;
  if (source === "9999M") return "Unlimited";
  if (/^\d{4}M$/.test(source || "")) {
    return `${Number(source.slice(0, 4)).toLocaleString("en-US")}m / ${period.visibilitySm.toFixed(1)}SM`;
  }
  return source || `${period.visibilitySm} SM`;
}

function renderHighlightedTaf(result) {
  const lines = splitTafLines(result.tafRaw);
  if (!result.period || !result.period.raw) {
    return lines.map((line) => renderTafLine(line, false, "")).join("");
  }

  return lines
    .map((line, index) => {
      const applicable = isApplicableTafLine(line, result.period.raw) || tafLineApplies(lines, index, result);
      return renderTafLine(line, applicable, applicable ? tafMarker(result) : "");
    })
    .join("");
}

function renderTafLine(line, applicable, marker) {
  return `
    <details class="taf-decode-row${applicable ? " taf-applicable" : ""}">
      <summary title="Tap to decode this TAF line">
        <span>${escapeHtml(line)}</span>
        ${marker ? `<span class="taf-marker">${marker}</span>` : ""}
      </summary>
      <div class="taf-decode">${renderTafDecode(line)}</div>
    </details>
  `;
}

function renderTafDecode(line) {
  const decoded = decodeTafLine(line);
  return `
    <dl>
      ${decoded.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("")}
    </dl>
  `;
}

function renderMetar(metar) {
  if (!metar) return `<p>No METAR available.</p>`;
  return `
    <details class="metar-decode-row">
      <summary title="Tap to decode this METAR">
        <span>${escapeHtml(metar)}</span>
      </summary>
      <div class="taf-decode">${renderMetarDecode(metar)}</div>
    </details>
  `;
}

function renderMetarDecode(metar) {
  const decoded = decodeMetarLine(metar);
  return `
    <dl>
      ${decoded.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("")}
    </dl>
  `;
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

function tafLineApplies(lines, index, result) {
  const line = lines[index];
  const target = new Date(result.evaluatedAt);
  const targetMs = target.getTime();
  const window = tafLineWindow(line, target);
  if (window) {
    if (isConditionalTafLine(line)) {
      return targetMs >= window.start.getTime() && targetMs <= window.end.getTime();
    }

    const nextStart = nextTafLineStart(lines, index + 1, target);
    const end = nextStart || window.end;
    return targetMs >= window.start.getTime() && targetMs <= end.getTime();
  }

  return false;
}

function tafLineWindow(line, referenceDate) {
  const validMatch = line.match(/\b(\d{4})\/(\d{4})\b/);
  if (validMatch) {
    return tafWindowToDates(validMatch[1], validMatch[2], referenceDate);
  }

  const fmMatch = line.match(/\bFM(\d{6})\b/);
  if (fmMatch) {
    const start = tafDayHourMinuteToDate(fmMatch[1].slice(0, 2), fmMatch[1].slice(2, 4), fmMatch[1].slice(4, 6), referenceDate);
    return { start, end: new Date(start.getTime() + 30 * 60 * 60 * 1000) };
  }

  return null;
}

function nextTafLineStart(lines, startIndex, referenceDate) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const line = lines[index];
    const fmMatch = line.match(/\bFM(\d{6})\b/);
    if (fmMatch) {
      return tafDayHourMinuteToDate(fmMatch[1].slice(0, 2), fmMatch[1].slice(2, 4), fmMatch[1].slice(4, 6), referenceDate);
    }

    if (isConditionalTafLine(line)) {
      continue;
    }

    const window = tafLineWindow(line, referenceDate);
    if (window) return window.start;
  }

  return null;
}

function isConditionalTafLine(line) {
  return /^(TEMPO|PROB\d{2})\b/.test(line);
}

function tafWindowToDates(startToken, endToken, referenceDate) {
  const start = tafDayHourMinuteToDate(startToken.slice(0, 2), startToken.slice(2, 4), "00", referenceDate);
  let end = tafDayHourMinuteToDate(endToken.slice(0, 2), endToken.slice(2, 4), "00", start);
  if (end <= start) {
    end = new Date(end);
    end.setUTCMonth(end.getUTCMonth() + 1);
  }
  return { start, end };
}

function tafDayHourMinuteToDate(day, hour, minute, referenceDate) {
  const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), Number(day), Number(hour), Number(minute)));
  const diff = date - referenceDate;
  if (diff > 15 * 24 * 60 * 60 * 1000) date.setUTCMonth(date.getUTCMonth() - 1);
  if (diff < -15 * 24 * 60 * 60 * 1000) date.setUTCMonth(date.getUTCMonth() + 1);
  return date;
}

function tafMarker(result) {
  return result.role === "Departure" ? "T" : "L";
}

function decodeTafLine(line) {
  const tokens = line.trim().split(/\s+/);
  const items = [];
  const changeType = decodeChangeType(tokens[0]);
  if (changeType) items.push({ label: "Change", value: changeType });

  const window = line.match(/\b(\d{4})\/(\d{4})\b/);
  const fm = line.match(/\bFM(\d{6})\b/);
  if (window) {
    items.push({ label: "Valid", value: `${decodeTafBoundary(window[1])} to ${decodeTafBoundary(window[2])}` });
  } else if (fm) {
    items.push({ label: "From", value: decodeTafBoundary(fm[1].slice(0, 4), fm[1].slice(4, 6)) });
  }

  const wind = line.match(/\b((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT)\b/);
  if (wind) items.push({ label: "Wind", value: decodeWindToken(wind) });

  const visibility = decodeVisibilityToken(tokens);
  if (visibility) items.push({ label: "Visibility", value: visibility });

  const weather = decodeWeatherTokens(tokens);
  if (weather.length) items.push({ label: "Weather", value: weather.join("; ") });

  const clouds = decodeCloudTokens(tokens);
  if (clouds.length) items.push({ label: "Clouds", value: clouds.join("; ") });

  const remarks = decodeTafRemarks(tokens);
  if (remarks.length) items.push({ label: "Remarks", value: remarks.join("; ") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this line." }];
}

function decodeMetarLine(line) {
  const tokens = line.trim().replace(/\s+\$$/, "").split(/\s+/);
  const items = [];
  const station = tokens.find((token) => /^[A-Z0-9]{4}$/.test(token));
  if (station) items.push({ label: "Station", value: station });

  const observed = tokens.find((token) => /^\d{6}Z$/.test(token));
  if (observed) items.push({ label: "Observed", value: decodeObservedTime(observed) });

  if (tokens.includes("AUTO")) items.push({ label: "Report Type", value: "Automated observation." });
  if (tokens.includes("COR")) items.push({ label: "Correction", value: "Corrected report." });

  const wind = line.match(/\b((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT)\b/);
  if (wind) items.push({ label: "Wind", value: decodeWindToken(wind) });

  const visibility = decodeVisibilityToken(tokens);
  if (visibility) items.push({ label: "Visibility", value: visibility });

  const weather = decodeWeatherTokens(tokens);
  if (weather.length) items.push({ label: "Weather", value: weather.join("; ") });

  const clouds = decodeCloudTokens(tokens);
  if (clouds.length) items.push({ label: "Clouds", value: clouds.join("; ") });
  if (tokens.includes("CLR")) items.push({ label: "Clouds", value: "Clear below reporting limits." });
  if (tokens.includes("SKC")) items.push({ label: "Clouds", value: "Sky clear." });

  const tempDew = tokens.find((token) => /^(M?\d{2})\/(M?\d{2}|M?\/\/)$/.test(token));
  if (tempDew) items.push({ label: "Temperature", value: decodeTempDewpoint(tempDew) });

  const altimeter = tokens.find((token) => /^A\d{4}$/.test(token));
  if (altimeter) items.push({ label: "Altimeter", value: `${altimeter.slice(1, 3)}.${altimeter.slice(3)} inHg.` });

  const remarks = decodeMetarRemarks(tokens);
  if (remarks.length) items.push({ label: "Remarks", value: remarks.join("; ") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this METAR." }];
}

function decodeObservedTime(token) {
  return `${token.slice(0, 2)} ${token.slice(2, 4)}${token.slice(4, 6)}Z`;
}

function decodeTempDewpoint(token) {
  const [temperature, dewpoint] = token.split("/");
  const decodedTemp = decodeSignedTemp(temperature);
  const decodedDewpoint = dewpoint.includes("//") ? "not reported" : `${decodeSignedTemp(dewpoint)}C`;
  return `Temperature ${decodedTemp}C, dewpoint ${decodedDewpoint}.`;
}

function decodeChangeType(token) {
  if (token === "TEMPO") return "Temporary condition.";
  if (token === "BECMG") return "Becoming condition.";
  if (/^FM\d{6}$/.test(token)) return "From condition.";
  if (/^PROB\d{2}$/.test(token)) return `${token.slice(4)} percent probability condition.`;
  return null;
}

function decodeTafBoundary(dayHour, minute = "00") {
  return `${dayHour.slice(0, 2)} ${dayHour.slice(2, 4)}${minute}Z`;
}

function decodeWindToken(match) {
  const direction = match[1].startsWith("VRB") ? "variable" : `${match[1].slice(0, 3)} degrees`;
  const speed = Number(match[2]);
  const gust = match[3] ? `, gusting ${Number(match[3])} kt` : "";
  return `${direction} at ${speed} kt${gust}.`;
}

function decodeVisibilityToken(tokens) {
  const token = tokens.find((item) => item === "P6SM" || /^\d{1,2}(?:\/\d)?SM$/.test(item) || /^\d{4}$/.test(item));
  if (!token) return null;
  if (token === "P6SM") return "Greater than 6 statute miles.";
  if (/^\d{4}$/.test(token)) return token === "9999" ? "Unlimited." : `${Number(token).toLocaleString("en-US")} meters.`;
  return `${token.replace("SM", "")} statute miles.`;
}

function decodeWeatherTokens(tokens) {
  return tokens
    .filter((token) => /^[-+]?([A-Z]{2,})+$/.test(token) && /(?:RA|SN|TS|SH|BR|FG|DZ|HZ|FU|GR|GS|PL|NSW|VCSH|VCTS)/.test(token))
    .map(decodeWeatherToken);
}

function decodeWeatherToken(token) {
  if (token === "NSW") return "No significant weather.";
  const intensity = token.startsWith("-") ? "Light " : token.startsWith("+") ? "Heavy " : "";
  const clean = token.replace(/^[-+]/, "");
  const parts = [];
  const codes = [
    ["VC", "in the vicinity"],
    ["SH", "showers"],
    ["TS", "thunderstorm"],
    ["RA", "rain"],
    ["SN", "snow"],
    ["DZ", "drizzle"],
    ["BR", "mist"],
    ["FG", "fog"],
    ["HZ", "haze"],
    ["FU", "smoke"],
    ["GR", "hail"],
    ["GS", "small hail"],
    ["PL", "ice pellets"]
  ];
  codes.forEach(([code, label]) => {
    if (clean.includes(code)) parts.push(label);
  });
  return `${intensity}${parts.join(" ")}.`.trim();
}

function decodeCloudTokens(tokens) {
  return tokens
    .filter((token) => /^(FEW|SCT|BKN|OVC|VV)\d{3}(CB|TCU)?$/.test(token))
    .map((token) => {
      const match = token.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?$/);
      const coverage = { FEW: "Few", SCT: "Scattered", BKN: "Broken", OVC: "Overcast", VV: "Vertical visibility" }[match[1]];
      const cloudType = match[3] === "CB" ? " cumulonimbus" : match[3] === "TCU" ? " towering cumulus" : "";
      return `${coverage}${cloudType} at ${(Number(match[2]) * 100).toLocaleString("en-US")} ft AGL.`;
    });
}

function decodeTafRemarks(tokens) {
  const remarks = [];
  tokens.forEach((token, index) => {
    const qnh = token.match(/^QNH(\d{4})INS$/);
    if (qnh) remarks.push(`QNH ${qnh[1].slice(0, 2)}.${qnh[1].slice(2)} inches.`);
    const temp = token.match(/^(TX|TN)(M?\d{2})\/(\d{4})Z$/);
    if (temp) remarks.push(`${temp[1] === "TX" ? "Maximum" : "Minimum"} temperature ${decodeSignedTemp(temp[2])}C at ${decodeTafBoundary(temp[3])}.`);
    if (token === "LAST" && tokens[index + 1] === "NO" && tokens[index + 2] === "AMD") remarks.push("Last forecast, no amendments.");
    if (token === "AFT" && /^\d{4}Z$/.test(tokens[index + 1] || "")) remarks.push(`After ${decodeTafBoundary(tokens[index + 1].slice(0, 4))}.`);
    if (token === "NEXT" && /^\d{4}Z$/.test(tokens[index + 1] || "")) remarks.push(`Next forecast by ${decodeTafBoundary(tokens[index + 1].slice(0, 4))}.`);
    if (token === "RMK") remarks.push(`Remarks: ${tokens.slice(index + 1).join(" ")}.`);
  });
  return remarks;
}

function decodeMetarRemarks(tokens) {
  const rmkIndex = tokens.indexOf("RMK");
  if (rmkIndex === -1) return [];
  const remarks = [];
  const rmk = tokens.slice(rmkIndex + 1);
  rmk.forEach((token, index) => {
    if (token === "AO1") remarks.push("Automated station without precipitation discriminator.");
    if (token === "AO2") remarks.push("Automated station with precipitation discriminator.");
    const slp = token.match(/^SLP(\d{3})$/);
    if (slp) remarks.push(`Sea level pressure ${decodeSeaLevelPressure(slp[1])} hPa.`);
    const preciseTemp = token.match(/^T(0|1)(\d{3})(0|1)(\d{3})$/);
    if (preciseTemp) remarks.push(`Precise temperature ${decodeTenthsTemp(preciseTemp[1], preciseTemp[2])}C, precise dewpoint ${decodeTenthsTemp(preciseTemp[3], preciseTemp[4])}C.`);
    const hourlyPrecip = token.match(/^P(\d{4})$/);
    if (hourlyPrecip) remarks.push(`Hourly precipitation ${Number(hourlyPrecip[1]) / 100} inches.`);
    const sixHourPrecip = token.match(/^6(\d{4})$/);
    if (sixHourPrecip) remarks.push(`Six-hour precipitation ${Number(sixHourPrecip[1]) / 100} inches.`);
    if (/^DZB\d{2}E\d{2}$/.test(token)) remarks.push(`Drizzle began and ended during the hour: ${token}.`);
    if (/^TSNO$/.test(token)) remarks.push("Thunderstorm information not available.");
    if (token === "$") remarks.push("Automated station maintenance check indicator.");
    if (token === "PK" && rmk[index + 1] === "WND") remarks.push(`Peak wind ${rmk[index + 2] || ""} ${rmk[index + 3] || ""}`.trim() + ".");
  });
  return remarks.length ? remarks : [`Raw remarks: ${rmk.join(" ")}.`];
}

function decodeSeaLevelPressure(value) {
  const pressure = Number(value) / 10;
  return pressure < 50 ? (1000 + pressure).toFixed(1) : (900 + pressure).toFixed(1);
}

function decodeTenthsTemp(sign, value) {
  const amount = Number(value) / 10;
  return `${sign === "1" ? "-" : ""}${amount.toFixed(1)}`;
}

function decodeSignedTemp(value) {
  return value.startsWith("M") ? `-${Number(value.slice(1))}` : `${Number(value)}`;
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
