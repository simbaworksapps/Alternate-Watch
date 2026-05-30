const form = document.querySelector("#mission-form");
const cards = document.querySelector("#cards");
const banner = document.querySelector("#decision-banner");
const caoDate = document.querySelector("#cao-date");
const pulledAt = document.querySelector("#pulled-at");
const missionSummary = document.querySelector("#mission-summary");
const filterButtons = document.querySelectorAll(".filter-button");
const submitButton = document.querySelector("#check-mission-button");
const defaultAlternates = "KTPA, KCOF, KHST, KPAM, KVPS, KWRB, KCHS, KBHM, KMEI, KGSB";
const appDefaultMission = {
  departure: "KMCF",
  destination: "KMCF",
  alternates: defaultAlternates
};
const missionDefaultsStorageKey = "alternateWatchMissionDefaults";
const airfieldHistoryStorageKey = "alternateWatchAirfieldHistory";
const randomMissionFields = [
  "KMCF", "KTPA", "KCOF", "KHST", "KPAM", "KVPS", "KWRB", "KCHS", "KBHM", "KMEI", "KGSB",
  "KDOV", "KILM", "KRIC", "KJFK", "KBOS", "KORD", "KDEN", "KSEA", "KSFO", "PHNL",
  "PGUA", "EGUN", "EGUL", "ETAR", "LPLA", "RKSO", "RJTY"
];
const practiceWeatherFields = [
  "KMEI", "KWRB", "KVPS", "KCOF", "KCHS", "KILM", "KRIC", "KDOV", "KBOS", "KJFK",
  "KSEA", "KPDX", "KSFO", "KDEN", "KORD", "PAFA", "PANC", "CYFB", "BIKF", "EGUN",
  "EGUL", "ETAR", "LPLA", "PGUA", "PHNL", "RJTY", "RKSO", "CYQX", "CYYT", "CYHZ",
  "CYUL", "CYYZ", "CYWG", "CYVR", "PABE", "PAOM", "PADQ", "PAJN", "PAKT", "KJNU",
  "KAST", "KOTH", "KSFO", "KLAX", "KLAS", "KPHX", "KABQ", "KAMA", "KICT", "KMCI",
  "KMSP", "KDTW", "KCLE", "KPIT", "KIAD", "KATL", "KCLT", "KMIA", "KMSY", "KIAH",
  "KDFW", "KSAT", "KELP", "KBOI", "KBIL", "KGTF", "KFAR", "KBTV", "KPWM", "LIRF",
  "LEMD", "LFPG", "EHAM", "EDDF", "EDDM", "LOWW", "EPWA", "ENGM", "ESSA", "EFHK",
  "BIKF", "EINN", "EGLL", "EGPK", "EGPO", "EGCC", "RJAA", "RJBB", "RKSI", "RODN",
  "YSSY", "YMML", "NZAA", "NZWN", "FACT", "FAOR", "SBGL", "SBGR", "SAEZ", "SCEL"
];
const globalPracticeWeatherFields = [
  ...practiceWeatherFields,
  "KALB", "KBDL", "KBGR", "KBNA", "KBUF", "KBWI", "KCAE", "KCHS", "KCRP", "KCVG",
  "KDAL", "KDAY", "KDSM", "KERI", "KEWR", "KFLL", "KFSD", "KGEG", "KGJT", "KGRB",
  "KGRR", "KGSO", "KHSV", "KIND", "KJAN", "KJAX", "KLBB", "KLGA", "KLIT", "KMEM",
  "KMKE", "KMLI", "KMLU", "KMOB", "KMYR", "KOKC", "KOMA", "KORF", "KPBI", "KPDX",
  "KPHL", "KPNS", "KRDU", "KROA", "KROC", "KRSW", "KSAV", "KSDF", "KSGF", "KSHV",
  "KSLC", "KSMF", "KSNA", "KSPI", "KSTL", "KSYR", "KTLH", "KTUL", "KTYS", "KXNA",
  "PACD", "PADL", "PAEN", "PAGK", "PAGY", "PAHO", "PAIL", "PAKN", "PALH", "PAMC",
  "PAMR", "PASN", "PATA", "PATK", "PAUN", "PAVD", "PAWG", "PAWG", "PAWS", "PFYU",
  "PHJR", "PHKO", "PHLI", "PHMK", "PHTO", "PGUM", "PTKK", "PTPN", "PTRO", "PWAK",
  "CYYC", "CYEG", "CYFB", "CYOW", "CYQB", "CYQR", "CYQT", "CYUL", "CYVR", "CYYJ",
  "CYYR", "CYYT", "CYXY", "MMMX", "MMUN", "MMSD", "MMTJ", "TJSJ", "TXKF", "MYNN",
  "MKJP", "MDSD", "MBPV", "TNCM", "TBPB", "TTPP", "EGAA", "EGBB", "EGGD", "EGKK",
  "EGNT", "EGNX", "EGSS", "EGTE", "EGVN", "EGWU", "EGXC", "EGYD", "EGYE", "EGYP",
  "EICK", "EIDW", "EINN", "EHGG", "EHBK", "EHEH", "EBBR", "EBLG", "ELLX", "LSGG",
  "LSZH", "LFSB", "LFBO", "LFLL", "LFML", "LFRS", "EDDK", "EDDL", "EDDS", "EDDV",
  "EDFH", "EDLW", "ETAD", "ETAR", "ETNG", "ETNH", "ETHF", "ETHN", "ETIC", "ETIK",
  "ETMN", "ETNL", "ETNS", "ETNT", "LEBL", "LEMG", "LEPA", "LEST", "LPPT", "LPPR",
  "LPLA", "LIRN", "LIMC", "LIML", "LIPE", "LIPZ", "LOWG", "LOWI", "LOWS", "LKPR",
  "LHBP", "LRBS", "LROP", "LDZA", "LJLJ", "LYBE", "LGAV", "LGRP", "LTBA", "LTFM",
  "LTAI", "LTAC", "LLBG", "OJAI", "OLBA", "OKBK", "OEDF", "OEJN", "OERK", "OTBD",
  "OTHH", "OMAA", "OMDB", "OMDW", "OOMS", "OIII", "OIMM", "OAKB", "OPKC", "OPLA",
  "VIDP", "VABB", "VOBL", "VOMM", "VCBI", "VTBS", "VTSP", "WMKK", "WSSS", "WIII",
  "RPLL", "RPLC", "RCKH", "RCTP", "VHHH", "ZBAA", "ZSPD", "ZGGG", "RJTT", "RJFF",
  "RJOA", "RJSM", "RJTA", "RJTE", "RJTF", "RKJK", "RKPK", "RKSS", "RKTN", "ROAH",
  "ROKJ", "ROTM", "YBBN", "YPDN", "YPPH", "YSCB", "YSWG", "NZCH", "NZQN", "NFFN",
  "NTAA", "NSTU", "FALE", "FAPE", "FQMA", "HKJK", "HAAB", "DNMM", "DGAA", "GMMN",
  "GOBD", "DFFD", "DRRN", "FKKD", "FZAA", "SBBR", "SBCF", "SBCT", "SBEG", "SBFZ",
  "SBPA", "SBRF", "SBSV", "SPJC", "SKBO", "SEQM", "SUMU", "SABE", "SACO", "SAME"
];
const practiceScanChunkSize = 75;
const practiceScanMessages = [
  "HUNTING BAD WEATHER",
  "PULLING AWC WX",
  "LOOKING FOR TROUBLE",
  "CHECKING TAFS",
  "FINDING THE SOUP",
  "CHECKING METARS",
  "ASKING TAF TO CONFESS",
  "CHECKING WINDS",
  "VIS WENT HIDING",
  "SORTING RED WX",
  "THE METAR LOOKS GUILTY",
  "CHECKING METARS",
  "CIGS BEING SNEAKY",
  "ETA WINDOW CHECK",
  "INTERROGATING THE TAF",
  "CHASING LOW CEILINGS",
  "WINDS ACTING UP",
  "FINDING THE NOPE LINE",
  "WEATHER SAID HOLD MY COFFEE",
  "THE CLOUDS HAVE NOTES",
  "LOOKING FOR ALTERNATE BAIT",
  "WHERE DID THE RUNWAY GO",
  "CHECKING THE NASTY STUFF",
  "BUILDING A SPICY SCENARIO",
  "BUILDING SCENARIO"
];
const globalRandomMissionFields = globalPracticeWeatherFields;
const randomMissionMessages = [
  "THROWING DARTS AT MAP",
  "SPINNING THE GLOBE",
  "PICKING A RUNWAY ROMANCE",
  "BUILDING A CHAOS ROUTE",
  "LET THE TAF COOK",
  "SHAKING THE AIRFIELD BAG",
  "ASKING DISPATCH NICELY",
  "PLOT TWIST INBOUND",
  "FINDING A PLACE TO GO",
  "ALT WEATHER ROULETTE",
  "MAKING THE MAP SWEAT",
  "ROUTE MACHINE GO BRR",
  "SCENARIO IN THE OVEN",
  "PICKING SOMEWHERE SPICY",
  "GIVING THE CREW HOMEWORK"
];
let currentFilter = "all";
let latestEvaluation = null;
let missionNotice = "";
let missionDataOverride = null;
let submitFeedbackTimer = null;
let lastLiveRedPractice = null;
let activeDiceAction = null;
let activeAirfieldTarget = null;
let airfieldSearchIndex = null;
const scenarioHistory = [];

init();

function init() {
  setDefaultTimes();
  setupBrandAnimation();
  registerServiceWorker();
  render();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    normalizeZuluFields();
    await render(true);
  });
  document.querySelector("#takeoffTime").addEventListener("blur", normalizeZuluField);
  document.querySelector("#landingTime").addEventListener("blur", normalizeZuluField);
  document.querySelector("#alternates").addEventListener("input", updateAlternatesCount);
  document.querySelector("#takeoff-plus-three").addEventListener("click", () => {
    setZuluOffsetField("takeoffTime", 3);
  });
  document.querySelector("#landing-plus-three").addEventListener("click", () => {
    addHoursToZuluField("landingTime", 3);
  });
  document.querySelector("#clear-alternates").addEventListener("click", async () => {
    clearMissionInputs();
    await render();
  });
  document.querySelector("#reset-alternates").addEventListener("click", async () => {
    resetMissionDefaults();
    await render();
  });
  document.querySelector("#previous-scenario")?.addEventListener("click", restorePreviousScenario);
  resetRandomMissionButton();
  document.querySelector("#random-mission").addEventListener("click", rollRandomMission);
  document.querySelector("#practice-weather").addEventListener("click", generatePracticeWeatherMission);
  document.querySelector("#rulebook-toggle").addEventListener("click", toggleRulebook);
  document.querySelector("#rulebook-close").addEventListener("click", closeRulebook);
  document.querySelector("#defaults-toggle").addEventListener("click", toggleDefaultsPanel);
  document.querySelector("#defaults-close").addEventListener("click", closeDefaultsPanel);
  document.querySelector("#defaults-use-current").addEventListener("click", populateDefaultsFromCurrent);
  document.querySelector("#defaults-factory").addEventListener("click", populateFactoryDefaults);
  document.querySelector("#defaults-save").addEventListener("click", saveDefaultsFromPanel);
  setupAirfieldSearch();
  resetPracticeWeatherButton();
  updateAlternatesCount();
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
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRulebook();
      closeDefaultsPanel();
      closeAirfieldSearch();
    }
  });
  document.addEventListener("click", (event) => {
    if (document.body.classList.contains("rulebook-open")) {
      const panel = document.querySelector("#rulebook-panel");
      const toggle = document.querySelector("#rulebook-toggle");
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeRulebook();
    }
    if (document.body.classList.contains("defaults-open")) {
      const panel = document.querySelector("#defaults-panel");
      const toggle = document.querySelector("#defaults-toggle");
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeDefaultsPanel();
    }
    if (document.body.classList.contains("search-open")) {
      const panel = document.querySelector("#airfield-search-panel");
      const toggles = [...document.querySelectorAll(".search-button")];
      const clickedToggle = toggles.some((toggle) => toggle.contains(event.target));
      if (!panel.contains(event.target) && !clickedToggle) closeAirfieldSearch();
    }
  });
}

function setupBrandAnimation() {
  const brandRow = document.querySelector(".brand-row");
  const brandLink = document.querySelector(".brand-link");
  const title = document.querySelector("#app-title");
  if (!brandRow || !brandLink || !title) return;

  const playBrandAnimation = () => {
    brandRow.classList.remove("brand-animate");
    void brandRow.offsetWidth;
    brandRow.classList.add("brand-animate");
  };

  brandLink.addEventListener("mouseenter", playBrandAnimation);
  brandLink.addEventListener("focus", playBrandAnimation);
  title.addEventListener("click", playBrandAnimation);
}

function setDefaultTimes() {
  resetMissionDefaults();
}

function resetMissionDefaults() {
  const takeoff = new Date();
  const landing = new Date(takeoff.getTime() + 3 * 60 * 60 * 1000);
  const defaults = getMissionDefaults();
  document.querySelector("#departure").value = defaults.departure;
  document.querySelector("#destination").value = defaults.destination;
  document.querySelector("#missionDate").value = takeoff.toISOString().slice(0, 10);
  document.querySelector("#takeoffTime").value = formatZuluTime(takeoff);
  document.querySelector("#landingTime").value = formatZuluTime(landing);
  document.querySelector("#alternates").value = defaults.alternates;
  updateAlternatesCount();
}

function clearMissionInputs() {
  document.querySelector("#departure").value = "";
  document.querySelector("#destination").value = "";
  document.querySelector("#missionDate").value = "";
  document.querySelector("#takeoffTime").value = "";
  document.querySelector("#landingTime").value = "";
  document.querySelector("#alternates").value = "";
  updateAlternatesCount();
}

function generateRandomMission() {
  missionNotice = "";
  const [departure, destination, alternate] = pickUnique(getDiceAirfieldPool(), 3);
  applyMissionFields(departure, destination, [alternate]);
}

function resetRandomMissionButton() {
  const button = document.querySelector("#random-mission");
  button.innerHTML = '<span class="dice-icon" aria-hidden="true"></span>';
}

function triggerDiceSettle(button) {
  button.classList.remove("dice-settle");
  void button.offsetWidth;
  button.classList.add("dice-settle");
  window.setTimeout(() => button.classList.remove("dice-settle"), 520);
}

async function rollRandomMission() {
  const button = document.querySelector("#random-mission");
  const previousAction = activeDiceAction;
  if (previousAction?.type === "random") {
    cancelDiceAction("CANCELING ROLL", true);
    return;
  }
  if (previousAction) cancelDiceAction("SWITCHING ROLLS");

  const action = startDiceAction("random");
  const previousInputs = getRawInputValues();
  button.classList.add("dice-thinking");

  try {
    setRandomDiceMessage(action, randomMissionMessages);
    pushScenarioHistory(previousInputs);
    generateRandomMission();
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      return;
    }

    await render(true);
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      await render();
    }
  } finally {
    button.classList.remove("dice-thinking");
    resetRandomMissionButton();
    triggerDiceSettle(button);
    finishDiceAction(action);
  }
}

async function generatePracticeWeatherMission() {
  const button = document.querySelector("#practice-weather");
  const previousAction = activeDiceAction;
  if (previousAction?.type === "practice") {
    cancelDiceAction("CANCELING ROLL", true);
    return;
  }
  if (previousAction) cancelDiceAction("SWITCHING ROLLS");

  const action = startDiceAction("practice");
  const previousInputs = getRawInputValues();
  button.classList.add("dice-thinking");
  setSubmitButtonStatus("scanning");

  try {
    const takeoff = new Date();
    const landing = new Date(takeoff.getTime() + 3 * 60 * 60 * 1000);
    const practicePool = getDiceAirfieldPool();
    const scanFields = pickUnique(practicePool, practicePool.length);
    let selected = { count: 0 };
    let scanned = 0;

    for (let index = 0; index < scanFields.length; index += practiceScanChunkSize) {
      if (!isActiveDiceAction(action)) break;
      const chunk = scanFields.slice(index, index + practiceScanChunkSize);
      const nextScanned = Math.min(index + chunk.length, scanFields.length);
      setRandomDiceMessage(action, practiceScanMessages, ` ${nextScanned}/${scanFields.length}`);
      const missionData = await getLiveMissionData(chunk);
      if (!isActiveDiceAction(action)) break;
      const chunkSelected = findRedPracticeSelection(missionData, takeoff, landing, chunk, (count) => {
        setSubmitButtonStatus(`found-${Math.max(count, selected.count)}`);
      });
      scanned += chunk.length;
      setRandomDiceMessage(action, practiceScanMessages, ` ${Math.min(scanned, scanFields.length)}/${scanFields.length}`);
      if (chunkSelected.count > selected.count) selected = chunkSelected;
      if (selected.count === 3) break;
    }

    if (!isActiveDiceAction(action)) {
      return;
    }

    if (selected.count > 0) {
      missionDataOverride = null;
      lastLiveRedPractice = selected;
      missionNotice = selected.count === 3
        ? "Live red-weather practice mission loaded."
        : `Only found ${selected.count}/3 live red-weather fields; live partial practice mission loaded.`;
    } else if (lastLiveRedPractice) {
      selected = lastLiveRedPractice;
      missionDataOverride = null;
      missionNotice = "No new live red-weather fields found; last live red practice mission reused.";
    } else {
      const practiceData = getRedPracticeMissionData();
      selected = findRedPracticeSelection(practiceData, takeoff, landing, Object.keys(practiceData.airports));
      selected.sample = true;
      missionDataOverride = practiceData;
      missionNotice = "No live red-weather fields found; sample red practice fields loaded.";
    }

    pushScenarioHistory(previousInputs);
    applyMissionFields(selected.departure, selected.destination, [selected.alternate], takeoff, landing);
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      return;
    }
    await render(true);
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      await render();
      return;
    }
    const finalStatus = selected.sample ? "partial" : selected.count === 3 ? "success" : selected.count > 0 ? "partial" : "unable";
    setSubmitButtonStatus(selected.sample ? "sample" : finalStatus === "partial" ? `partial-${selected.count}` : finalStatus);
  } finally {
    button.classList.remove("dice-thinking");
    triggerDiceSettle(button);
    resetPracticeWeatherButton();
    finishDiceAction(action);
  }
}

function startDiceAction(type) {
  const action = { type, id: Date.now() + Math.random(), cancelled: false, lastMessage: "" };
  activeDiceAction = action;
  return action;
}

function setRandomDiceMessage(action, messages, suffix = "") {
  const message = pickRandomMessage(messages, action.lastMessage);
  action.lastMessage = message;
  setSubmitButtonMessage(`${message}${suffix}`);
}

function pickRandomMessage(messages, previousMessage = "") {
  const choices = messages.filter((message) => message !== previousMessage);
  const pool = choices.length ? choices : messages;
  return pool[Math.floor(Math.random() * pool.length)];
}

function cancelDiceAction(message, showCancelled = false) {
  if (!activeDiceAction) return;
  activeDiceAction.cancelled = true;
  setSubmitButtonMessage(message);
  if (showCancelled) {
    window.setTimeout(() => {
      if (!activeDiceAction) setSubmitButtonStatus("cancelled");
    }, 160);
  }
}

function isActiveDiceAction(action) {
  return activeDiceAction === action && !action.cancelled;
}

function finishDiceAction(action) {
  if (activeDiceAction === action) {
    activeDiceAction = null;
  }
}

function resetPracticeWeatherButton() {
  const button = document.querySelector("#practice-weather");
  button.innerHTML = '<span class="dice-icon risk-dice-icon" aria-hidden="true"></span>';
}

function getRawInputValues() {
  return {
    departure: document.querySelector("#departure").value,
    destination: document.querySelector("#destination").value,
    missionDate: document.querySelector("#missionDate").value,
    takeoffTime: document.querySelector("#takeoffTime").value,
    landingTime: document.querySelector("#landingTime").value,
    alternates: document.querySelector("#alternates").value
  };
}

function setRawInputValues(values) {
  document.querySelector("#departure").value = values.departure;
  document.querySelector("#destination").value = values.destination;
  document.querySelector("#missionDate").value = values.missionDate;
  document.querySelector("#takeoffTime").value = values.takeoffTime;
  document.querySelector("#landingTime").value = values.landingTime;
  document.querySelector("#alternates").value = values.alternates;
  updateAlternatesCount();
}

function pushScenarioHistory(values) {
  scenarioHistory.push({ ...values });
  while (scenarioHistory.length > 5) scenarioHistory.shift();
  updatePreviousScenarioButton();
}

async function restorePreviousScenario() {
  if (!scenarioHistory.length) return;
  if (activeDiceAction) activeDiceAction.cancelled = true;
  const previous = scenarioHistory.pop();
  setRawInputValues(previous);
  updatePreviousScenarioButton();
  setSubmitButtonMessage("BACK ONE ROLL");
  await render(true);
}

function updatePreviousScenarioButton() {
  const button = document.querySelector("#previous-scenario");
  if (!button) return;
  button.disabled = scenarioHistory.length === 0;
  button.title = scenarioHistory.length ? `Previous scenario (${scenarioHistory.length})` : "Previous scenario";
  button.setAttribute("aria-label", button.title);
}

function findRedPracticeSelection(missionData, takeoff, landing, fields, onProgress = null) {
  const candidates = pickUnique(fields, fields.length);
  const redOptions = [];
  for (const candidate of candidates) {
    const others = candidates.filter((icao) => icao !== candidate);
    const [firstOther, secondOther] = pickUnique(others, 2);
    if (!firstOther || !secondOther) continue;

    const roleOptions = [
      { departure: candidate, destination: firstOther, alternate: secondOther, targetRole: "Departure" },
      { departure: firstOther, destination: candidate, alternate: secondOther, targetRole: "Destination" },
      { departure: firstOther, destination: secondOther, alternate: candidate, targetRole: "Alternate" }
    ];

    for (const option of roleOptions) {
      const evaluated = evaluateMission({
        departure: option.departure,
        destination: option.destination,
        takeoffTime: takeoff.toISOString(),
        landingTime: landing.toISOString(),
        alternates: [option.alternate]
      }, missionData);
      const target = evaluated.results.find((result) => result.icao === candidate && result.role === option.targetRole);
      if ((target?.filterStatus || target?.cardStatus) === "red") {
        redOptions.push({
          ...option,
          icao: candidate,
          priority: getRedWeatherPriority(target)
        });
        onProgress?.(Math.min(3, selectRedPracticeRoles(redOptions, candidates).count));
        break;
      }
    }
    if (selectRedPracticeRoles(redOptions, candidates).count === 3) break;
  }
  return selectRedPracticeRoles(redOptions, candidates);
}

function getRedWeatherPriority(result) {
  const impacts = result.weatherImpacts || {};
  if (impacts.ceiling === "red" || impacts.visibility === "red") return 0;
  if (impacts.wind === "red") return 1;
  return 2;
}

function selectRedPracticeRoles(redOptions, fields) {
  const selected = {};
  const used = new Set();
  const sorted = [...redOptions].sort((left, right) => left.priority - right.priority);

  sorted.forEach((option) => {
    const key = option.targetRole.toLowerCase();
    if (!selected[key] && !used.has(option.icao)) {
      selected[key] = option.icao;
      used.add(option.icao);
    }
  });

  sorted.forEach((option) => {
    if (used.has(option.icao)) return;
    const openRole = ["departure", "destination", "alternate"].find((role) => !selected[role]);
    if (openRole) {
      selected[openRole] = option.icao;
      used.add(option.icao);
    }
  });

  const redCount = Math.min(3, Object.values(selected).length);

  pickUnique(fields.filter((icao) => !used.has(icao)), 3).forEach((icao) => {
    const openRole = ["departure", "destination", "alternate"].find((role) => !selected[role]);
    if (openRole) selected[openRole] = icao;
  });

  return {
    departure: selected.departure,
    destination: selected.destination,
    alternate: selected.alternate,
    count: redCount
  };
}

function applyMissionFields(departure, destination, alternates, takeoff = new Date(), landing = null) {
  const eta = landing || new Date(takeoff.getTime() + 3 * 60 * 60 * 1000);
  document.querySelector("#departure").value = departure;
  document.querySelector("#destination").value = destination;
  document.querySelector("#missionDate").value = takeoff.toISOString().slice(0, 10);
  document.querySelector("#takeoffTime").value = formatZuluTime(takeoff);
  document.querySelector("#landingTime").value = formatZuluTime(eta);
  document.querySelector("#alternates").value = alternates.join(", ");
  updateAlternatesCount();
}

function pickUnique(values, count) {
  const pool = [...new Set(values)].filter(Boolean);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }
  return pool.slice(0, count);
}

async function render(showSubmitFeedback = false) {
  const inputs = getInputs();
  setSubmitButtonStatus("searching");
  const missionData = missionDataOverride || await getLiveMissionData(getRequestedIcaos(inputs));
  if (missionDataOverride) {
    rulesMetadata.weatherSource = "Practice";
    missionDataOverride = null;
  }
  latestEvaluation = evaluateMission(inputs, missionData);

  caoDate.textContent = `CAO ${formatCaoDate(rulesMetadata.caoDate)}`;
  pulledAt.innerHTML = `Data pulled: ${formatDateTime(latestEvaluation.pulledAt)} ${renderDataAgeBadge(latestEvaluation.pulledAt)}`;
  missionSummary.textContent = formatMissionSummary(inputs);
  missionSummary.dataset.source = rulesMetadata.weatherSource;
  if (rulesMetadata.weatherSource === "Unavailable") {
    missionSummary.textContent += " | WX !";
  } else if (rulesMetadata.weatherSource === "Practice") {
    missionSummary.textContent += " | WX PRACTICE";
  }
  if (missionNotice) {
    missionSummary.textContent += ` | ${missionNotice}`;
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
  if (showSubmitFeedback) {
    setSubmitButtonStatus(rulesMetadata.weatherSource === "AWC" ? "success" : "unable");
  } else {
    setSubmitButtonStatus("idle");
  }
}

function renderCards() {
  if (!latestEvaluation) return;
  const filteredResults = currentFilter === "all"
    ? latestEvaluation.results
    : latestEvaluation.results.filter((result) => (result.filterStatus || result.cardStatus || result.status) === currentFilter);

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
      totals[result.filterStatus || result.cardStatus || result.status] += 1;
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

  const targetStatus = latestEvaluation.results.some((result) => (result.filterStatus || result.cardStatus || result.status) === "red") ? "red" : "yellow";
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

function setZuluOffsetField(fieldId, hours) {
  const target = new Date(Date.now() + hours * 60 * 60 * 1000);
  document.querySelector("#missionDate").value = target.toISOString().slice(0, 10);
  document.querySelector(`#${fieldId}`).value = formatZuluTime(target);
  normalizeZuluField({ target: document.querySelector(`#${fieldId}`) });
}

function addHoursToZuluField(fieldId, hours) {
  const missionDate = document.querySelector("#missionDate").value || new Date().toISOString().slice(0, 10);
  const currentIso = buildZuluIso(missionDate, document.querySelector(`#${fieldId}`).value);
  const target = new Date(new Date(currentIso).getTime() + hours * 60 * 60 * 1000);
  document.querySelector("#missionDate").value = target.toISOString().slice(0, 10);
  document.querySelector(`#${fieldId}`).value = formatZuluTime(target);
}

function toggleRulebook() {
  const panel = document.querySelector("#rulebook-panel");
  const button = document.querySelector("#rulebook-toggle");
  const isOpen = panel.hidden;
  if (isOpen) closeDefaultsPanel();
  panel.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("rulebook-open", isOpen);
}

function closeRulebook() {
  const panel = document.querySelector("#rulebook-panel");
  const button = document.querySelector("#rulebook-toggle");
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
  document.body.classList.remove("rulebook-open");
}

function toggleDefaultsPanel() {
  const panel = document.querySelector("#defaults-panel");
  const button = document.querySelector("#defaults-toggle");
  const isOpen = panel.hidden;
  if (isOpen) {
    closeRulebook();
    populateDefaultsPanel(getMissionDefaults());
  }
  panel.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("defaults-open", isOpen);
}

function closeDefaultsPanel() {
  const panel = document.querySelector("#defaults-panel");
  const button = document.querySelector("#defaults-toggle");
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
  document.body.classList.remove("defaults-open");
}

function getMissionDefaults() {
  try {
    const stored = JSON.parse(localStorage.getItem(missionDefaultsStorageKey));
    return normalizeMissionDefaults({ ...appDefaultMission, ...(stored || {}) });
  } catch (error) {
    return { ...appDefaultMission };
  }
}

function normalizeMissionDefaults(defaults) {
  return {
    departure: normalizeIcao(defaults.departure || appDefaultMission.departure) || appDefaultMission.departure,
    destination: normalizeIcao(defaults.destination || appDefaultMission.destination) || appDefaultMission.destination,
    alternates: normalizeAlternates(defaults.alternates || appDefaultMission.alternates) || appDefaultMission.alternates
  };
}

function normalizeAlternates(value) {
  return String(value || "")
    .split(",")
    .map(normalizeIcao)
    .filter(Boolean)
    .join(", ");
}

function populateDefaultsPanel(defaults) {
  const normalized = normalizeMissionDefaults(defaults);
  document.querySelector("#default-departure").value = normalized.departure;
  document.querySelector("#default-destination").value = normalized.destination;
  document.querySelector("#default-alternates").value = normalized.alternates;
}

function populateDefaultsFromCurrent() {
  populateDefaultsPanel({
    departure: document.querySelector("#departure").value,
    destination: document.querySelector("#destination").value,
    alternates: document.querySelector("#alternates").value
  });
}

function populateFactoryDefaults() {
  populateDefaultsPanel(appDefaultMission);
}

function saveDefaultsFromPanel() {
  const defaults = normalizeMissionDefaults({
    departure: document.querySelector("#default-departure").value,
    destination: document.querySelector("#default-destination").value,
    alternates: document.querySelector("#default-alternates").value
  });
  try {
    localStorage.setItem(missionDefaultsStorageKey, JSON.stringify(defaults));
  } catch (error) {
    // If storage is unavailable, still apply the values to the current form.
  }
  document.querySelector("#departure").value = defaults.departure;
  document.querySelector("#destination").value = defaults.destination;
  document.querySelector("#alternates").value = defaults.alternates;
  updateAlternatesCount();
  closeDefaultsPanel();
}

function setupAirfieldSearch() {
  document.querySelectorAll(".search-button").forEach((button) => {
    button.addEventListener("click", () => openAirfieldSearch(button.dataset.searchTarget));
  });

  document.querySelector("#airfield-search-close").addEventListener("click", closeAirfieldSearch);
  document.querySelector("#airfield-search-input").addEventListener("input", renderAirfieldSearchResults);
  document.querySelector("#airfield-search-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const firstResult = document.querySelector(".airfield-result");
      firstResult?.click();
    }
  });
  document.querySelector("#airfield-search-results").addEventListener("click", (event) => {
    const result = event.target.closest(".airfield-result");
    if (!result) return;
    selectAirfield(result.dataset.icao);
  });
}

function openAirfieldSearch(target) {
  if (!["departure", "destination", "alternates"].includes(target)) return;
  closeRulebook();
  closeDefaultsPanel();
  activeAirfieldTarget = target;

  const panel = document.querySelector("#airfield-search-panel");
  const input = document.querySelector("#airfield-search-input");
  document.querySelector("#airfield-search-title").textContent = `Search ${target === "departure" ? "Departure" : target === "destination" ? "Destination" : "Alternates"}`;
  input.value = "";
  panel.hidden = false;
  document.body.classList.add("search-open");
  setSearchButtonsExpanded(true);
  renderAirfieldSearchResults();
  window.setTimeout(() => input.focus(), 0);
}

function closeAirfieldSearch() {
  const panel = document.querySelector("#airfield-search-panel");
  if (!panel) return;
  panel.hidden = true;
  document.body.classList.remove("search-open");
  setSearchButtonsExpanded(false);
  activeAirfieldTarget = null;
}

function setSearchButtonsExpanded(isExpanded) {
  document.querySelectorAll(".search-button").forEach((button) => {
    button.setAttribute("aria-expanded", String(isExpanded && button.dataset.searchTarget === activeAirfieldTarget));
  });
}

function renderAirfieldSearchResults() {
  const results = document.querySelector("#airfield-search-results");
  const query = document.querySelector("#airfield-search-input").value.trim();
  const matches = query ? searchAirfields(query) : getRecentAirfields();
  if (!matches.length) {
    results.innerHTML = `<p class="search-empty">${query ? "No matching airfield found." : "No recent airfields yet."}</p>`;
    return;
  }

  results.innerHTML = matches
    .map((record) => `
      <button type="button" class="airfield-result ${record.recent ? "airfield-result-history" : ""}" data-icao="${escapeHtml(record.icao)}" role="option">
        <span class="airfield-result-code">${escapeHtml(record.icao)}</span>
        <span class="airfield-result-name">${escapeHtml(record.name || record.icao)}</span>
      </button>
    `)
    .join("");
}

function searchAirfields(query) {
  const normalizedQuery = query.trim().toUpperCase();
  const compactQuery = normalizedQuery.replace(/\s+/g, "");
  const matches = buildAirfieldSearchIndex()
    .map((record) => ({
      ...record,
      score: scoreAirfieldSearchRecord(record, normalizedQuery, compactQuery)
    }))
    .filter((record) => record.score > 0)
    .sort((left, right) => right.score - left.score || left.icao.localeCompare(right.icao))
    .slice(0, 12);
  if (/^[A-Z0-9]{4}$/.test(normalizedQuery) && !matches.some((record) => record.icao === normalizedQuery)) {
    matches.push({ icao: normalizedQuery, name: "Use typed ICAO", city: "Not in offline search list", country: "", score: 1 });
  }
  return matches;
}

function scoreAirfieldSearchRecord(record, query, compactQuery) {
  const fields = [record.icao, record.shortCode, record.iata, record.name, record.city, record.country, record.type, record.aliases]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase());
  if (record.icao === query || record.shortCode === query || record.iata === query) return 100;
  if (fields.some((value) => value.startsWith(query))) return 80;
  if (fields.some((value) => value.replace(/\s+/g, "").startsWith(compactQuery))) return 70;
  if (fields.some((value) => value.includes(query))) return 55;
  if (fields.some((value) => value.replace(/\s+/g, "").includes(compactQuery))) return 45;
  return 0;
}

function buildAirfieldSearchIndex() {
  if (airfieldSearchIndex) return airfieldSearchIndex;
  const sampleAirports = getMissionData().airports;
  const records = new Map();

  const addRecord = (record) => {
    if (!record.icao) return;
    const previous = records.get(record.icao) || {};
    records.set(record.icao, {
      ...previous,
      ...record,
      aliases: [previous.aliases, record.aliases].filter(Boolean).join(" ")
    });
  };

  (window.AIRPORT_SEARCH_DATA || []).forEach(([icao, name, city, country, type, iata]) => {
    addRecord({
      icao,
      shortCode: icao.slice(1),
      iata,
      name,
      city,
      country,
      type,
      aliases: ""
    });
  });

  const icaos = new Set([...Object.keys(sampleAirports), ...Object.keys(airportNameFallbacks), ...globalRandomMissionFields, ...globalPracticeWeatherFields]);
  [...icaos].forEach((icao) => {
    const sample = sampleAirports[icao] || {};
    addRecord({
      icao,
      shortCode: icao.slice(1),
      name: sample.name || airportNameFallbacks[icao] || icao,
      city: getAirfieldCityAlias(icao),
      country: sample.conus === false || !isLikelyConus(icao) ? "OCONUS" : "CONUS",
      aliases: getAirfieldCityAlias(icao)
    });
  });

  airfieldSearchIndex = [...records.values()].sort((left, right) => left.icao.localeCompare(right.icao));
  return airfieldSearchIndex;
}

function getDiceAirfieldPool() {
  const knownTrainingFields = [...globalRandomMissionFields, ...globalPracticeWeatherFields];
  const databaseFields = buildAirfieldSearchIndex()
    .filter((record) => ["large", "medium"].includes(record.type))
    .map((record) => record.icao);
  return [...new Set([...knownTrainingFields, ...databaseFields])].filter((icao) => /^[A-Z][A-Z0-9]{3}$/.test(icao));
}

function getAirfieldCityAlias(icao) {
  const aliases = {
    KMCF: "Tampa",
    KTPA: "Tampa",
    KCOF: "Cocoa Beach Patrick",
    KHST: "Homestead Miami",
    KPAM: "Panama City Tyndall",
    KVPS: "Valparaiso Eglin",
    KWRB: "Warner Robins",
    KCHS: "Charleston",
    KBHM: "Birmingham",
    KMEI: "Meridian",
    KGSB: "Goldsboro Seymour Johnson",
    KEND: "Enid Vance",
    KDOV: "Dover",
    KJFK: "New York",
    KORD: "Chicago",
    KSFO: "San Francisco",
    EGUN: "Mildenhall",
    EGUL: "Lakenheath",
    ETAR: "Ramstein",
    ETAD: "Spangdahlem Spengalem Spang",
    LPLA: "Lajes",
    PGUA: "Guam Andersen",
    PHNL: "Honolulu Hickam",
    RKSO: "Osan",
    RJTY: "Yokota"
  };
  return aliases[icao] || "";
}

function selectAirfield(icao) {
  if (!activeAirfieldTarget) return;
  const field = document.querySelector(`#${activeAirfieldTarget}`);
  saveRecentAirfield(icao);
  if (activeAirfieldTarget === "alternates") {
    addAlternateAirfield(icao);
    document.querySelector("#airfield-search-input").value = "";
    renderAirfieldSearchResults();
    document.querySelector("#airfield-search-input").focus();
    return;
  }
  field.value = icao;
  closeAirfieldSearch();
  field.focus();
}

function addAlternateAirfield(icao) {
  const field = document.querySelector("#alternates");
  const alternates = field.value
    .split(",")
    .map(normalizeIcao)
    .filter(Boolean);
  if (!alternates.includes(icao)) alternates.push(icao);
  field.value = alternates.join(", ");
  updateAlternatesCount();
}

function updateAlternatesCount() {
  const count = document.querySelector("#alternates").value
    .split(",")
    .map(normalizeIcao)
    .filter(Boolean).length;
  const badge = document.querySelector("#alternates-count");
  if (badge) badge.textContent = String(count);
}

function getRecentAirfields() {
  const history = readAirfieldHistory();
  const byIcao = new Map(buildAirfieldSearchIndex().map((record) => [record.icao, record]));
  return history
    .map((icao) => ({ ...(byIcao.get(icao) || { icao, name: icao }), recent: true }))
    .slice(0, 10);
}

function readAirfieldHistory() {
  try {
    const history = JSON.parse(localStorage.getItem(airfieldHistoryStorageKey));
    return Array.isArray(history) ? history.filter((icao) => /^[A-Z0-9]{4}$/.test(icao)) : [];
  } catch (error) {
    return [];
  }
}

function saveRecentAirfield(icao) {
  const normalized = normalizeIcao(icao);
  const history = [normalized, ...readAirfieldHistory().filter((item) => item !== normalized)].slice(0, 12);
  try {
    localStorage.setItem(airfieldHistoryStorageKey, JSON.stringify(history));
  } catch (error) {
    // Recent search history is helpful, but not required for the app to run.
  }
}

function setSubmitButtonStatus(status) {
  if (!submitButton) return;
  window.clearTimeout(submitFeedbackTimer);
  submitButton.classList.remove("button-searching", "button-success", "button-partial", "button-unable");

  if (status === "searching") {
    submitButton.disabled = true;
    submitButton.textContent = "SEARCHING";
    submitButton.classList.add("button-searching");
    return;
  }

  if (status === "scanning" || status === "pulling" || /^found-\d$/.test(status)) {
    submitButton.disabled = true;
    submitButton.textContent = status === "scanning"
      ? "SCANNING AWC"
      : status === "pulling"
        ? "PULLING WX"
        : `FOUND ${status.slice(-1)}/3 RED`;
    submitButton.classList.add("button-searching");
    return;
  }

  submitButton.disabled = false;
  if (status === "success") {
    submitButton.textContent = "SUCCESS";
    submitButton.classList.add("button-success");
  } else if (/^partial-\d$/.test(status)) {
    submitButton.textContent = `FOUND ${status.slice(-1)}/3 RED`;
    submitButton.classList.add("button-partial");
  } else if (status === "sample") {
    submitButton.textContent = "SAMPLE LOADED";
    submitButton.classList.add("button-partial");
  } else if (status === "cancelled") {
    submitButton.textContent = "SCAN CANCELED";
    submitButton.classList.add("button-partial");
  } else if (status === "unable") {
    submitButton.textContent = "UNABLE";
    submitButton.classList.add("button-unable");
  } else {
    submitButton.textContent = "Check Mission";
    return;
  }

  submitFeedbackTimer = window.setTimeout(() => {
    submitButton.classList.remove("button-success", "button-partial", "button-unable");
    submitButton.textContent = "Check Mission";
  }, 2400);
}

function setSubmitButtonMessage(message, options = {}) {
  if (!submitButton) return;
  window.clearTimeout(submitFeedbackTimer);
  submitButton.disabled = true;
  submitButton.textContent = message;
  submitButton.classList.remove("button-success", "button-partial", "button-unable");
  submitButton.classList.add("button-searching");
}

function formatMissionSummary(inputs) {
  return `DEP ${inputs.departure} ${formatZuluFromIso(inputs.takeoffTime)} | DEST ${inputs.destination} ${formatZuluFromIso(inputs.landingTime)} | ALTS ${inputs.alternates.length}`;
}

function formatZuluFromIso(value) {
  return formatZuluTime(new Date(value));
}

function renderCard(result) {
  const cardStatus = result.cardStatus || result.status;
  const wxSource = rulesMetadata.weatherSource === "AWC" ? "AWC" : rulesMetadata.weatherSource === "Practice" ? "Practice" : "!";
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
        <div class="${impactClass(result.weatherImpacts.wind)}"><dt>Wind</dt><dd>${formatWindDisplay(result.period.wind)}</dd></div>
      </dl>
    `
    : `<p class="raw-line">${result.tafRaw ? "Selected time is outside this TAF valid window." : "No TAF available from AWC for this airfield."}</p>`;

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
              <p class="source-labels">WX: <span class="${rulesMetadata.weatherSource === "AWC" ? "" : "wx-failed"}">${escapeHtml(wxSource)}</span> | NOTAM: ${escapeHtml(rulesMetadata.notamSource)}</p>
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
              <h4 class="metar-title">METAR ${renderMetarAgeBadge(result.metar, latestEvaluation.pulledAt)}</h4>
              ${renderMetar(result.metar)}
            </section>
            <section class="taf-block">
              <h4 class="taf-title">Full TAF ${renderTafValidityBadge(result.tafRaw, latestEvaluation.pulledAt)}</h4>
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

function renderMetarAgeBadge(metar, referenceValue) {
  const observedAt = getMetarObservedAt(metar, referenceValue);
  if (!observedAt) return "";
  const ageMinutes = Math.max(0, Math.floor((new Date(referenceValue).getTime() - observedAt.getTime()) / 60000));
  const ageClass = ageMinutes >= 60 ? "age-red" : ageMinutes >= 30 ? "age-yellow" : "age-green";
  const label = ageMinutes >= 60 ? "60+ min old" : ageMinutes >= 30 ? "30+ min old" : `${ageMinutes} min old`;
  return `<span class="data-age metar-age ${ageClass}">${label}</span>`;
}

function renderTafValidityBadge(tafRaw, referenceValue) {
  const window = getTafValidityWindow(tafRaw, referenceValue);
  if (!window) return "";
  const reference = new Date(referenceValue).getTime();
  const status = reference > window.end.getTime()
    ? { label: "Expired", className: "age-red" }
    : reference < window.start.getTime()
      ? { label: "Future", className: "age-yellow" }
      : { label: "Current", className: "age-green" };
  return `<span class="data-age taf-age ${status.className}">${status.label}</span>`;
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
    return `${Number(source.slice(0, 4)).toLocaleString("en-US")}m <span class="vis-separator">|</span> ${period.visibilitySm.toFixed(1)}SM`;
  }
  return source || `${period.visibilitySm} SM`;
}

function formatWindDisplay(wind) {
  return wind === "00000KT" ? "Calm" : wind;
}

function renderHighlightedTaf(result) {
  const lines = splitTafLines(result.tafRaw);
  if (!result.period || !result.period.raw) {
    return lines.map((line) => renderTafLine(line, "none", [])).join("");
  }

  const target = new Date(result.evaluatedAt);
  const checks = [
    { label: tafMarker(result), type: "exact", time: target }
  ];
  if (result.role !== "Departure") {
    checks.push(
      { label: "ETA-1", type: "window", time: new Date(target.getTime() - 60 * 60 * 1000) },
      { label: "ETA+1", type: "window", time: new Date(target.getTime() + 60 * 60 * 1000) }
    );
  }

  return lines
    .map((line, index) => {
      const markers = checks
        .filter((check) => tafLineAppliesAt(lines, index, check.time))
        .map((check) => ({
          label: check.label,
          type: check.type,
          status: getTafLineStatus(line, check.time, result)
        }));
      const exact = markers.some((marker) => marker.type === "exact");
      const context = markers.some((marker) => marker.type === "window");
      const state = exact ? "exact" : context ? "window" : "none";
      return renderTafLine(line, state, markers);
    })
    .join("");
}

function renderTafLine(line, state, markers) {
  const stateClass = state === "exact" ? " taf-applicable" : state === "window" ? " taf-window" : "";
  const status = markers.reduce((current, marker) =>
    STATUS_RANK[marker.status] > STATUS_RANK[current] ? marker.status : current
  , "green");
  const statusClass = markers.length ? ` taf-status-${status}` : "";
  return `
    <details class="taf-decode-row${stateClass}${statusClass}">
      <summary title="Tap to decode this TAF line">
        <span>${escapeHtml(line)}</span>
        ${markers.length ? `<span class="taf-markers">${markers.map((marker) => `<span class="taf-marker marker-${marker.status}">${escapeHtml(marker.label)}</span>`).join("")}</span>` : ""}
      </summary>
      <div class="taf-decode">${renderTafDecode(line)}</div>
    </details>
  `;
}

function getTafLineStatus(line, target, result) {
  const targetMs = target.getTime();
  const ruleType = result.role === "Departure" ? "departure" : result.role === "Destination" ? "destination" : "alternate";
  const matchingPeriods = (result.taf || []).filter((period) => {
    const start = new Date(period.validFrom).getTime();
    const end = new Date(period.validTo).getTime();
    return isApplicableTafLine(line, period.raw) && targetMs >= start && targetMs < end;
  });
  if (!matchingPeriods.length) return "green";
  return matchingPeriods
    .map((period) => evaluateWeather(period, ruleType, true).status)
    .reduce((current, status) => STATUS_RANK[status] > STATUS_RANK[current] ? status : current, "green");
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

function tafLineAppliesAt(lines, index, target) {
  const line = lines[index];
  const targetMs = target.getTime();
  const window = tafLineWindow(line, target);
  if (window) {
    if (isConditionalTafLine(line)) {
      return targetMs >= window.start.getTime() && targetMs <= window.end.getTime();
    }

    const nextStart = nextTafLineStart(lines, index + 1, target);
    const end = nextStart || window.end;
    return targetMs >= window.start.getTime() && targetMs < end.getTime();
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
    if (window) return line.startsWith("BECMG") ? window.end : window.start;
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

  const undecoded = decodeUndecodedTokens(tokens, "taf");
  if (undecoded.length) items.push({ label: "Encoded / System", value: undecoded.join("; ") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this line." }];
}

function decodeMetarLine(line) {
  const tokens = line.trim().split(/\s+/);
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

  const rvr = decodeRvrTokens(tokens);
  if (rvr.length) items.push({ label: "Runway Visibility", value: rvr.join("; ") });

  const weather = decodeWeatherTokens(tokens);
  if (weather.length) items.push({ label: "Weather", value: weather.join("; ") });

  const clouds = decodeCloudTokens(tokens);
  if (clouds.length) items.push({ label: "Clouds", value: clouds.join("; ") });
  if (tokens.includes("CLR")) items.push({ label: "Clouds", value: "Clear below reporting limits." });
  if (tokens.includes("SKC")) items.push({ label: "Clouds", value: "Sky clear." });

  const tempDew = tokens.find((token) => /^(M?\d{2}|M)\/(M?\d{2}|M|M?\/\/)$/.test(token));
  if (tempDew) items.push({ label: "Temperature", value: decodeTempDewpoint(tempDew) });

  const altimeter = tokens.find((token) => /^A\d{4}$/.test(token));
  if (altimeter) items.push({ label: "Altimeter", value: `${altimeter.slice(1, 3)}.${altimeter.slice(3)} inHg.` });
  const qnh = tokens.find((token) => /^Q\d{4}$/.test(token));
  if (qnh) items.push({ label: "Altimeter", value: `${qnh.slice(1)} hPa.` });

  const remarks = decodeMetarRemarks(tokens);
  if (remarks.length) items.push({ label: "Remarks", value: remarks.join("; ") });

  const undecoded = decodeUndecodedTokens(tokens, "metar");
  if (undecoded.length) items.push({ label: "Encoded / System", value: undecoded.join("; ") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this METAR." }];
}

function decodeUndecodedTokens(tokens, reportType) {
  const isKnown = reportType === "metar" ? isKnownMetarToken : isKnownTafToken;
  return tokens
    .filter((token, index) => !isKnown(token, index, tokens))
    .map((token) => describeUndecodedToken(token, reportType));
}

function isKnownTafToken(token, index, tokens) {
  if (isCommonAviationToken(token)) return true;
  if (isWeatherToken(token)) return true;
  if (/^FM\d{6}$/.test(token)) return true;
  if (/^\d{4}\/\d{4}$/.test(token)) return true;
  if (/^(TAF|AMD|COR|TEMPO|BECMG|NSW|CAVOK|NIL|CNL|LAST|NO|AFT|NEXT|RMK)$/.test(token)) return true;
  if (/^PROB\d{2}$/.test(token)) return true;
  if (/^(TX|TN)(M?\d{2})\/(\d{4})Z$/.test(token)) return true;
  if (/^QNH\d{4}INS$/.test(token)) return true;
  if (/^\d{4}Z$/.test(token) && ["AFT", "NEXT"].includes(tokens[index - 1])) return true;
  if (token === "AMD" && tokens[index - 1] === "NO") return true;
  if (token === "FZRANO") return true;
  if (token === "LTG" || token === "DSNT") return true;
  if (isDirectionToken(token) && tokens[index - 1] === "DSNT") return true;
  return false;
}

function isKnownMetarToken(token, index, tokens) {
  if (isCommonAviationToken(token)) return true;
  if (isWeatherToken(token)) return true;
  if (/^(METAR|SPECI|AUTO|COR|RMK|CAVOK|NIL)$/.test(token)) return true;
  if (/^(AO1|AO2|TSNO|FZRANO|\$)$/.test(token)) return true;
  if (/^SLP\d{3}$/.test(token)) return true;
  if (/^T[01]\d{3}[01]\d{3}$/.test(token)) return true;
  if (/^P\d{4}$/.test(token)) return true;
  if (/^6\d{4}$/.test(token)) return true;
  if (/^1[01]\d{3}$/.test(token)) return true;
  if (/^2[01]\d{3}$/.test(token)) return true;
  if (/^5\d{4}$/.test(token)) return true;
  if (/^DZB\d{2}E\d{2}$/.test(token)) return true;
  if (/^RA(B|E)\d{2}(\d{2})?$/.test(token)) return true;
  if (token === "PK" || token === "WND") return true;
  if (/^\d{3}\d{2,3}\/?(\d{4})?$/.test(token) && (tokens[index - 1] === "WND" || tokens[index - 2] === "PK")) return true;
  if (token === "LTG" || token === "DSNT") return true;
  if (isDirectionToken(token) && tokens[index - 1] === "DSNT") return true;
  return false;
}

function isCommonAviationToken(token) {
  return /^[A-Z0-9]{4}$/.test(token)
    || /^\d{6}Z$/.test(token)
    || /^(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT$/.test(token)
    || token === "P6SM"
    || /^\d{1,2}(?:\/\d)?SM$/.test(token)
    || /^\d{4}$/.test(token)
    || /^R\d{2}[LCR]?\/[PM]?\d{4}V?[PM]?\d{4}FT$/.test(token)
    || /^(FEW|SCT|BKN|OVC|VV)\d{3}(CB|TCU)?$/.test(token)
    || /^(CLR|SKC)$/.test(token)
    || /^(M?\d{2}|M)\/(M?\d{2}|M|M?\/\/)$/.test(token)
    || /^A\d{4}$/.test(token)
    || /^Q\d{4}$/.test(token);
}

function describeUndecodedToken(token, reportType) {
  const reportName = reportType === "taf" ? "TAF" : "METAR";
  if (/^\d+$/.test(token)) {
    return `${token}: encoded numeric/system group retained for reference.`;
  }
  if (/^[A-Z0-9/+-]+$/.test(token)) {
    return `${token}: encoded ${reportName} group retained for reference; this trainer does not have a plain-language decode for it yet.`;
  }
  return `${token}: unrecognized ${reportName} token retained for reference.`;
}

function decodeObservedTime(token) {
  return `${token.slice(0, 2)} ${token.slice(2, 4)}${token.slice(4, 6)}Z`;
}

function decodeTempDewpoint(token) {
  const [temperature, dewpoint] = token.split("/");
  const decodedTemp = temperature === "M" ? "not reported" : `${decodeSignedTemp(temperature)}C`;
  const decodedDewpoint = dewpoint.includes("//") || dewpoint === "M" ? "not reported" : `${decodeSignedTemp(dewpoint)}C`;
  return `Temperature ${decodedTemp}, dewpoint ${decodedDewpoint}.`;
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
  if (match[1] === "00000KT") return "Calm.";
  const direction = match[1].startsWith("VRB") ? "variable" : `${match[1].slice(0, 3)} degrees`;
  const speed = Number(match[2]);
  const gust = match[3] ? `, gusting ${Number(match[3])} kt` : "";
  return `${direction} at ${speed} kt${gust}.`;
}

function decodeVisibilityToken(tokens) {
  const token = tokens.find((item) => item === "P6SM" || /^\d{1,2}(?:\/\d)?SM$/.test(item) || /^\d{4}$/.test(item));
  if (!token) return null;
  if (token === "P6SM") return "Greater than 6 statute miles.";
  if (/^\d{4}$/.test(token)) {
    return token === "9999" ? "Unlimited." : `${Number(token).toLocaleString("en-US")} meters, equivalent to ${metersToStatuteMiles(Number(token)).toFixed(1)} statute miles.`;
  }
  return `${token.replace("SM", "")} statute miles.`;
}

function decodeRvrTokens(tokens) {
  return tokens
    .filter((token) => /^R\d{2}[LCR]?\/[PM]?\d{4}V?[PM]?\d{4}FT$/.test(token))
    .map((token) => {
      const match = token.match(/^R(\d{2}[LCR]?)\/([PM]?\d{4})(?:V([PM]?\d{4}))FT$/);
      if (!match) return token;
      const decodeValue = (value) => `${value.startsWith("P") ? "greater than " : value.startsWith("M") ? "less than " : ""}${Number(value.replace(/^[PM]/, "")).toLocaleString("en-US")} ft`;
      return `Runway ${match[1]} RVR ${decodeValue(match[2])}${match[3] ? ` variable to ${decodeValue(match[3])}` : ""}.`;
    });
}

function metersToStatuteMiles(meters) {
  return Math.round((meters / 1609.344) * 10) / 10;
}

function decodeWeatherTokens(tokens) {
  return tokens
    .filter(isWeatherToken)
    .map(decodeWeatherToken);
}

function isWeatherToken(token) {
  if (!/^[-+]?[A-Z]{2,}$/.test(token)) return false;
  if (/^(METAR|SPECI|AUTO|COR|RMK|QNH|LAST|NEXT|AFT|NIL|SKC|CLR)$/.test(token)) return false;
  if (/^[A-Z0-9]{4}$/.test(token)) return false;
  if (/^(FEW|SCT|BKN|OVC|VV)\d{3}/.test(token)) return false;
  const clean = token.replace(/^[-+]/, "");
  if (clean === "NSW") return true;
  return /^(VC)?(MI|PR|BC|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)+$/.test(clean);
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
    if (token === "FZRANO") remarks.push("Freezing rain sensor not available.");
    if (token === "LTG" && tokens[index + 1] === "DSNT") remarks.push(`Lightning distant ${decodeDirection(tokens[index + 2] || "")}.`);
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
    const maxTemp = token.match(/^1(0|1)(\d{3})$/);
    if (maxTemp) remarks.push(`Six-hour maximum temperature ${decodeTenthsTemp(maxTemp[1], maxTemp[2])}C.`);
    const minTemp = token.match(/^2(0|1)(\d{3})$/);
    if (minTemp) remarks.push(`Six-hour minimum temperature ${decodeTenthsTemp(minTemp[1], minTemp[2])}C.`);
    const pressureTendency = token.match(/^5(\d)(\d{3})$/);
    if (pressureTendency) remarks.push(`Three-hour pressure tendency code ${pressureTendency[1]}, change ${Number(pressureTendency[2]) / 10} hPa.`);
    if (/^DZB\d{2}E\d{2}$/.test(token)) remarks.push(`Drizzle began and ended during the hour: ${token}.`);
    const rainEvent = token.match(/^RA(B|E)(\d{2})(\d{2})?$/);
    if (rainEvent) remarks.push(`Rain ${rainEvent[1] === "B" ? "began" : "ended"} at ${rainEvent[2]}${rainEvent[3] || ""}Z.`);
    if (/^TSNO$/.test(token)) remarks.push("Thunderstorm information not available.");
    if (token === "FZRANO") remarks.push("Freezing rain sensor not available.");
    if (token === "LTG" && rmk[index + 1] === "DSNT") remarks.push(`Lightning distant ${decodeDirection(rmk[index + 2] || "")}.`);
    if (token === "$") remarks.push("Automated station maintenance check indicator.");
    if (token === "PK" && rmk[index + 1] === "WND") remarks.push(decodePeakWind(rmk[index + 2], rmk[index + 3]));
  });
  return remarks.length ? remarks : [`Raw remarks: ${rmk.join(" ")}.`];
}

function decodePeakWind(wind, time) {
  const match = String(wind || "").match(/^(\d{3})(\d{2,3})\/?(\d{4})?$/);
  if (!match) return `Peak wind ${wind || ""} ${time || ""}.`.trim();
  const timeToken = match[3] || (/^\d{4}$/.test(time || "") ? time : "");
  return `Peak wind ${match[1]} degrees at ${Number(match[2])} kt${timeToken ? ` at ${timeToken}Z` : ""}.`;
}

function decodeDirection(value) {
  const directions = { N: "north", NE: "northeast", E: "east", SE: "southeast", S: "south", SW: "southwest", W: "west", NW: "northwest" };
  return directions[value] || value || "direction not reported";
}

function isDirectionToken(value) {
  return /^(N|NE|E|SE|S|SW|W|NW)$/.test(value);
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

function getMetarObservedAt(metar, referenceValue) {
  const token = String(metar || "").match(/\b(\d{2})(\d{2})(\d{2})Z\b/);
  if (!token) return null;
  const reference = new Date(referenceValue);
  const observed = new Date(Date.UTC(
    reference.getUTCFullYear(),
    reference.getUTCMonth(),
    Number(token[1]),
    Number(token[2]),
    Number(token[3])
  ));
  const diff = observed - reference;
  if (diff > 15 * 24 * 60 * 60 * 1000) observed.setUTCMonth(observed.getUTCMonth() - 1);
  if (diff < -15 * 24 * 60 * 60 * 1000) observed.setUTCMonth(observed.getUTCMonth() + 1);
  return observed;
}

function getTafValidityWindow(tafRaw, referenceValue) {
  const valid = String(tafRaw || "").match(/\b(\d{4})\/(\d{4})\b/);
  if (!valid) return null;
  return tafWindowToDates(valid[1], valid[2], new Date(referenceValue));
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
