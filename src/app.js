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
  alternates: defaultAlternates,
  diceRegions: { conus: true, oconus: true },
  assistDefault: true
};
const missionDefaultsStorageKey = "alternateWatchMissionDefaults";
const airfieldHistoryStorageKey = "alternateWatchAirfieldHistory";
let nowReferenceTimer = null;
let globalAssistEnabled = true;
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
let weatherCapabilitySets = null;
const scenarioHistory = [];

init();

function init() {
  setDefaultTimes();
  setupNowReference();
  setupBrandAnimation();
  registerServiceWorker();
  render();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    updateZuluDateTimeReadouts();
    await render(true);
  });
  setupZuluDateTimeControls();
  setupAlternateListInput("#alternates", updateAlternatesCount);
  setupAlternateListInput("#default-alternates", updateDefaultAlternatesCount);
  document.querySelector("#takeoff-plus-one").addEventListener("click", () => {
    addHoursToZuluDateTimeField("takeoffDateTime", 1);
  });
  document.querySelector("#landing-plus-one").addEventListener("click", () => {
    addHoursToZuluDateTimeField("landingDateTime", 1);
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
  setupRiskDiceAttention();
  document.querySelector("#rulebook-toggle").addEventListener("click", toggleRulebook);
  document.querySelector("#rulebook-close").addEventListener("click", closeRulebook);
  document.querySelector("#defaults-toggle").addEventListener("click", toggleDefaultsPanel);
  document.querySelector("#defaults-close").addEventListener("click", closeDefaultsPanel);
  document.querySelector("#defaults-use-current").addEventListener("click", populateDefaultsFromCurrent);
  document.querySelector("#defaults-factory").addEventListener("click", populateFactoryDefaults);
  document.querySelector("#defaults-save").addEventListener("click", saveDefaultsFromPanel);
  document.querySelector("#flight-time-pill").addEventListener("click", toggleSortieDurationPanel);
  document.querySelector("#sortie-duration-close").addEventListener("click", closeSortieDurationPanel);
  document.querySelector("#sortie-duration-apply").addEventListener("click", applySortieDurationFromPanel);
  document.querySelector("#sortie-duration-plus-two").addEventListener("click", () => setSortieDurationPreset(120));
  document.querySelector("#sortie-duration-plus-four").addEventListener("click", () => setSortieDurationPreset(240));
  document.querySelector("#sortie-duration-input").addEventListener("keydown", handleSortieDurationKeydown);
  document.querySelector("#visibility-table-close").addEventListener("click", closeVisibilityTable);
  document.querySelector("#wind-table-close").addEventListener("click", closeWindTable);
  setupDiceRegionToggles();
  setupAssistDefaultToggles();
  setupDefaultsKeyboardFlow();
  setupAirfieldSearch();
  resetPracticeWeatherButton();
  updateAlternatesCount();
  document.querySelector("#expand-all").addEventListener("click", (event) => {
    setAllCardsOpen(true);
    event.currentTarget.blur();
  });
  document.querySelector("#collapse-all").addEventListener("click", (event) => {
    setAllCardsOpen(false);
    event.currentTarget.blur();
  });
  filterButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const scrollY = window.scrollY;
      currentFilter = currentFilter === button.dataset.filter ? "all" : button.dataset.filter;
      updateFilterButtons();
      renderCards();
      button.blur();
      window.setTimeout(() => button.blur(), 0);
      window.setTimeout(() => button.blur(), 450);
      window.requestAnimationFrame(() => window.scrollTo(0, scrollY));
    });
  });
  document.querySelectorAll("button").forEach((element) => {
    element.addEventListener("click", addTapFeedback);
  });
  banner.addEventListener("click", handleSummaryIssueClick);
  banner.addEventListener("keydown", handleSummaryIssueKeydown);
  cards.addEventListener("click", handleWeatherSourceClick);
  cards.addEventListener("keydown", handleWeatherSourceKeydown);
  cards.addEventListener("click", handleAssistToggle);
  cards.addEventListener("click", handleTafEvalClick);
  cards.addEventListener("keydown", handleTafEvalKeydown);
  cards.addEventListener("click", handleTafValidityClick);
  cards.addEventListener("keydown", handleTafValidityKeydown);
  cards.addEventListener("click", handleMetarAgeClick);
  cards.addEventListener("keydown", handleMetarAgeKeydown);
  cards.addEventListener("click", handleConversionTableClick);
  cards.addEventListener("keydown", handleConversionTableKeydown);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeRulebook();
      closeDefaultsPanel();
      closeSortieDurationPanel();
      closeVisibilityTable();
      closeWindTable();
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
      const searchPanel = document.querySelector("#airfield-search-panel");
      const clickedSearchPanel = searchPanel && searchPanel.contains(event.target);
      if (!panel.contains(event.target) && !toggle.contains(event.target) && !clickedSearchPanel) closeDefaultsPanel();
    }
    if (document.body.classList.contains("sortie-duration-open")) {
      const panel = document.querySelector("#sortie-duration-panel");
      const toggle = document.querySelector("#flight-time-pill");
      if (!panel.contains(event.target) && !toggle.contains(event.target)) closeSortieDurationPanel();
    }
    if (document.body.classList.contains("visibility-table-open")) {
      const panel = document.querySelector("#visibility-table-panel");
      const clickedTrigger = event.target.closest(".conversion-table-button");
      if (!panel.contains(event.target) && !clickedTrigger) closeVisibilityTable();
    }
    if (document.body.classList.contains("wind-table-open")) {
      const panel = document.querySelector("#wind-table-panel");
      const clickedTrigger = event.target.closest(".conversion-table-button");
      if (!panel.contains(event.target) && !clickedTrigger) closeWindTable();
    }
    if (document.body.classList.contains("search-open")) {
      const panel = document.querySelector("#airfield-search-panel");
      const toggles = [...document.querySelectorAll(".search-button")];
      const clickedToggle = toggles.some((toggle) => toggle.contains(event.target));
      if (!panel.contains(event.target) && !clickedToggle) closeAirfieldSearch();
    }
  });
}

function setupNowReference() {
  window.clearTimeout(nowReferenceTimer);
  const tick = () => {
    updateNowReference();
    const now = new Date();
    const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 50;
    nowReferenceTimer = window.setTimeout(tick, msUntilNextMinute);
  };
  tick();
}

function updateNowReference() {
  const element = document.querySelector("#now-reference");
  if (!element) return;
  const now = new Date();
  element.textContent = formatNowReference(now);
  updatePulledAtHeader(now);
  updateMetarAgeBadges(now);
  updateEvaluationDeltaBadges(now);
  updateTafValidityBadges(now);
  updateTafEvalBadges();
  updateLiveTafTimeChips();
  updateDecisionBanner(now);
  updateZuluDateTimeReadouts(now);
}

function setupBrandAnimation() {
  const brandRow = document.querySelector(".brand-row");
  const brandLink = document.querySelector(".brand-link");
  const title = document.querySelector("#app-title");
  const fireButton = document.querySelector("#brand-fire-button");
  if (!brandRow || !brandLink || !title) return;
  let isBrandAnimating = false;

  const playBrandAnimation = () => {
    if (isBrandAnimating) return;
    isBrandAnimating = true;
    brandRow.classList.remove("brand-animate");
    void brandRow.offsetWidth;
    brandRow.classList.add("brand-animate");
    window.setTimeout(() => {
      isBrandAnimating = false;
      brandRow.classList.remove("brand-animate");
    }, 1050);
  };

  brandLink.addEventListener("mouseenter", playBrandAnimation);
  brandLink.addEventListener("focus", playBrandAnimation);
  fireButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    playBrandAnimation();
    event.currentTarget.blur();
  });
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
  document.querySelector("#takeoffDateTime").value = formatZuluDateTimeInput(takeoff);
  document.querySelector("#landingDateTime").value = formatZuluDateTimeInput(landing);
  document.querySelector("#alternates").value = defaults.alternates;
  updateZuluDateTimeReadouts();
  updateAlternatesCount();
}

function clearMissionInputs() {
  document.querySelector("#departure").value = "";
  document.querySelector("#destination").value = "";
  document.querySelector("#takeoffDateTime").value = "";
  document.querySelector("#landingDateTime").value = "";
  document.querySelector("#alternates").value = "";
  updateZuluDateTimeReadouts();
  updateAlternatesCount();
}

function generateRandomMission() {
  missionNotice = "";
  const [departure, destination, alternate] = pickUnique(getDiceAirfieldPool(), 3);
  const { takeoff, landing } = getDiceMissionTimes();
  applyMissionFields(departure, destination, [alternate], takeoff, landing);
}

function getDiceMissionTimes() {
  const now = new Date();
  return {
    takeoff: now,
    landing: new Date(now.getTime() + 3 * 60 * 60 * 1000)
  };
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

    await render({ showSubmitFeedback: true, preserveButtonMessage: true });
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      await render({ preserveButtonMessage: true });
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
    const { takeoff, landing } = getDiceMissionTimes();
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
      missionNotice = selected.count === 3 ? "" : `Only found ${selected.count}/3 red-weather fields.`;
    } else if (lastLiveRedPractice) {
      selected = lastLiveRedPractice;
      missionDataOverride = null;
      missionNotice = "Last red-weather practice reused.";
    } else {
      const practiceData = getRedPracticeMissionData();
      selected = findRedPracticeSelection(practiceData, takeoff, landing, Object.keys(practiceData.airports));
      selected.sample = true;
      missionDataOverride = practiceData;
      missionNotice = "Sample red-weather practice loaded.";
    }

    pushScenarioHistory(previousInputs);
    applyMissionFields(selected.departure, selected.destination, [selected.alternate], takeoff, landing);
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      return;
    }
    await render({ showSubmitFeedback: false, preserveButtonMessage: true });
    if (!isActiveDiceAction(action)) {
      setRawInputValues(previousInputs);
      scenarioHistory.pop();
      updatePreviousScenarioButton();
      await render({ preserveButtonMessage: true });
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

function setupRiskDiceAttention() {
  const button = document.querySelector("#practice-weather");
  if (!button || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  button.classList.add("dice-on-fire");
  window.setTimeout(() => button.classList.add("dice-fire-fade"), 2400);
  window.setTimeout(() => button.classList.remove("dice-on-fire", "dice-fire-fade"), 3200);
}

function getRawInputValues() {
  return {
    departure: document.querySelector("#departure").value,
    destination: document.querySelector("#destination").value,
    takeoffDateTime: document.querySelector("#takeoffDateTime").value,
    landingDateTime: document.querySelector("#landingDateTime").value,
    alternates: document.querySelector("#alternates").value
  };
}

function setRawInputValues(values) {
  document.querySelector("#departure").value = values.departure;
  document.querySelector("#destination").value = values.destination;
  document.querySelector("#takeoffDateTime").value = values.takeoffDateTime || "";
  document.querySelector("#landingDateTime").value = values.landingDateTime || "";
  document.querySelector("#alternates").value = values.alternates;
  updateZuluDateTimeReadouts();
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
  document.querySelector("#takeoffDateTime").value = formatZuluDateTimeInput(takeoff);
  document.querySelector("#landingDateTime").value = formatZuluDateTimeInput(eta);
  document.querySelector("#alternates").value = alternates.join(", ");
  updateZuluDateTimeReadouts();
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

async function render(options = false) {
  const renderOptions = typeof options === "boolean"
    ? { showSubmitFeedback: options, preserveButtonMessage: false }
    : { showSubmitFeedback: false, preserveButtonMessage: false, ...options };
  const inputs = getInputs();
  if (!renderOptions.preserveButtonMessage) setSubmitButtonStatus("searching");
  const missionData = missionDataOverride || await getLiveMissionData(getRequestedIcaos(inputs));
  if (missionDataOverride) {
    rulesMetadata.weatherSource = "Practice";
    missionDataOverride = null;
  }
  latestEvaluation = evaluateMission(inputs, missionData);

  caoDate.textContent = `CAO ${formatCaoDate(rulesMetadata.caoDate)}`;
  updatePulledAtHeader();
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

  updateDecisionBanner();

  renderCards();
  updateFilterButtons();
  updateFilterCounts();
  if (renderOptions.showSubmitFeedback) {
    setSubmitButtonStatus(rulesMetadata.weatherSource === "AWC" ? "success" : "unable");
  } else if (!renderOptions.preserveButtonMessage) {
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

function renderDecisionBanner(referenceDate = new Date()) {
  const status = getDecisionBannerStatus(referenceDate);
  const items = getDecisionBannerItems(referenceDate);
  if (status === "green") {
    return `
      <p class="decision-label">${latestEvaluation.summary.label}</p>
      <h2>${latestEvaluation.summary.headline}</h2>
      <p class="alternate-required">Alternate Required: <strong>${latestEvaluation.alternateRequired ? "Yes" : "No"}</strong></p>
    `;
  }

  const itemMarkup = items.map((item) => `
    <div class="summary-issue">
      <span class="summary-icao" role="button" tabindex="0" data-summary-icao="${escapeHtml(item.icao)}">${escapeHtml(item.icao)}</span>
      ${item.chips.map((chip) => renderIssueChip(markAssistChip(chip), item.icao)).join("")}
    </div>
  `).join("");

  return `
    <p class="decision-label">${globalAssistEnabled ? (latestEvaluation.summary.status === "green" ? "Watch Item" : latestEvaluation.summary.label) : "Review Items"}${globalAssistEnabled ? "" : ` <span class="assist-off-pill">Assist Off</span>`}</p>
    <div class="summary-issues">${itemMarkup}</div>
    <button type="button" class="assist-toggle summary-assist-toggle${globalAssistEnabled ? " active" : ""}" data-summary-assist-toggle="true" aria-pressed="${globalAssistEnabled ? "true" : "false"}" aria-label="Toggle all weather assist highlights" title="Toggle all weather assist highlights">✦</button>
  `;
}

function updateDecisionBanner(referenceDate = new Date()) {
  if (!latestEvaluation) return;
  const status = getDecisionBannerStatus(referenceDate);
  banner.className = `decision-banner status-${status}${globalAssistEnabled ? "" : " assist-off"}`;
  banner.dataset.status = status;
  banner.tabIndex = -1;
  banner.setAttribute("role", "status");
  banner.setAttribute(
    "aria-label",
    "Mission summary"
  );
  banner.innerHTML = renderDecisionBanner(referenceDate);
}

function getDecisionBannerStatus(referenceDate = new Date()) {
  const liveStatus = getLiveTafSummaryItems(referenceDate).reduce((current, item) => {
    const itemStatus = item.chips.reduce((chipStatus, chip) =>
      STATUS_RANK[chip.status] > STATUS_RANK[chipStatus] ? chip.status : chipStatus
    , "green");
    return STATUS_RANK[itemStatus] > STATUS_RANK[current] ? itemStatus : current;
  }, "green");
  return STATUS_RANK[liveStatus] > STATUS_RANK[latestEvaluation.summary.status] ? liveStatus : latestEvaluation.summary.status;
}

function getDecisionBannerItems(referenceDate = new Date()) {
  const items = (latestEvaluation.summary.items || []).map((item) => ({
    icao: item.icao,
    chips: [...(item.chips || [])]
  }));
  getLiveTafSummaryItems(referenceDate).forEach((liveItem) => {
    const existing = items.find((item) => item.icao === liveItem.icao);
    if (existing) {
      liveItem.chips.forEach((chip) => {
        if (!existing.chips.some((existingChip) => existingChip.label === chip.label)) existing.chips.push(chip);
      });
    } else {
      items.push(liveItem);
    }
  });
  return items;
}

function getLiveTafSummaryItems(referenceDate = new Date()) {
  if (!latestEvaluation) return [];
  return latestEvaluation.results
    .map((result) => ({
      icao: result.icao,
      chips: getLiveTafTimeChips(result, referenceDate)
    }))
    .filter((item) => item.chips.length);
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
  window.setTimeout(() => {
    target.classList.remove("tap-glow");
    if (typeof target.blur === "function") target.blur();
  }, 420);
}

function handleSummaryIssueClick(event) {
  const assist = event.target.closest("[data-summary-assist-toggle]");
  if (assist) {
    event.stopPropagation();
    toggleGlobalAssist();
    return;
  }
  const icao = event.target.closest("[data-summary-icao]");
  if (icao) {
    event.stopPropagation();
    scrollToAirfieldCard(icao.dataset.summaryIcao);
    return;
  }
  const chip = event.target.closest("[data-issue-icao]");
  if (!chip) return;
  event.stopPropagation();
  scrollToIssue(chip.dataset.issueIcao, chip.dataset.issueLabel, chip.dataset.issueStatus);
}

function handleSummaryIssueKeydown(event) {
  const assist = event.target.closest("[data-summary-assist-toggle]");
  if (assist && ["Enter", " "].includes(event.key)) {
    event.preventDefault();
    toggleGlobalAssist();
    return;
  }
  const icao = event.target.closest("[data-summary-icao]");
  if (icao && ["Enter", " "].includes(event.key)) {
    event.preventDefault();
    scrollToAirfieldCard(icao.dataset.summaryIcao);
    return;
  }
  const chip = event.target.closest("[data-issue-icao]");
  if (!chip || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  scrollToIssue(chip.dataset.issueIcao, chip.dataset.issueLabel, chip.dataset.issueStatus);
}

function toggleGlobalAssist() {
  globalAssistEnabled = !globalAssistEnabled;
  document.querySelectorAll(".result-card").forEach((card) => {
    card.classList.toggle("assist-off", !globalAssistEnabled);
    const button = card.querySelector("[data-assist-toggle]");
    button?.classList.toggle("active", globalAssistEnabled);
    button?.setAttribute("aria-pressed", String(globalAssistEnabled));
  });
  updateDecisionBanner();
}

function scrollToAirfieldCard(icao) {
  if (currentFilter !== "all") {
    currentFilter = "all";
    updateFilterButtons();
    renderCards();
  }

  const card = document.querySelector(`.result-card[data-icao="${icao}"]`);
  if (!card) return;
  const details = card.querySelector(".card-disclosure");
  if (details) details.open = true;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusClass = card.classList.contains("status-red")
    ? "scroll-focus-red"
    : card.classList.contains("status-yellow")
      ? "scroll-focus-yellow"
      : "scroll-focus-green";
  card.classList.add("scroll-focus", focusClass);
  window.setTimeout(() => card.classList.remove("scroll-focus", focusClass), 1400);
}

function scrollToIssue(icao, label, status = "") {
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
  const focusClass = getIssueFocusClass(label, status);
  target.classList.add("scroll-focus", focusClass);
  window.setTimeout(() => target.classList.remove("scroll-focus", focusClass), 1400);
}

function findIssueTarget(card, label) {
  const normalizedLabel = label.toUpperCase();
  if (normalizedLabel.includes("CEILING")) return card.querySelector(".wx-grid div:nth-child(1)");
  if (normalizedLabel.includes("VIS")) return card.querySelector(".wx-grid div:nth-child(2)");
  if (normalizedLabel.includes("WIND")) return card.querySelector(".wx-grid div:nth-child(3)");
  if (normalizedLabel.includes("CLOSED") || normalizedLabel.includes("NOTAM")) return card.querySelector(".notam-closed, .notam-limiting");
  if (normalizedLabel.includes("OCONUS")) return [...card.querySelectorAll(".issue-chip")].find((chip) => chip.textContent.trim().toUpperCase() === "OCONUS");
  return null;
}

function getIssueFocusClass(label, status = "") {
  if (status === "red") return "scroll-focus-red";
  if (status === "yellow") return "scroll-focus-yellow";
  if (status === "green") return "scroll-focus-green";
  const normalizedLabel = label.toUpperCase();
  if (normalizedLabel.includes("LOW") || normalizedLabel.includes("CLOSED") || normalizedLabel.includes("OCONUS")) {
    return "scroll-focus-red";
  }
  if (normalizedLabel.includes("NOTAM") || normalizedLabel.includes("DATA")) {
    return "scroll-focus-yellow";
  }
  return "scroll-focus-green";
}

function handleWeatherSourceClick(event) {
  const tile = event.target.closest("[data-source-kind]");
  if (!tile) return;
  event.stopPropagation();
  jumpToWeatherSource(tile);
}

function handleWeatherSourceKeydown(event) {
  const tile = event.target.closest("[data-source-kind]");
  if (!tile || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  jumpToWeatherSource(tile);
}

function handleAssistToggle(event) {
  const button = event.target.closest("[data-assist-toggle]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  const card = button.closest(".result-card");
  if (!card) return;
  const enabled = card.classList.toggle("assist-off") === false;
  button.classList.toggle("active", enabled);
  button.setAttribute("aria-pressed", String(enabled));
  button.blur();
}

function jumpToWeatherSource(tile) {
  const card = tile.closest(".result-card");
  if (!card) return;
  const details = card.querySelector(".card-disclosure");
  if (details) details.open = true;

  const sourceKey = tile.dataset.sourceKey;
  const kind = tile.dataset.sourceKind;
  const status = tile.dataset.sourceStatus || "green";
  const line = card.querySelector(`.taf-decode-row[data-taf-key="${sourceKey}"]`)
    || findTafSourceLine(card, sourceKey)
    || card.querySelector(".taf-decode-row.taf-applicable, .taf-decode-row.taf-window");
  if (!line) return;

  line.scrollIntoView({ behavior: "smooth", block: "center" });
  const focusClass = getIssueFocusClass("", status);
  const sourceFocusClass = `source-focus-${status}`;
  line.classList.add("source-focus", sourceFocusClass);
  line.querySelectorAll(`.taf-source-${kind}`).forEach((token) => token.classList.add("taf-source-focus", focusClass));
  window.setTimeout(() => {
    line.classList.remove("source-focus", sourceFocusClass);
    line.querySelectorAll(".taf-source-focus").forEach((token) => token.classList.remove("taf-source-focus", focusClass));
  }, 1800);
}

function findTafSourceLine(card, sourceKey) {
  const source = decodeTafKey(sourceKey);
  if (!source) return null;
  return [...card.querySelectorAll(".taf-decode-row")].find((line) => {
    const renderedLine = decodeTafKey(line.dataset.tafKey);
    return renderedLine.includes(source) || source.includes(renderedLine);
  }) || null;
}

function decodeTafKey(value) {
  try {
    return decodeURIComponent(String(value || "")).replace(/\s+/g, " ").trim();
  } catch (error) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
}

function handleTafEvalClick(event) {
  const pill = event.target.closest("[data-taf-eval]");
  if (!pill) return;
  event.preventDefault();
  event.stopPropagation();
  triggerPillFeedback(pill);
  pulseEvaluatedTafLines(pill);
}

function handleTafEvalKeydown(event) {
  const pill = event.target.closest("[data-taf-eval]");
  if (!pill || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  triggerPillFeedback(pill);
  pulseEvaluatedTafLines(pill);
}

function pulseEvaluatedTafLines(pill) {
  const card = pill.closest(".result-card");
  if (!card) return;
  if (pill.classList.contains("taf-eval-missing")) {
    pulseMissingEvalTafWindow(card);
    return;
  }
  const lines = [...card.querySelectorAll(".taf-decode-row.taf-applicable")];
  if (!lines.length) return;
  lines[0].scrollIntoView({ behavior: "smooth", block: "center" });
  const timeTokens = lines.flatMap((line) => [...line.querySelectorAll(".taf-source-time")]);
  const focusClass = "eval-time-token-green";
  timeTokens.forEach((token) => token.classList.remove("eval-time-token-focus", "eval-time-token-red", "eval-time-token-yellow", "eval-time-token-green"));
  void lines[0].offsetWidth;
  timeTokens.forEach((token) => token.classList.add("eval-time-token-focus", focusClass));
  window.setTimeout(() => {
    timeTokens.forEach((token) => token.classList.remove("eval-time-token-focus", focusClass));
  }, 1500);
}

function pulseMissingEvalTafWindow(card) {
  const firstLine = card.querySelector(".taf-decode-row");
  if (!firstLine) return;
  const timeTokens = [...firstLine.querySelectorAll(".taf-source-time")];
  const token = timeTokens.find((item) => item.textContent.includes("/")) || timeTokens[0];
  if (!token) return;
  token.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  token.classList.remove("eval-time-token-focus", "eval-time-token-red", "eval-time-token-yellow", "eval-time-token-green");
  void token.offsetWidth;
  token.classList.add("eval-time-token-focus", "eval-time-token-red");
  window.setTimeout(() => token.classList.remove("eval-time-token-focus", "eval-time-token-red"), 1500);
}

function handleTafValidityClick(event) {
  const pill = event.target.closest("[data-taf-validity]");
  if (!pill) return;
  event.preventDefault();
  event.stopPropagation();
  triggerPillFeedback(pill);
  pulseTafValidityToken(pill);
}

function handleTafValidityKeydown(event) {
  const pill = event.target.closest("[data-taf-validity]");
  if (!pill || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  pulseTafValidityToken(pill);
}

function pulseTafValidityToken(pill) {
  const card = pill.closest(".result-card");
  if (!card) return;
  const firstLine = card.querySelector(".taf-decode-row");
  if (!firstLine) return;
  const token = [...firstLine.querySelectorAll(".taf-source-time")].find((item) => item.textContent.includes("/"))
    || firstLine.querySelector(".taf-source-time");
  if (!token) return;
  token.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  const focusClass = pill.classList.contains("age-red")
    ? "eval-time-token-red"
    : pill.classList.contains("age-yellow")
      ? "eval-time-token-yellow"
      : "eval-time-token-green";
  token.classList.remove("eval-time-token-focus", "eval-time-token-red", "eval-time-token-yellow", "eval-time-token-green");
  void token.offsetWidth;
  token.classList.add("eval-time-token-focus", focusClass);
  window.setTimeout(() => token.classList.remove("eval-time-token-focus", focusClass), 1500);
}

function handleMetarAgeClick(event) {
  const pill = event.target.closest("[data-metar-age]");
  if (!pill) return;
  event.preventDefault();
  event.stopPropagation();
  triggerPillFeedback(pill);
  pulseMetarObservedToken(pill);
}

function handleMetarAgeKeydown(event) {
  const pill = event.target.closest("[data-metar-age]");
  if (!pill || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  pulseMetarObservedToken(pill);
}

function pulseMetarObservedToken(pill) {
  const card = pill.closest(".result-card");
  if (!card) return;
  const token = card.querySelector(".metar-source-time");
  if (!token) return;
  token.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
  const focusClass = pill.classList.contains("age-red")
    ? "eval-time-token-red"
    : pill.classList.contains("age-yellow")
      ? "eval-time-token-yellow"
      : "eval-time-token-green";
  token.classList.remove("eval-time-token-focus", "eval-time-token-red", "eval-time-token-yellow", "eval-time-token-green");
  void token.offsetWidth;
  token.classList.add("eval-time-token-focus", focusClass);
  window.setTimeout(() => token.classList.remove("eval-time-token-focus", focusClass), 1500);
}

function triggerPillFeedback(pill) {
  pill.classList.remove("tap-glow");
  void pill.offsetWidth;
  pill.classList.add("tap-glow");
  pill.blur();
  window.setTimeout(() => pill.classList.remove("tap-glow"), 420);
}

function getInputs() {
  const takeoffTime = buildZuluDateTimeIso(document.querySelector("#takeoffDateTime").value);
  const landingTime = buildZuluDateTimeIso(document.querySelector("#landingDateTime").value);
  return {
    departure: normalizeIcao(document.querySelector("#departure").value),
    destination: normalizeIcao(document.querySelector("#destination").value),
    takeoffTime,
    landingTime,
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

function setupZuluDateTimeControls() {
  ["takeoffDateTime", "landingDateTime"].forEach((fieldId) => {
    document.querySelector(`#${fieldId}`).addEventListener("input", updateZuluDateTimeReadouts);
    document.querySelector(`#${fieldId}`).addEventListener("change", updateZuluDateTimeReadouts);
  });
  updateZuluDateTimeReadouts();
}

function setZuluDateTimeOffset(fieldId, hours) {
  const target = new Date(Date.now() + hours * 60 * 60 * 1000);
  document.querySelector(`#${fieldId}`).value = formatZuluDateTimeInput(target);
  updateZuluDateTimeReadouts();
}

function addHoursToZuluDateTimeField(fieldId, hours) {
  const currentIso = buildZuluDateTimeIso(document.querySelector(`#${fieldId}`).value);
  const target = new Date(new Date(currentIso).getTime() + hours * 60 * 60 * 1000);
  document.querySelector(`#${fieldId}`).value = formatZuluDateTimeInput(target);
  updateZuluDateTimeReadouts();
}

function updateZuluDateTimeReadouts(referenceDate = new Date()) {
  const pill = document.querySelector("#flight-time-pill");
  if (!pill) return;
  const duration = getFlightDurationState(
    document.querySelector("#takeoffDateTime").value,
    document.querySelector("#landingDateTime").value,
    referenceDate
  );
  pill.textContent = duration.label;
  pill.classList.toggle("flight-time-good", duration.status === "good");
  pill.classList.toggle("flight-time-bad", duration.status === "bad");
}

function toggleRulebook() {
  const panel = document.querySelector("#rulebook-panel");
  const button = document.querySelector("#rulebook-toggle");
  const isOpen = panel.hidden;
  if (isOpen) closeDefaultsPanel();
  if (isOpen) closeSortieDurationPanel();
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
    closeSortieDurationPanel();
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

function toggleSortieDurationPanel(event) {
  event?.stopPropagation();
  const panel = document.querySelector("#sortie-duration-panel");
  const button = document.querySelector("#flight-time-pill");
  const isOpen = panel.hidden;
  if (isOpen) {
    closeRulebook();
    closeDefaultsPanel();
    populateSortieDurationPanel();
  }
  panel.hidden = !isOpen;
  button.setAttribute("aria-expanded", String(isOpen));
  document.body.classList.toggle("sortie-duration-open", isOpen);
  if (isOpen) {
    window.setTimeout(() => {
      const input = document.querySelector("#sortie-duration-input");
      input.focus();
      input.select();
    }, 0);
  }
}

function closeSortieDurationPanel() {
  const panel = document.querySelector("#sortie-duration-panel");
  const button = document.querySelector("#flight-time-pill");
  panel.hidden = true;
  button.setAttribute("aria-expanded", "false");
  document.body.classList.remove("sortie-duration-open");
}

function openVisibilityTable() {
  closeRulebook();
  closeDefaultsPanel();
  closeSortieDurationPanel();
  closeWindTable();
  closeAirfieldSearch();
  const panel = document.querySelector("#visibility-table-panel");
  panel.hidden = false;
  document.body.classList.add("visibility-table-open");
}

function closeVisibilityTable() {
  const panel = document.querySelector("#visibility-table-panel");
  if (!panel) return;
  panel.hidden = true;
  document.body.classList.remove("visibility-table-open");
}

function openWindTable() {
  closeRulebook();
  closeDefaultsPanel();
  closeSortieDurationPanel();
  closeVisibilityTable();
  closeAirfieldSearch();
  const panel = document.querySelector("#wind-table-panel");
  panel.hidden = false;
  document.body.classList.add("wind-table-open");
}

function closeWindTable() {
  const panel = document.querySelector("#wind-table-panel");
  if (!panel) return;
  panel.hidden = true;
  document.body.classList.remove("wind-table-open");
}

function populateSortieDurationPanel() {
  const duration = getFlightDurationState(
    document.querySelector("#takeoffDateTime").value,
    document.querySelector("#landingDateTime").value,
    new Date()
  );
  document.querySelector("#sortie-duration-input").value = duration.label.startsWith("-") ? duration.label.slice(1) : duration.label;
}

function setSortieDurationPreset(minutes) {
  document.querySelector("#sortie-duration-input").value = formatDurationMinutes(minutes);
  applySortieDurationFromPanel();
}

function handleSortieDurationKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    applySortieDurationFromPanel();
  }
}

function applySortieDurationFromPanel() {
  const durationMinutes = parseDurationInput(document.querySelector("#sortie-duration-input").value);
  if (durationMinutes === null) return;
  const takeoffValue = document.querySelector("#takeoffDateTime").value || formatZuluDateTimeInput(new Date());
  document.querySelector("#takeoffDateTime").value = takeoffValue;
  const landing = new Date(new Date(buildZuluDateTimeIso(takeoffValue)).getTime() + durationMinutes * 60 * 1000);
  document.querySelector("#landingDateTime").value = formatZuluDateTimeInput(landing);
  updateZuluDateTimeReadouts();
  closeSortieDurationPanel();
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
    alternates: normalizeAlternates(defaults.alternates || appDefaultMission.alternates) || appDefaultMission.alternates,
    diceRegions: normalizeDiceRegions(defaults.diceRegions),
    assistDefault: defaults.assistDefault !== false
  };
}

function normalizeDiceRegions(regions) {
  const normalized = {
    conus: regions?.conus !== false,
    oconus: regions?.oconus !== false
  };
  if (!normalized.conus && !normalized.oconus) normalized.conus = true;
  return normalized;
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
  updateDefaultAlternatesCount();
  setDiceRegionButtons(normalized.diceRegions);
  setAssistDefaultButtons(normalized.assistDefault);
}

function populateDefaultsFromCurrent() {
  populateDefaultsPanel({
    departure: document.querySelector("#departure").value,
    destination: document.querySelector("#destination").value,
    alternates: document.querySelector("#alternates").value,
    diceRegions: getDiceRegionsFromButtons(),
    assistDefault: getAssistDefaultFromButtons()
  });
}

function populateFactoryDefaults() {
  populateDefaultsPanel(appDefaultMission);
}

function saveDefaultsFromPanel() {
  const defaults = normalizeMissionDefaults({
    departure: document.querySelector("#default-departure").value,
    destination: document.querySelector("#default-destination").value,
    alternates: document.querySelector("#default-alternates").value,
    diceRegions: getDiceRegionsFromButtons(),
    assistDefault: getAssistDefaultFromButtons()
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

function setupAssistDefaultToggles() {
  document.querySelector("#assist-default-toggle")?.addEventListener("click", () => {
    setAssistDefaultButtons(!getAssistDefaultFromButtons());
  });
}

function getAssistDefaultFromButtons() {
  return document.querySelector("#assist-default-toggle")?.getAttribute("aria-pressed") !== "false";
}

function setAssistDefaultButtons(enabled) {
  const button = document.querySelector("#assist-default-toggle");
  if (!button) return;
  const stateText = enabled ? "on" : "off";
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute("aria-label", `SIMBA assist default ${stateText}`);
  button.title = `SIMBA assist default ${stateText}`;
}

function setupDiceRegionToggles() {
  document.querySelectorAll(".region-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const next = {
        ...getDiceRegionsFromButtons(),
        [button.dataset.region]: button.getAttribute("aria-pressed") !== "true"
      };
      setDiceRegionButtons(normalizeDiceRegions(next));
    });
  });
}

function getDiceRegionsFromButtons() {
  return {
    conus: document.querySelector("#dice-conus-toggle")?.getAttribute("aria-pressed") === "true",
    oconus: document.querySelector("#dice-oconus-toggle")?.getAttribute("aria-pressed") === "true"
  };
}

function setDiceRegionButtons(regions) {
  const normalized = normalizeDiceRegions(regions);
  document.querySelector("#dice-conus-toggle")?.setAttribute("aria-pressed", String(normalized.conus));
  document.querySelector("#dice-oconus-toggle")?.setAttribute("aria-pressed", String(normalized.oconus));
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
  const searchableTargets = ["departure", "destination", "alternates", "default-departure", "default-destination", "default-alternates"];
  if (!searchableTargets.includes(target)) return;
  closeRulebook();
  if (!target.startsWith("default-")) closeDefaultsPanel();
  activeAirfieldTarget = target;

  const panel = document.querySelector("#airfield-search-panel");
  const input = document.querySelector("#airfield-search-input");
  document.querySelector("#airfield-search-title").textContent = getAirfieldSearchTitle(target);
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

function getAirfieldSearchTitle(target) {
  const titles = {
    departure: "Search Departure",
    destination: "Search Destination",
    alternates: "Search Alternates",
    "default-departure": "Search Default Departure",
    "default-destination": "Search Default Destination",
    "default-alternates": "Search Default Alternates"
  };
  return titles[target] || "Search Airfield";
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
    .map((record) => {
      const capability = getWeatherCapability(record.icao);
      return `
      <button type="button" class="airfield-result ${record.recent ? "airfield-result-history" : ""}" data-icao="${escapeHtml(record.icao)}" role="option">
        <span class="airfield-result-code">${escapeHtml(record.icao)}</span>
        <span class="airfield-result-name">${escapeHtml(record.name || record.icao)}</span>
        <span class="airfield-result-wx">
          <span class="wx-capability ${capability.metar ? "wx-capability-on" : "wx-capability-off"}">METAR</span>
          <span class="wx-capability ${capability.taf ? "wx-capability-on" : "wx-capability-off"}">TAF</span>
        </span>
      </button>
    `;
    })
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
      aliases: "",
      ...getWeatherCapability(icao)
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
      aliases: getAirfieldCityAlias(icao),
      ...getWeatherCapability(icao)
    });
  });

  airfieldSearchIndex = [...records.values()].sort((left, right) => left.icao.localeCompare(right.icao));
  return airfieldSearchIndex;
}

function getDiceAirfieldPool() {
  const knownTrainingFields = [...globalRandomMissionFields, ...globalPracticeWeatherFields];
  const regions = getMissionDefaults().diceRegions;
  const databaseFields = buildAirfieldSearchIndex()
    .filter((record) => ["large", "medium"].includes(record.type) && record.metar && record.taf)
    .filter((record) => diceRegionAllows(record.icao, regions))
    .map((record) => record.icao);
  return [...new Set([...knownTrainingFields, ...databaseFields])]
    .filter((icao) => /^[A-Z][A-Z0-9]{3}$/.test(icao))
    .filter((icao) => diceRegionAllows(icao, regions))
    .filter((icao) => {
      const capability = getWeatherCapability(icao);
      return capability.metar && capability.taf;
    });
}

function diceRegionAllows(icao, regions) {
  return isLikelyConus(icao) ? regions.conus : regions.oconus;
}

function getWeatherCapability(icao) {
  if (!weatherCapabilitySets) {
    const source = window.WEATHER_STATION_CAPABILITIES || {};
    weatherCapabilitySets = {
      metar: new Set(source.metar || []),
      taf: new Set(source.taf || [])
    };
  }
  return {
    metar: weatherCapabilitySets.metar.has(icao),
    taf: weatherCapabilitySets.taf.has(icao)
  };
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
  if (activeAirfieldTarget === "alternates" || activeAirfieldTarget === "default-alternates") {
    addAirfieldToCommaList(field, icao);
    if (activeAirfieldTarget === "alternates") updateAlternatesCount();
    if (activeAirfieldTarget === "default-alternates") updateDefaultAlternatesCount();
    document.querySelector("#airfield-search-input").value = "";
    renderAirfieldSearchResults();
    document.querySelector("#airfield-search-input").focus();
    return;
  }
  field.value = icao;
  closeAirfieldSearch();
  field.focus();
}

function addAirfieldToCommaList(field, icao) {
  const alternates = parseAlternateList(field.value);
  if (!alternates.includes(icao)) alternates.push(icao);
  field.value = alternates.join(", ");
}

function setupAlternateListInput(selector, countUpdater) {
  const field = document.querySelector(selector);
  if (!field) return;
  field.addEventListener("keydown", (event) => {
    if (event.key !== " ") return;
    const beforeCaret = field.value.slice(0, field.selectionStart || 0);
    const currentToken = beforeCaret.split(/[\s,;]+/).pop();
    if (!/^[A-Za-z0-9]{4}$/.test(currentToken || "")) return;
    event.preventDefault();
    formatAlternateListField(field, true);
    countUpdater();
  });
  field.addEventListener("input", () => {
    const selectionStart = field.selectionStart;
    const selectionEnd = field.selectionEnd;
    const upperValue = field.value.toUpperCase();
    if (field.value !== upperValue) {
      field.value = upperValue;
      field.setSelectionRange(selectionStart, selectionEnd);
    }
    countUpdater();
  });
  field.addEventListener("blur", () => {
    formatAlternateListField(field, false);
    countUpdater();
  });
}

function formatAlternateListField(field, keepTrailingSeparator = false) {
  const raw = field.value;
  const alternates = parseAlternateList(raw);
  field.value = alternates.join(", ") + (keepTrailingSeparator && alternates.length ? ", " : "");
}

function parseAlternateList(value) {
  const chunks = String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return chunks.flatMap((chunk) => {
    const parts = [];
    for (let index = 0; index < chunk.length; index += 4) {
      const part = chunk.slice(index, index + 4);
      if (part.length === 4) parts.push(part);
    }
    return parts;
  });
}

function setupDefaultsKeyboardFlow() {
  const fields = ["default-departure", "default-destination", "default-alternates"];
  fields.forEach((fieldId, index) => {
    document.querySelector(`#${fieldId}`).addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      if (index < fields.length - 1) {
        document.querySelector(`#${fields[index + 1]}`).focus();
        return;
      }
      saveDefaultsFromPanel();
    });
  });
}

function updateAlternatesCount() {
  updateCommaListCount("#alternates", "#alternates-count");
}

function updateDefaultAlternatesCount() {
  updateCommaListCount("#default-alternates", "#default-alternates-count");
}

function updateCommaListCount(fieldSelector, badgeSelector) {
  const field = document.querySelector(fieldSelector);
  const count = parseAlternateList(field.value).length;
  const badge = document.querySelector(badgeSelector);
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
  return formatTafReferenceTime(new Date(value));
}

function renderCard(result) {
  const cardStatus = result.cardStatus || result.status;
  const assistEnabled = getMissionDefaults().assistDefault !== false && globalAssistEnabled;
  const wxSource = rulesMetadata.weatherSource === "AWC" ? "AWC" : rulesMetadata.weatherSource === "Practice" ? "Practice" : "!";
  const taf = result.tafRaw
    ? `<div class="taf-line">${renderHighlightedTaf(result)}</div>`
    : `<p class="raw-line">No full TAF available.</p>`;

  const notams = result.notams.length
    ? `<ul class="notam-list">${result.notams.map(renderNotam).join("")}</ul>`
    : rulesMetadata.notamAvailable
      ? '<p class="notam-unavailable">No active NOTAMs for selected time.</p>'
      : '<p class="notam-unavailable">NOTAM feature currently unavailable.</p>';
  const cardChips = [
    ...(result.chips || [{ label: "NO ISSUES", status: "green" }]),
    ...getLiveTafTimeChips(result),
    ...getWeatherProductChips(result)
  ].map(markAssistChip);
  const chips = `<div class="issue-chips">${cardChips.map(renderIssueChip).join("")}</div>`;
  const period = result.period
    ? `
      <dl class="wx-grid">
        ${renderWeatherSourceTile("ceiling", "Ceiling", formatCeilingDisplay(result.period), result)}
        ${renderWeatherSourceTile("visibility", "Visibility", formatVisibilityDisplay(result.period), result)}
        ${renderWeatherSourceTile("wind", "Wind", formatWindDisplay(result.period.wind), result)}
      </dl>
    `
    : `<p class="raw-line">${result.tafRaw ? "Selected time is outside this TAF valid window." : "No TAF available from AWC for this airfield."}</p>`;

  return `
    <article class="result-card status-${cardStatus}${assistEnabled ? "" : " assist-off"}" data-icao="${result.icao}" data-rule-status="${result.status}">
      <details class="card-disclosure">
        <summary>
          <div class="card-header">
            <div class="card-main">
              <p class="role">${result.role}</p>
              <div class="airport-row">
                <h3>${result.icao}</h3>
                <p class="airport-name">${result.name || "Airfield"}</p>
              </div>
            </div>
            <div class="card-meta">
              <p class="evaluated-at">${renderEvaluationLabel(result)}: ${formatCompactDateTime(result.evaluatedAt)} ${renderEvaluationDeltaBadge(result.evaluatedAt)}</p>
              <p class="source-labels">WX: <span class="${rulesMetadata.weatherSource === "AWC" ? "" : "wx-failed"}">${escapeHtml(wxSource)}</span> | NOTAM: ${escapeHtml(rulesMetadata.notamSource)}</p>
            </div>
            <div class="card-status">
              <span class="status-pill">${cardStatus}</span>
            </div>
          </div>
          ${chips}
          <span class="card-actions">
            <button type="button" class="assist-toggle${assistEnabled ? " active" : ""}" data-assist-toggle="true" aria-pressed="${assistEnabled ? "true" : "false"}" aria-label="Toggle weather assist highlights" title="Weather assist highlights">✦</button>
            <span class="expand-toggle" aria-hidden="true"></span>
          </span>
        </summary>
        <div class="card-expanded">
          ${period}
          <details class="details-block" open>
            <summary><span>METAR / TAF / NOTAMs</span></summary>
            <section class="metar-block">
              <h4 class="metar-title">METAR ${renderMetarAgeBadge(result.metar, latestEvaluation.pulledAt)}</h4>
              ${renderMetar(result.metar)}
            </section>
            <section class="taf-block">
              <h4 class="taf-title">Full TAF ${renderTafValidityBadge(result.tafRaw)} ${renderTafEvaluationTime(result)}</h4>
              ${taf}
            </section>
            <section class="notam-block">
              <h4>NOTAMs</h4>
              ${notams}
            </section>
          </details>
        </div>
      </details>
    </article>
  `;
}

function renderEvaluationDeltaBadge(evaluatedAt) {
  const target = new Date(evaluatedAt);
  if (Number.isNaN(target.getTime())) return "";
  const state = getEvaluationDeltaState(target);
  return `<span class="eval-delta-pill ${state.className}" data-eval-time="${target.toISOString()}">${state.label}</span>`;
}

function getEvaluationDeltaState(target, referenceDate = new Date()) {
  const deltaMinutes = getWholeMinuteDelta(target, referenceDate);
  return {
    className: deltaMinutes >= 0 ? "eval-delta-future" : "eval-delta-past",
    label: formatSignedDurationMinutes(deltaMinutes)
  };
}

function updateEvaluationDeltaBadges(referenceDate = new Date()) {
  document.querySelectorAll("[data-eval-time]").forEach((badge) => {
    const target = new Date(badge.dataset.evalTime);
    if (Number.isNaN(target.getTime())) return;
    const state = getEvaluationDeltaState(target, referenceDate);
    badge.classList.remove("eval-delta-future", "eval-delta-past");
    badge.classList.add(state.className);
    badge.textContent = state.label;
  });
}

function renderEvaluationLabel(result) {
  return result.role === "Departure" ? "T/O" : "LND";
}

function getWholeMinuteDelta(targetDate, referenceDate) {
  const targetMinute = Math.floor(targetDate.getTime() / 60000);
  const referenceMinute = Math.floor(referenceDate.getTime() / 60000);
  return targetMinute - referenceMinute;
}

function formatSignedDurationMinutes(deltaMinutes) {
  if (Object.is(deltaMinutes, -0)) deltaMinutes = 0;
  const sign = deltaMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(deltaMinutes);
  if (absoluteMinutes >= 1440) return `${sign}2400+`;
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  return `${sign}${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
}

function renderIssueChip(chip, icao = "") {
  const attrs = icao
    ? ` role="button" tabindex="0" data-issue-icao="${escapeHtml(icao)}" data-issue-label="${escapeHtml(chip.label)}" data-issue-status="${escapeHtml(chip.status)}"`
    : "";
  const extraClass = chip.className ? ` ${escapeHtml(chip.className)}` : "";
  return `<span class="issue-chip chip-${chip.status}${extraClass}"${attrs}>${escapeHtml(chip.label)}</span>`;
}

function markAssistChip(chip) {
  const assistLabels = new Set(["WX !", "LOW CEILING", "LOW VIS", "HIGH WIND", "NO ISSUES"]);
  if (!assistLabels.has(String(chip.label || "").toUpperCase())) return chip;
  return { ...chip, className: [chip.className, "assist-chip"].filter(Boolean).join(" ") };
}

function renderWeatherSourceTile(kind, label, value, result) {
  const status = result.weatherImpacts?.[kind] || "green";
  const sourceKey = encodeTafKey(getWeatherSourceRaw(kind, result.period) || result.period?.raw || "");
  return `
    <div class="${impactClass(status)} wx-source-tile" role="button" tabindex="0" data-source-kind="${kind}" data-source-status="${status}" data-source-key="${escapeHtml(sourceKey)}" title="Jump to ${escapeHtml(label.toLowerCase())} source">
      <dt>${escapeHtml(label)}</dt>
      <dd>${value}</dd>
    </div>
  `;
}

function getWeatherSourceRaw(kind, period) {
  if (!period) return "";
  if (kind === "ceiling") return period.ceilingRaw || "";
  if (kind === "visibility") return period.visibilityRaw || "";
  if (kind === "wind") return period.windRaw || "";
  return "";
}

function getWeatherProductChips(result) {
  return [
    { label: result.metar ? "METAR" : "NO METAR", status: result.metar ? "green" : "yellow" },
    { label: result.tafRaw ? "TAF" : "NO TAF", status: result.tafRaw ? "green" : "yellow" }
  ];
}

function getLiveTafTimeChips(result, referenceDate = new Date()) {
  if (!result.tafRaw || result.chips?.some((chip) => chip.label === "TAF TIME")) return [];
  const state = getTafValidityState(result.tafRaw, referenceDate);
  if (!state || state.status === "current") return [];
  return [{ label: "TAF TIME", status: state.status === "expired" ? "red" : "yellow", className: "live-taf-time-chip assist-chip" }];
}

function renderDataAgeBadge(pulledAtValue) {
  const state = getRunFreshnessState(pulledAtValue);
  return state ? `<span class="data-age ${state.className}">${state.label}</span>` : "";
}

function getRunFreshnessState(pulledAtValue, referenceDate = new Date()) {
  const pulledAtDate = new Date(pulledAtValue);
  if (Number.isNaN(pulledAtDate.getTime())) return null;
  const ageMinutes = Math.max(0, getWholeMinuteDelta(referenceDate, pulledAtDate));
  if (ageMinutes >= 1440) {
    return { className: "age-red", label: "> 1 day old", ageMinutes };
  }
  if (ageMinutes >= 60) {
    return { className: "age-red", label: "60+ min", ageMinutes };
  }
  if (ageMinutes >= 30) {
    return { className: "age-yellow", label: "30+ min", ageMinutes };
  }
  if (ageMinutes >= 15) {
    return { className: "age-yellow", label: `${ageMinutes} min`, ageMinutes };
  }
  return { className: "age-green", label: "Fresh", ageMinutes };
}

function updatePulledAtHeader(referenceDate = new Date()) {
  if (!pulledAt || !latestEvaluation?.pulledAt) return;
  const state = getRunFreshnessState(latestEvaluation.pulledAt, referenceDate);
  const badge = state ? `<span class="data-age ${state.className}">${state.label}</span>` : "";
  pulledAt.innerHTML = `<span>Run: ${formatPulledAtDateTime(latestEvaluation.pulledAt)}</span>${badge}`;
}

function renderMetarAgeBadge(metar, referenceValue) {
  const observedAt = getMetarObservedAt(metar, referenceValue);
  if (!observedAt) return "";
  const state = getMetarAgeState(observedAt);
  return `<span class="data-age metar-age ${state.className}" role="button" tabindex="0" data-metar-age="true" data-metar-observed="${observedAt.toISOString()}" title="Highlight METAR observation time">${state.label}</span>`;
}

function getMetarAgeState(observedAt, referenceDate = new Date()) {
  const ageMinutes = Math.max(0, getWholeMinuteDelta(referenceDate, observedAt));
  const className = ageMinutes > 60 ? "age-red" : ageMinutes >= 50 ? "age-yellow" : "age-green";
  const label = ageMinutes >= 1440 ? "> 1 day old" : `${ageMinutes} min old`;
  return { className, label };
}

function updateMetarAgeBadges(referenceDate = new Date()) {
  document.querySelectorAll("[data-metar-observed]").forEach((badge) => {
    const observedAt = new Date(badge.dataset.metarObserved);
    if (Number.isNaN(observedAt.getTime())) return;
    const state = getMetarAgeState(observedAt, referenceDate);
    badge.classList.remove("age-green", "age-yellow", "age-red");
    badge.classList.add(state.className);
    badge.textContent = state.label;
  });
}

function renderTafValidityBadge(tafRaw) {
  const state = getTafValidityState(tafRaw);
  if (!state) return "";
  return `<span class="data-age taf-age ${state.className}" role="button" tabindex="0" data-taf-validity="true" data-taf-valid-from="${state.start.toISOString()}" data-taf-valid-to="${state.end.toISOString()}" title="Highlight TAF validity window">${state.label}</span>`;
}

function getTafValidityState(tafRaw, referenceDate = new Date()) {
  const window = getTafValidityWindow(tafRaw, referenceDate);
  if (!window) return null;
  return getTafValidityStateFromWindow(window, referenceDate);
}

function getTafValidityStateFromWindow(window, referenceDate = new Date()) {
  const reference = referenceDate.getTime();
  const start = window.start.getTime();
  const end = window.end.getTime();
  if (reference > end) {
    return {
      status: "expired",
      label: `Expired (${formatSignedDurationMinutes(getWholeMinuteDelta(window.end, referenceDate))})`,
      className: "age-red",
      start: window.start,
      end: window.end
    };
  }
  if (reference < start) {
    return {
      status: "future",
      label: `Future (${formatSignedDurationMinutes(getWholeMinuteDelta(window.start, referenceDate))})`,
      className: "age-yellow",
      start: window.start,
      end: window.end
    };
  }
  return { status: "current", label: "Current", className: "age-green", start: window.start, end: window.end };
}

function updateTafValidityBadges(referenceDate = new Date()) {
  document.querySelectorAll("[data-taf-validity][data-taf-valid-from][data-taf-valid-to]").forEach((badge) => {
    const start = new Date(badge.dataset.tafValidFrom);
    const end = new Date(badge.dataset.tafValidTo);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
    const state = getTafValidityStateFromWindow({ start, end }, referenceDate);
    badge.classList.remove("age-green", "age-yellow", "age-red");
    badge.classList.add(state.className);
    badge.textContent = state.label;
  });
}

function updateLiveTafTimeChips() {
  document.querySelectorAll(".result-card").forEach((card) => {
    const chips = card.querySelector(".issue-chips");
    const tafAge = card.querySelector("[data-taf-validity]");
    if (!chips || !tafAge) return;
    const existing = chips.querySelector(".live-taf-time-chip");
    const isCurrent = tafAge.classList.contains("age-green");
    if (isCurrent) {
      existing?.remove();
      return;
    }
    const status = tafAge.classList.contains("age-red") ? "red" : "yellow";
    if (existing) {
      existing.classList.toggle("chip-red", status === "red");
      existing.classList.toggle("chip-yellow", status === "yellow");
      existing.classList.toggle("chip-green", status === "green");
      return;
    }
    chips.insertAdjacentHTML("afterbegin", renderIssueChip({ label: "TAF TIME", status, className: "live-taf-time-chip" }));
  });
}

function renderTafEvaluationTime(result) {
  const value = result.evaluatedAt;
  const state = getTafEvaluationBadgeState(result);
  const title = state.found
    ? "Evaluation time found in this TAF"
    : "Evaluation time not found in this TAF";
  return `<span class="taf-eval-time ${state.className}" role="button" tabindex="0" data-taf-eval="true" data-eval-target="${value}" data-eval-has-period="${state.hasPeriod ? "true" : "false"}" data-eval-taf-valid-from="${state.validFrom || ""}" data-eval-taf-valid-to="${state.validTo || ""}" title="${title}">${renderEvaluationLabel(result)} ${formatTafReferenceTime(value)}</span>`;
}

function getTafEvaluationBadgeState(result) {
  const target = new Date(result.evaluatedAt);
  const hasPeriod = Boolean(result.taf?.length && getTafPeriodsAt(result.taf, target).length);
  const tafState = result.tafRaw ? getTafValidityState(result.tafRaw) : null;
  const found = hasPeriod;
  return {
    found,
    hasPeriod,
    className: found ? "taf-eval-found" : "taf-eval-missing",
    validFrom: tafState?.start?.toISOString() || "",
    validTo: tafState?.end?.toISOString() || ""
  };
}

function updateTafEvalBadges() {
  document.querySelectorAll("[data-taf-eval][data-eval-has-period]").forEach((badge) => {
    const hasPeriod = badge.dataset.evalHasPeriod === "true";
    const found = hasPeriod;
    badge.classList.toggle("taf-eval-found", found);
    badge.classList.toggle("taf-eval-missing", !found);
    badge.title = found ? "Evaluation time found in this TAF" : "Evaluation time not found in this TAF";
  });
}

function formatTafReferenceTime(value) {
  const date = new Date(value);
  return `${String(date.getUTCDate()).padStart(2, "0")}${String(date.getUTCHours()).padStart(2, "0")}${String(date.getUTCMinutes()).padStart(2, "0")}Z`;
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
  if (source === "CAVOK") return "CAVOK";
  if (source === "9999M") return "Unlimited";
  if (/^\d{4}M$/.test(source || "")) {
    return `${Number(source.slice(0, 4)).toLocaleString("en-US")}m <span class="vis-separator">|</span> ${period.visibilitySm.toFixed(1)}SM`;
  }
  return source || `${period.visibilitySm} SM`;
}

function formatWindDisplay(wind) {
  if (wind === "00000KT" || wind === "00000MPS") return "Calm";
  const mps = String(wind || "").match(/^((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?)MPS$/);
  if (!mps) return wind;
  const speedKt = Math.round(Number(mps[2]) * 1.94384);
  const gustKt = mps[3] ? Math.round(Number(mps[3]) * 1.94384) : null;
  return `${mps[1]}MPS <span class="vis-separator">|</span> ${speedKt}${gustKt ? `G${gustKt}` : ""}KT`;
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
      const markers = getTafLineMarkers(line, checks, result);
      const exact = markers.some((marker) => marker.type === "exact");
      const context = markers.some((marker) => marker.type === "window");
      const state = exact ? "exact" : context ? "window" : "none";
      return renderTafLine(line, state, markers);
    })
    .join("");
}

function getTafLineMarkers(line, checks, result) {
  const ruleType = getRuleTypeForResult(result);
  return checks
    .map((check) => {
      const matchingPeriods = getTafPeriodsAt(result.taf || [], check.time)
        .filter((period) => isApplicableTafLine(line, period.raw));
      if (!matchingPeriods.length) return null;
      return {
        label: check.label,
        type: check.type,
        status: matchingPeriods
          .map((period) => evaluateWeather(period, ruleType, true).status)
          .reduce((current, status) => STATUS_RANK[status] > STATUS_RANK[current] ? status : current, "green")
      };
    })
    .filter(Boolean);
}

function getTafPeriodsAt(periods, target) {
  const targetMs = target.getTime();
  return periods.filter((period) => {
    const start = new Date(period.validFrom).getTime();
    const end = new Date(period.validTo).getTime();
    return targetMs >= start && targetMs < end;
  });
}

function getRuleTypeForResult(result) {
  if (result.role === "Departure") return "departure";
  if (result.role === "Destination") return "destination";
  return "alternate";
}

function renderTafLine(line, state, markers) {
  const stateClass = state === "exact" ? " taf-applicable" : state === "window" ? " taf-window" : "";
  const status = markers.reduce((current, marker) =>
    STATUS_RANK[marker.status] > STATUS_RANK[current] ? marker.status : current
  , "green");
  const statusClass = markers.length ? ` taf-status-${status}` : "";
  const tafKey = encodeTafKey(line);
  return `
    <details class="taf-decode-row${stateClass}${statusClass}" data-taf-key="${escapeHtml(tafKey)}">
      <summary title="Tap to decode this TAF line">
        <span>${renderTafSourceTokens(line)}</span>
        ${markers.length ? `<span class="taf-markers">${markers.map((marker) => `<span class="taf-marker marker-${marker.status}">${escapeHtml(marker.label)}</span>`).join("")}</span>` : ""}
      </summary>
      <div class="taf-decode">${renderTafDecode(line)}</div>
    </details>
  `;
}

function encodeTafKey(value) {
  return encodeURIComponent(String(value || "").trim());
}

function renderTafSourceTokens(line) {
  return String(line || "")
    .trim()
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      const classes = getTafSourceTokenClasses(part);
      return classes.length
        ? `<span class="${classes.join(" ")}">${escapeHtml(part)}</span>`
        : escapeHtml(part);
    })
    .join("");
}

function getTafSourceTokenClasses(token) {
  const classes = [];
  if (/^FM\d{6}$/.test(token) || /^\d{4}\/\d{4}$/.test(token)) classes.push("taf-source-time");
  if (/^(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?(?:KT|MPS)$/.test(token)) classes.push("taf-source-wind");
  if (token === "CAVOK" || token === "P6SM" || /^M?\d{1,2}(?:\/\d)?SM$/.test(token) || /^\d{4}$/.test(token) || /^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(token) || matchCompactVisibilityWeatherToken(token)) classes.push("taf-source-visibility");
  if (/^(BKN|OVC|VV)(\d{3}|\/\/\/)(CB|TCU)?$/.test(token)) classes.push("taf-source-ceiling");
  return classes;
}

function renderTafDecode(line) {
  const decoded = decodeTafLine(line);
  return `
    <dl>
      ${decoded.map(renderDecodedItem).join("")}
    </dl>
  `;
}

function renderDecodedItem(item) {
  return `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}${renderConversionTableButton(item)}</dd></div>`;
}

function shouldShowVisibilityTable(item) {
  return item.label === "Visibility" && /\b\d{3,5} meters \(\d+(?:\.\d)? SM\)/.test(item.value);
}

function shouldShowWindTable(item) {
  return item.label === "Wind" && /\bmeters per second \(\d+ kt\)/.test(item.value);
}

function renderConversionTableButton(item) {
  if (shouldShowVisibilityTable(item)) return renderTableButton("visibility", "Show meter to statute mile table", "Meter to SM table");
  if (shouldShowWindTable(item)) return renderTableButton("wind", "Show meters per second to knots table", "MPS to kt table");
  return "";
}

function renderTableButton(type, label, title) {
  return ` <button type="button" class="conversion-table-button" data-conversion-table="${type}" aria-label="${escapeHtml(label)}" title="${escapeHtml(title)}">Table</button>`;
}

function renderMetar(metar) {
  if (!metar) return `<p>No METAR available.</p>`;
  return `
    <details class="metar-decode-row">
      <summary title="Tap to decode this METAR">
        <span>${renderMetarSourceTokens(metar)}</span>
      </summary>
      <div class="taf-decode">${renderMetarDecode(metar)}</div>
    </details>
  `;
}

function renderMetarSourceTokens(metar) {
  return String(metar || "")
    .trim()
    .split(/(\s+)/)
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      return /^\d{6}Z$/.test(part)
        ? `<span class="metar-source-time">${escapeHtml(part)}</span>`
        : escapeHtml(part);
    })
    .join("");
}

function renderMetarDecode(metar) {
  const decoded = decodeMetarLine(metar);
  return `
    <dl>
      ${decoded.map(renderDecodedItem).join("")}
    </dl>
  `;
}

function handleConversionTableClick(event) {
  const button = event.target.closest(".conversion-table-button");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  openConversionTable(button.dataset.conversionTable);
}

function handleConversionTableKeydown(event) {
  const button = event.target.closest(".conversion-table-button");
  if (!button || !["Enter", " "].includes(event.key)) return;
  event.preventDefault();
  openConversionTable(button.dataset.conversionTable);
}

function openConversionTable(type) {
  if (type === "wind") {
    openWindTable();
    return;
  }
  openVisibilityTable();
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
  const tokens = normalizeReportTokens(line.trim().split(/\s+/));
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

  const wind = line.match(/\b((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS))\b/);
  if (wind) items.push({ label: "Wind", value: decodeWindToken(wind) });
  const variableWind = tokens.find((token) => /^\d{3}V\d{3}$/.test(token));
  if (variableWind) items.push({ label: "Wind", value: `Wind direction varying from ${variableWind.slice(0, 3)} degrees to ${variableWind.slice(4, 7)} degrees.` });

  const visibility = decodeVisibilityToken(tokens);
  if (visibility) items.push({ label: "Visibility", value: visibility });
  if (tokens.includes("CAVOK")) items.push({ label: "Conditions", value: "Ceiling And Visibility OK: visibility 10 km or more, no significant weather, and no significant cloud below criteria." });

  const weather = decodeWeatherTokens(tokens);
  if (weather.length) items.push({ label: "Weather", value: joinDecodedPhrases(weather) });

  const clouds = decodeCloudTokens(tokens);
  if (clouds.length) items.push({ label: "Clouds", value: joinDecodedPhrases(clouds) });
  if (tokens.includes("NSC")) items.push({ label: "Clouds", value: "No significant cloud." });

  const remarks = decodeTafRemarks(tokens);
  if (remarks.length) items.push({ label: "Remarks", value: remarks.join("; ") });

  const undecoded = decodeUndecodedTokenList(tokens, "taf");
  if (undecoded.length) items.push({ label: "Not Decoded", value: formatNotDecodedTokens(undecoded, "taf") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this line." }];
}

function decodeMetarLine(line) {
  const tokens = normalizeReportTokens(line.trim().split(/\s+/));
  const items = [];
  const station = tokens.find((token) => /^[A-Z0-9]{4}$/.test(token));
  if (station) items.push({ label: "Station", value: station });

  const observed = tokens.find((token) => /^\d{6}Z$/.test(token));
  if (observed) items.push({ label: "Observed", value: decodeObservedTime(observed) });

  if (tokens.includes("AUTO")) items.push({ label: "Report Type", value: "Automated observation." });
  if (tokens.includes("COR")) items.push({ label: "Correction", value: "Corrected report." });

  const wind = line.match(/\b((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS))\b/);
  if (wind) items.push({ label: "Wind", value: decodeWindToken(wind) });

  const visibility = decodeVisibilityToken(tokens);
  if (visibility) items.push({ label: "Visibility", value: visibility });
  if (tokens.includes("CAVOK")) items.push({ label: "Conditions", value: "Ceiling And Visibility OK: visibility 10 km or more, no significant weather, and no significant cloud below criteria." });

  const rvr = decodeRvrTokens(tokens);
  if (rvr.length) items.push({ label: "Runway Visibility", value: rvr.join("; ") });
  const runwayState = decodeRunwayStateTokens(tokens);
  if (runwayState.length) items.push({ label: "Runway State", value: runwayState.join("; ") });

  const weather = decodeWeatherTokens(tokens);
  if (weather.length) items.push({ label: "Weather", value: joinDecodedPhrases(weather) });

  const clouds = decodeCloudTokens(tokens);
  if (clouds.length) items.push({ label: "Clouds", value: joinDecodedPhrases(clouds) });
  if (tokens.includes("CLR")) items.push({ label: "Clouds", value: "Clear below reporting limits." });
  if (tokens.includes("SKC")) items.push({ label: "Clouds", value: "Sky clear." });
  if (tokens.includes("NSC")) items.push({ label: "Clouds", value: "No significant cloud." });
  if (tokens.includes("NCD")) items.push({ label: "Clouds", value: "No cloud detected by automated sensor." });
  const missingGroups = decodeMissingSlashGroups(tokens);
  if (missingGroups.length) items.push({ label: "Encoded / System", value: missingGroups.join("; ") });

  const tempDew = tokens.find((token) => /^(M?\d{2}|M)\/(M?\d{2}|M|M?\/\/)$/.test(token));
  if (tempDew) items.push({ label: "Temperature", value: decodeTempDewpoint(tempDew) });

  const altimeter = tokens.find((token) => /^A\d{4}$/.test(token));
  if (altimeter) items.push({ label: "Altimeter", value: `${altimeter.slice(1, 3)}.${altimeter.slice(3)} inHg.` });
  const qnh = tokens.find((token) => /^Q\d{4}$/.test(token));
  if (qnh) items.push({ label: "Altimeter", value: `${qnh.slice(1)} hPa.` });

  const trends = decodeMetarTrends(tokens);
  if (trends.length) items.push({ label: "Trend", value: trends.join("; ") });

  const remarks = decodeMetarRemarks(tokens);
  if (remarks.length) items.push({ label: "Remarks", value: remarks.join("; ") });

  const undecoded = decodeUndecodedTokenList(tokens, "metar");
  if (undecoded.length) items.push({ label: "Not Decoded", value: formatNotDecodedTokens(undecoded, "metar") });

  return items.length ? items : [{ label: "Decode", value: "No decoded training items found for this METAR." }];
}

function decodeUndecodedTokens(tokens, reportType) {
  return decodeUndecodedTokenList(tokens, reportType)
    .map((token) => describeUndecodedToken(token, reportType));
}

function decodeUndecodedTokenList(tokens, reportType) {
  const isKnown = reportType === "metar" ? isKnownMetarToken : isKnownTafToken;
  return tokens
    .filter((token, index) => !hasRepeatedSlash(token) && !isKnown(token, index, tokens))
    .filter((token, index, list) => list.indexOf(token) === index);
}

function formatNotDecodedTokens(tokens, reportType) {
  return tokens.join(", ");
}

function getLikelyUndecodedDefinition(token, reportType) {
  if (isWeatherToken(token)) return stripPeriod(decodeWeatherToken(token)).toLowerCase();
  if (/^R\d{2}[LCR]?\//.test(token)) return "runway visual range or runway surface condition group";
  if (/^QFE\d{3,4}(\/\d{3,4})?$/.test(token)) return "QFE pressure group";
  if (/^QNH\d{4}/.test(token)) return "QNH altimeter setting group";
  if (/^FS\d{5}$/.test(token)) return "regional/system forecast status group";
  if (/^(AUTOMATED|SENSOR|METWATCH)$/.test(token)) return "automated sensor meteorological watch text";
  if (/^RWY\d{2}[LCR]?$/.test(token)) return "runway-specific remark";
  if (/^ISB\d+E\d+/.test(token)) return "regional/system sensor group";
  if (/^[A-Z]{2,}\d{2,}/.test(token)) return `${reportType.toUpperCase()} regional or automated-system group`;
  if (/^\d+$/.test(token)) return "numeric/system group";
  return "";
}

function isKnownTafToken(token, index, tokens) {
  if (isCommonAviationToken(token)) return true;
  if (isWeatherToken(token)) return true;
  if (/^FM\d{6}$/.test(token)) return true;
  if (/^\d{4}\/\d{4}$/.test(token)) return true;
  if (/^(TAF|AMD|COR|TEMPO|BECMG|NSW|NSC|CAVOK|NIL|CNL|LAST|NO|AFT|NEXT|RMK)$/.test(token)) return true;
  if (/^PROB\d{2}$/.test(token)) return true;
  if (/^(TX|TN)(M?\d{2})\/(\d{4})Z$/.test(token)) return true;
  if (/^(TX|TN)M?\d{1,2}\/\d{4}Z$/.test(token)) return true;
  if (/^QNH\d{4}INS$/.test(token)) return true;
  if (/^QNH\d{4}$/.test(token)) return true;
  if (/^FS\d{5}$/.test(token)) return true;
  if (/^\d{4}Z$/.test(token) && ["AFT", "NEXT"].includes(tokens[index - 1])) return true;
  if (/^\d{4}$/.test(token) && tokens[index - 1] === "COR") return true;
  if (/^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(token)) return true;
  if (token === "AMD" && tokens[index - 1] === "NO") return true;
  if (token === "FZRANO") return true;
  if (/^(AUTOMATED|SENSOR|METWATCH)$/.test(token)) return true;
  if (token === "LTG" || token === "DSNT") return true;
  if (isDirectionToken(token) && tokens[index - 1] === "DSNT") return true;
  return false;
}

function isKnownMetarToken(token, index, tokens) {
  if (isCommonAviationToken(token)) return true;
  if (isWeatherToken(token)) return true;
  if (/^(METAR|SPECI|AUTO|COR|RMK|CAVOK|NIL|NSC|NCD)$/.test(token)) return true;
  if (/^(AO1|AO2|A01|A02|TSNO|FZRANO|\$)$/.test(token)) return true;
  if (/^(NOSIG|OBST|OBSC|BIRD|HAZARD|RWY|WET|DRY|DAMP|CONTAM|CONTAMINATED|SLUSH|SNOW|ICE|BRAKING|ACTION|GOOD|MEDIUM|POOR|NIL|MT|PT)$/.test(token)) return true;
  if (/^(BLU|WHT|GRN|YLO|AMB|RED|BLACK)$/.test(token) && tokens.includes("RMK")) return true;
  if (/^(TEMPO|BECMG|INTER|WIND)$/.test(token)) return true;
  if (/^R\d{2}[LCR]?\/\d{6}$/.test(token)) return true;
  if (/^R\d{2}[LCR]?\/CLRD\d{2}$/.test(token)) return true;
  if (/^R\d{2}[LCR]?\/[PM]?\d{4}[UDN]?$/.test(token)) return true;
  if (/^PP\d{3}$/.test(token)) return true;
  if (/^QFE\d{3,4}$/.test(token)) return true;
  if (/^QFE\d{3,4}\/\d{3,4}$/.test(token)) return true;
  if (/^(CI|CS|CC|AC|AS|NS|SC|ST|CU|CB)\d$/.test(token) && tokens.includes("RMK")) return true;
  if (/^\/{2,}$/.test(token)) return true;
  if (/^\/+\d+\/+$/.test(token)) return true;
  if (/^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(token)) return true;
  if (/^(FEW|SCT|BKN|OVC|VV)\d{3}\/{2,}(CB|TCU)?$/.test(token)) return true;
  if (/^\/{3,}(CB|TCU)$/.test(token)) return true;
  if (matchCompactVisibilityWeatherToken(token)) return true;
  if (/^\d{3,4}FT$/.test(token) && (tokens[index - 1] === "WIND" || matchWindToken(tokens[index + 1]))) return true;
  if (/^\d{3}V\d{3}$/.test(token) && (matchWindToken(tokens[index - 1]) || matchWindToken(tokens[index - 2]))) return true;
  if (/^\d{2}\/\d{2}$/.test(token) && tokens[index - 1] === "RWY") return true;
  if (/^SLP\d{3}$/.test(token)) return true;
  if (/^SLTP\d{3}$/.test(token)) return true;
  if (/^T[01]\d{3}[01]\d{3}$/.test(token)) return true;
  if (/^P\d{4}$/.test(token)) return true;
  if (/^6\d{4}$/.test(token)) return true;
  if (/^1[01]\d{3}$/.test(token)) return true;
  if (/^2[01]\d{3}$/.test(token)) return true;
  if (/^5\d{4}$/.test(token)) return true;
  if (/^DZB\d{2}E\d{2}$/.test(token)) return true;
  if (/^RA(B|E)\d{2}(\d{2})?$/.test(token)) return true;
  if (/^TS(B|E)\d{2}(\d{2})?$/.test(token)) return true;
  if (/^(HZY|8\/\d{3})$/.test(token) && tokens.includes("RMK")) return true;
  if (/^(ST\dST\d|ST|TR|CB\/[A-Z-]+|DENSITY|ALT|FT)$/.test(token) && tokens.includes("RMK")) return true;
  if (/^\d{3,5}$/.test(token) && tokens[index - 2] === "DENSITY" && tokens[index - 1] === "ALT") return true;
  if (token === "PK" || token === "WND") return true;
  if (/^\d{3}\d{2,3}\/?(\d{4})?$/.test(token) && (tokens[index - 1] === "WND" || tokens[index - 2] === "PK")) return true;
  if (token === "LTG" || token === "DSNT" || token === "ALQDS") return true;
  if (token === "AND" && (isDirectionToken(tokens[index - 1]) || isDirectionToken(tokens[index + 1]))) return true;
  if (isDirectionToken(token) && tokens[index - 1] === "DSNT") return true;
  if (isDirectionToken(token) && tokens[index - 1] === "AND") return true;
  if (/^RWY\d{2}[LCR]?$/.test(token) && tokens.includes("RMK")) return true;
  return false;
}

function isCommonAviationToken(token) {
  return /^[A-Z0-9]{4}$/.test(token)
    || /^\d{6}Z$/.test(token)
    || /^(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?(?:KT|MPS)$/.test(token)
    || token === "CAVOK"
    || token === "P6SM"
    || /^M?\d{1,2}(?:\/\d)?SM$/.test(token)
    || /^\d{4}$/.test(token)
    || /^R\d{2}[LCR]?\/[PM]?\d{4}V?[PM]?\d{4}FT$/.test(token)
    || /^(FEW|SCT|BKN|OVC|VV)(\d{3}|\/\/\/)(CB|TCU)?$/.test(token)
    || /^(FEW|SCT|BKN|OVC|VV)\d{3}\/{2,}(CB|TCU)?$/.test(token)
    || /^\/\/\/(CB|TCU)$/.test(token)
    || /^\/{3,}(CB|TCU)$/.test(token)
    || /^(CLR|SKC|NSC)$/.test(token)
    || /^(M?\d{2}|M)\/(M?\d{2}|M|M?\/\/)$/.test(token)
    || /^A\d{4}$/.test(token)
    || /^Q\d{4}$/.test(token);
}

function hasRepeatedSlash(token) {
  return /\/{2,}/.test(String(token || ""));
}

function normalizeReportTokens(tokens) {
  return tokens
    .map((token) => recoverRepeatedSlashToken(token))
    .filter(Boolean);
}

function recoverRepeatedSlashToken(token) {
  const value = String(token || "");
  if (!hasRepeatedSlash(value)) return value;
  const recovered = value.replace(/^\/+/, "").replace(/\/+$/, "");
  return isRecoverableSlashToken(recovered) ? recovered : "";
}

function isRecoverableSlashToken(token) {
  return /^(FEW|SCT|BKN|OVC|VV)\d{3}(CB|TCU)?$/.test(token)
    || /^(CB|TCU)$/.test(token)
    || /^(NSC|NCD|SKC|CLR|CAVOK)$/.test(token)
    || /^(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?(?:KT|MPS)$/.test(token)
    || isWeatherToken(token);
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
  if (match[1] === "00000KT" || match[1] === "00000MPS") return "Calm.";
  const direction = match[1].startsWith("VRB") ? "variable" : `${match[1].slice(0, 3)} degrees`;
  const unit = match[4] === "MPS" ? "meters per second" : "kt";
  const speed = Number(match[2]);
  const speedKt = match[4] === "MPS" ? ` (${Math.round(speed * 1.94384)} kt)` : "";
  const gust = match[3]
    ? `, gusting ${Number(match[3])} ${unit}${match[4] === "MPS" ? ` (${Math.round(Number(match[3]) * 1.94384)} kt)` : ""}`
    : "";
  return `${direction} at ${speed} ${unit}${speedKt}${gust}.`;
}

function decodeVisibilityToken(tokens) {
  const token = tokens.find((item) => item === "CAVOK" || item === "P6SM" || /^M?\d{1,2}(?:\/\d)?SM$/.test(item) || /^\d{4}$/.test(item));
  const compact = tokens.find(matchCompactVisibilityWeatherToken);
  const directional = tokens.find((item) => /^\d{4}(N|NE|E|SE|S|SW|W|NW)$/.test(item));
  if (!token && !compact && !directional) return null;
  if (!token && compact) {
    const match = matchCompactVisibilityWeatherToken(compact);
    return decodeMetersVisibility(match[1]);
  }
  if (token && directional) return `${decodeMetersVisibility(token)} Directional visibility ${decodeDirectionalVisibility(directional)}`;
  if (directional) return `Directional visibility ${decodeDirectionalVisibility(directional)}`;
  if (token === "P6SM") return "Greater than 6 SM.";
  if (token === "CAVOK") return "CAVOK: Ceiling And Visibility OK; visibility 10 km or more; no significant weather; no significant cloud below criteria.";
  if (/^\d{4}$/.test(token)) return decodeMetersVisibility(token);
  if (token.startsWith("M")) return `Less than ${token.replace("M", "").replace("SM", "")} SM.`;
  return `${token.replace("SM", "")} SM.`;
}

function decodeRvrTokens(tokens) {
  return tokens
    .filter((token) => /^R\d{2}[LCR]?\/[PM]?\d{4}(?:V[PM]?\d{4})?(?:FT|[UDN])?$/.test(token))
    .map((token) => {
      const match = token.match(/^R(\d{2}[LCR]?)\/([PM]?\d{4})(?:V([PM]?\d{4}))?(FT|[UDN])?$/);
      if (!match) return token;
      const unit = match[4] === "FT" ? "ft" : "meters";
      const trend = { U: "increasing", D: "decreasing", N: "no significant change" }[match[4]] || "";
      const decodeValue = (value) => `${value.startsWith("P") ? "greater than " : value.startsWith("M") ? "less than " : ""}${Number(value.replace(/^[PM]/, "")).toLocaleString("en-US")} ${unit}`;
      return `Runway ${match[1]} RVR ${decodeValue(match[2])}${match[3] ? ` variable to ${decodeValue(match[3])}` : ""}${trend ? `, ${trend}` : ""}.`;
    });
}

function decodeMissingSlashGroups(tokens) {
  return tokens.filter((token) => !hasRepeatedSlash(token) && /^\/+\d+\/+$/.test(token));
}

function decodeRunwayStateTokens(tokens) {
  return tokens.flatMap((token) => {
    const state = token.match(/^R(\d{2}[LCR]?)\/([0-9/])([0-9/])([0-9/]{2})([0-9/]{2})$/);
    if (state) return [decodeRunwayState(state)];
    const cleared = token.match(/^R(\d{2}[LCR]?)\/CLRD(\d{2})$/);
    if (cleared) return [`Runway ${cleared[1]} cleared; braking/friction code ${cleared[2]}.`];
    return [];
  });
}

function decodeMetersVisibility(value) {
  return value === "9999" ? "Unlimited." : `${Number(value).toLocaleString("en-US")} meters (${metersToStatuteMiles(Number(value)).toFixed(1)} SM).`;
}

function decodeDirectionalVisibility(token) {
  const match = String(token || "").match(/^(\d{4})(N|NE|E|SE|S|SW|W|NW)$/);
  if (!match) return token;
  return `${Number(match[1]).toLocaleString("en-US")} meters ${decodeDirection(match[2])}.`;
}

function metersToStatuteMiles(meters) {
  return Math.round((meters / 1609.344) * 10) / 10;
}

function decodeWeatherTokens(tokens) {
  return tokens
    .flatMap((token) => {
      const compact = matchCompactVisibilityWeatherToken(token);
      if (compact) return [decodeWeatherToken(compact[2])];
      return isWeatherToken(token) ? [decodeWeatherToken(token)] : [];
    });
}

function isWeatherToken(token) {
  if (!/^[-+]?[A-Z]{2,}$/.test(token)) return false;
  if (/^(METAR|SPECI|AUTO|COR|RMK|QNH|LAST|NEXT|AFT|NIL|SKC|CLR|NSC)$/.test(token)) return false;
  if (/^(FEW|SCT|BKN|OVC|VV)\d{3}/.test(token)) return false;
  const clean = token.replace(/^[-+]/, "");
  if (clean === "NSW") return true;
  if (/^RE(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|TS|SH|FZ)+$/.test(clean)) return true;
  return /^(VC)?(MI|PR|BC|BD|DR|BL|SH|TS|FZ)?(DZ|RA|SN|SG|IC|PL|GR|GS|UP|BR|FG|FU|VA|DU|SA|HZ|PY|PO|SQ|FC|SS|DS)+$/.test(clean);
}

function decodeWeatherToken(token) {
  if (token === "NSW") return "No significant weather.";
  const intensity = token.startsWith("-") ? "Light " : token.startsWith("+") ? "Heavy " : "";
  const clean = token.replace(/^[-+]/, "");
  if (clean === "BDFU") return `${intensity}Blowing dust or smoke.`.trim();
  const parts = [];
  const codes = [
    ["VC", "in the vicinity"],
    ["MI", "shallow"],
    ["PR", "partial"],
    ["BC", "patches"],
    ["BD", "blowing dust"],
    ["DR", "low drifting"],
    ["BL", "blowing"],
    ["SH", "showers"],
    ["TS", "thunderstorm"],
    ["FZ", "freezing"],
    ["RA", "rain"],
    ["SN", "snow"],
    ["DZ", "drizzle"],
    ["SG", "snow grains"],
    ["IC", "ice crystals"],
    ["PL", "ice pellets"],
    ["GR", "hail"],
    ["GS", "small hail"],
    ["UP", "unknown precipitation"],
    ["BR", "mist"],
    ["FG", "fog"],
    ["HZ", "haze"],
    ["FU", "smoke"],
    ["VA", "volcanic ash"],
    ["DU", "dust"],
    ["SA", "sand"],
    ["PY", "spray"],
    ["PO", "dust/sand whirls"],
    ["SQ", "squalls"],
    ["FC", "funnel cloud"],
    ["SS", "sandstorm"],
    ["DS", "duststorm"]
  ];
  const recent = clean.startsWith("RE");
  const weatherCode = recent ? clean.slice(2) : clean;
  codes.forEach(([code, label]) => {
    if (weatherCode.includes(code)) parts.push(label);
  });
  return `${recent ? "Recent " : intensity}${parts.join(" ")}.`.trim();
}

function matchCompactVisibilityWeatherToken(token) {
  const match = String(token || "").match(/^(\d{4})([A-Z]{2,})$/);
  return match && isWeatherToken(match[2]) ? match : null;
}

function decodeCloudTokens(tokens) {
  return tokens
    .filter((token) => /^(FEW|SCT|BKN|OVC|VV)(\d{3}|\/\/\/)(CB|TCU)?$/.test(token) || /^(FEW|SCT|BKN|OVC|VV)\d{3}\/{2,}(CB|TCU)?$/.test(token) || /^\/{3,}(CB|TCU)$/.test(token) || /^(CB|TCU)$/.test(token))
    .map((token) => {
      if (token === "CB" || token === "TCU") return `${token === "CB" ? "Cumulonimbus" : "Towering cumulus"}, base not reported.`;
      const appendedMissing = token.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})\/{2,}(CB|TCU)?$/);
      if (appendedMissing) {
        const coverage = { FEW: "Few", SCT: "Scattered", BKN: "Broken", OVC: "Overcast", VV: "Vertical visibility" }[appendedMissing[1]];
        const cloudType = appendedMissing[3] === "CB" ? " cumulonimbus" : appendedMissing[3] === "TCU" ? " towering cumulus" : "";
        return `${coverage}${cloudType} at ${(Number(appendedMissing[2]) * 100).toLocaleString("en-US")} ft AGL; additional cloud detail not reported.`;
      }
      const bareType = token.match(/^\/{3,}(CB|TCU)$/);
      if (bareType) return `${bareType[1] === "CB" ? "Cumulonimbus" : "Towering cumulus"}, base not reported.`;
      const match = token.match(/^(FEW|SCT|BKN|OVC|VV)(\d{3}|\/\/\/)(CB|TCU)?$/);
      const coverage = { FEW: "Few", SCT: "Scattered", BKN: "Broken", OVC: "Overcast", VV: "Vertical visibility" }[match[1]];
      const cloudType = match[3] === "CB" ? " cumulonimbus" : match[3] === "TCU" ? " towering cumulus" : "";
      if (match[2] === "///") return `${coverage}${cloudType}, base not reported.`;
      return `${coverage}${cloudType} at ${(Number(match[2]) * 100).toLocaleString("en-US")} ft AGL.`;
    });
}

function decodeMetarTrends(tokens) {
  const rmkIndex = tokens.indexOf("RMK");
  const endIndex = rmkIndex === -1 ? tokens.length : rmkIndex;
  const trends = [];
  if (tokens.slice(0, endIndex).includes("NOSIG")) trends.push("No significant change expected.");

  for (let index = 0; index < endIndex; index += 1) {
    const token = tokens[index];
    if (!/^(TEMPO|BECMG|INTER)$/.test(token)) continue;

    const nextTrend = tokens.findIndex((candidate, candidateIndex) => candidateIndex > index && candidateIndex < endIndex && /^(TEMPO|BECMG|INTER)$/.test(candidate));
    const trendTokens = tokens.slice(index + 1, nextTrend === -1 ? endIndex : nextTrend);
    const parts = [decodeMetarTrendType(token)];
    const windToken = trendTokens.find((candidate) => matchWindToken(candidate));
    const visibility = decodeVisibilityToken(trendTokens);
    const weather = decodeWeatherTokens(trendTokens);
    const clouds = decodeCloudTokens(trendTokens);

    if (windToken) parts.push(`Wind ${stripPeriod(decodeWindToken(matchWindToken(windToken)))}.`);
    if (visibility) parts.push(`Visibility ${stripPeriod(visibility)}.`);
    if (weather.length) parts.push(`Weather ${joinDecodedPhrases(weather.map(lowercaseFirst))}`);
    if (clouds.length) parts.push(`Clouds ${joinDecodedPhrases(clouds.map(lowercaseFirst))}`);
    trends.push(parts.join(" "));
  }

  return trends;
}

function decodeMetarTrendType(token) {
  if (token === "TEMPO") return "Temporary trend condition.";
  if (token === "BECMG") return "Becoming trend condition.";
  if (token === "INTER") return "Intermittent trend condition.";
  return "Trend condition.";
}

function matchWindToken(token) {
  return String(token || "").match(/^((?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS))$/);
}

function stripPeriod(value) {
  return String(value || "").replace(/\.$/, "");
}

function joinDecodedPhrases(values) {
  return `${values.map(stripPeriod).join("; ")}.`;
}

function lowercaseFirst(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function decodeTafRemarks(tokens) {
  const remarks = [];
  tokens.forEach((token, index) => {
    const qnh = token.match(/^QNH(\d{4})INS$/);
    if (qnh) remarks.push(`QNH ${qnh[1].slice(0, 2)}.${qnh[1].slice(2)} inches.`);
    const qnhHpa = token.match(/^QNH(\d{4})$/);
    if (qnhHpa) remarks.push(`QNH ${qnhHpa[1]} hPa.`);
    const temp = token.match(/^(TX|TN)(M?\d{2})\/(\d{4})Z$/);
    if (temp) remarks.push(`${temp[1] === "TX" ? "Maximum" : "Minimum"} temperature ${decodeSignedTemp(temp[2])}C at ${decodeTafBoundary(temp[3])}.`);
    const compactTemp = token.match(/^(TX|TN)(M?\d{1,2})\/(\d{4})Z$/);
    if (compactTemp && !temp) remarks.push(`${compactTemp[1] === "TX" ? "Maximum" : "Minimum"} temperature ${decodeSignedTemp(compactTemp[2])}C at ${decodeTafBoundary(compactTemp[3])}.`);
    if (token === "AUTOMATED" && tokens[index + 1] === "SENSOR" && tokens[index + 2] === "METWATCH") remarks.push("Automated sensor meteorological watch.");
    if (token === "AUTOMATED" && !(tokens[index + 1] === "SENSOR" && tokens[index + 2] === "METWATCH")) remarks.push("Automated forecast text.");
    if (token === "COR" && /^\d{4}$/.test(tokens[index + 1] || "")) remarks.push(`Corrected forecast issued at ${decodeTafBoundary(tokens[index + 1])}.`);
    const fs = token.match(/^FS(\d{5})$/);
    if (fs) remarks.push(`FS ${fs[1]} regional/system forecast status group retained for reference.`);
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
    decodeMetarRemarkToken(token, index, rmk).forEach((remark) => remarks.push(remark));
  });
  return remarks.length ? remarks : [`Raw remarks: ${rmk.join(" ")}.`];
}

function getMetarRemarkDecoders() {
  return [
  (token) => token === "AO1" || token === "A01" ? "Automated station without precipitation discriminator." : null,
  (token) => token === "AO2" || token === "A02" ? "Automated station with precipitation discriminator." : null,
  (token) => matchDecode(token, /^SLP(\d{3})$/, (match) => `Sea level pressure ${decodeSeaLevelPressure(match[1])} hPa.`),
  (token) => matchDecode(token, /^SLTP(\d{3})$/, (match) => `SLTP pressure group ${token}; likely sea-level pressure ${decodeSeaLevelPressure(match[1])} hPa, retained with original spelling.`),
  (token) => matchDecode(token, /^T(0|1)(\d{3})(0|1)(\d{3})$/, (match) => `Precise temperature ${decodeTenthsTemp(match[1], match[2])}C, precise dewpoint ${decodeTenthsTemp(match[3], match[4])}C.`),
  (token) => matchDecode(token, /^P(\d{4})$/, (match) => `Hourly precipitation ${Number(match[1]) / 100} inches.`),
  (token) => matchDecode(token, /^6(\d{4})$/, (match) => `Six-hour precipitation ${Number(match[1]) / 100} inches.`),
  (token) => matchDecode(token, /^1(0|1)(\d{3})$/, (match) => `Six-hour maximum temperature ${decodeTenthsTemp(match[1], match[2])}C.`),
  (token) => matchDecode(token, /^2(0|1)(\d{3})$/, (match) => `Six-hour minimum temperature ${decodeTenthsTemp(match[1], match[2])}C.`),
  (token) => matchDecode(token, /^5(\d)(\d{3})$/, (match) => `Three-hour pressure tendency code ${match[1]}, change ${Number(match[2]) / 10} hPa.`),
  (token) => matchDecode(token, /^R(\d{2}[LCR]?)\/([0-9/])([0-9/])([0-9/]{2})([0-9/]{2})$/, decodeRunwayState),
  (token) => matchDecode(token, /^PP(\d{3})$/, () => `Pressure tendency or precipitation group ${token} retained for reference.`),
  (token) => matchDecode(token, /^QFE(\d{3,4})$/, (match) => `QFE ${match[1]} mmHg.`),
  (token) => matchDecode(token, /^QFE(\d{3,4})\/(\d{3,4})$/, (match) => `QFE ${match[1]} mmHg / ${match[2]} hPa.`),
  (token) => matchDecode(token, /^(CI|CS|CC|AC|AS|NS|SC|ST|CU|CB)(\d)$/, (match) => `${decodeCloudTypeRemark(match[1])} cloud amount/opacity remark ${match[2]}/10.`),
  (token) => decodeMilitaryColourState(token) || null,
  (token) => token === "HZY" ? "Hazy." : null,
  (token) => matchDecode(token, /^8\/(\d{3})$/, (match) => `Sky condition remark 8/${match[1]} retained for reference; cloud-layer type codes are ${match[1].split("").join(", ")}.`),
  (token) => /^ST\dST\d$/.test(token) ? `Stratus cloud layer/type remark ${token}.` : null,
  (token, index, rmk) => token === "ST" && rmk[index + 1] === "TR" ? "Stratus trace." : null,
  (token) => matchDecode(token, /^CB\/([A-Z-]+)$/, (match) => `Cumulonimbus observed ${decodeSector(match[1])}.`),
  (token, index, rmk) => token === "DENSITY" && rmk[index + 1] === "ALT" && /^\d{3,5}$/.test(rmk[index + 2] || "") ? `Density altitude ${Number(rmk[index + 2]).toLocaleString("en-US")} ft.` : null,
  (token) => /^DZB\d{2}E\d{2}$/.test(token) ? `Drizzle began and ended during the hour: ${token}.` : null,
  (token) => matchDecode(token, /^RA(B|E)(\d{2})(\d{2})?$/, (match) => `Rain ${match[1] === "B" ? "began" : "ended"} at ${match[2]}${match[3] || ""}Z.`),
  (token) => matchDecode(token, /^TS(B|E)(\d{2})(\d{2})?$/, (match) => `Thunderstorm ${match[1] === "B" ? "began" : "ended"} at ${match[2]}${match[3] || ""}Z.`),
  (token) => token === "TSNO" ? "Thunderstorm information not available." : null,
  (token) => token === "FZRANO" ? "Freezing rain sensor not available." : null,
  (token) => token === "TEMPO" ? "Temporary trend condition follows." : null,
  (token, index, rmk) => {
    if (token !== "WIND" || !/^\d{3,4}FT$/.test(rmk[index + 1] || "") || !matchWindToken(rmk[index + 2])) return null;
    const height = Number(rmk[index + 1].replace("FT", "")).toLocaleString("en-US");
    return `Wind at ${height} ft: ${decodeWindToken(matchWindToken(rmk[index + 2]))}`;
  },
  (token, index, rmk) => token === "LTG" && rmk[index + 1] === "DSNT" && rmk[index + 2] === "ALQDS" ? "Lightning distant all quadrants." : null,
  (token, index, rmk) => token === "LTG" && rmk[index + 1] === "DSNT" && rmk[index + 2] !== "ALQDS" ? `Lightning distant ${decodeDirectionSequence(rmk.slice(index + 2))}.` : null,
  (token) => token === "$" ? "Automated station maintenance check indicator." : null,
  (token, index, rmk) => token === "PK" && rmk[index + 1] === "WND" ? decodePeakWind(rmk[index + 2], rmk[index + 3]) : null,
  (token, index, rmk) => token === "OBST" && rmk[index + 1] === "OBSC" ? "Obstruction obscuring observed." : null,
  (token, index, rmk) => token === "MT" && rmk[index + 1] === "OBSC" ? "Mountains obscured." : null,
  (token, index, rmk) => token === "MT" && rmk[index + 1] === "PT" && rmk[index + 2] === "OBSC" ? "Mountains partially obscured." : null,
  (token, index, rmk) => /^RWY\d{2}[LCR]?$/.test(token) && matchWindToken(rmk[index + 1]) ? `Runway ${token.slice(3)} wind ${stripPeriod(decodeWindToken(matchWindToken(rmk[index + 1])))}.` : null,
  (token, index, rmk) => token === "RWY" && /^\d{2}[LCR]?(\/\d{2}[LCR]?)?$/.test(rmk[index + 1] || "") && /^(WET|DRY|DAMP|CONTAM|CONTAMINATED|SLUSH|SNOW|ICE)$/.test(rmk[index + 2] || "") ? `Runway ${rmk[index + 1]} ${decodeRunwaySurfaceRemark(rmk[index + 2])}.` : null,
  (token, index, rmk) => token === "RWY" && /^\d{2}[LCR]?(\/\d{2}[LCR]?)?$/.test(rmk[index + 1] || "") && rmk[index + 2] === "BRAKING" && rmk[index + 3] === "ACTION" ? `Runway ${rmk[index + 1]} braking action ${decodeBrakingAction(rmk[index + 4])}.` : null,
  (token) => token === "NOSIG" ? "No significant change expected." : null,
  (token, index, rmk) => {
    if (token !== "BIRD" || rmk[index + 1] !== "HAZARD") return null;
    const runway = rmk[index + 2] === "RWY" ? ` runway ${rmk[index + 3] || ""}` : "";
    return `Bird hazard${runway}.`.trim();
  }
  ];
}

function decodeMetarRemarkToken(token, index, rmk) {
  return getMetarRemarkDecoders()
    .map((decoder) => decoder(token, index, rmk))
    .filter(Boolean);
}

function matchDecode(token, pattern, decode) {
  const match = String(token || "").match(pattern);
  return match ? decode(match) : null;
}

function decodeMilitaryColourState(token) {
  const states = {
    BLU: "Military aerodrome colour state blue: generally good operating weather.",
    WHT: "Military aerodrome colour state white: generally good operating weather.",
    GRN: "Military aerodrome colour state green.",
    YLO: "Military aerodrome colour state yellow.",
    AMB: "Military aerodrome colour state amber.",
    RED: "Military aerodrome colour state red: poor operating weather.",
    BLACK: "Military aerodrome colour state black: very poor or unsuitable operating weather."
  };
  return states[token] || "";
}

function decodeCloudTypeRemark(code) {
  const types = {
    CI: "Cirrus",
    CS: "Cirrostratus",
    CC: "Cirrocumulus",
    AC: "Altocumulus",
    AS: "Altostratus",
    NS: "Nimbostratus",
    SC: "Stratocumulus",
    ST: "Stratus",
    CU: "Cumulus",
    CB: "Cumulonimbus"
  };
  return types[code] || code;
}

function decodeRunwayState(match) {
  return `Runway ${match[1]} state group: deposit code ${match[2]}, contamination code ${match[3]}, depth code ${match[4]}, braking/friction code ${match[5]}.`;
}

function decodeRunwaySurfaceRemark(token) {
  const surfaces = {
    WET: "wet",
    DRY: "dry",
    DAMP: "damp",
    CONTAM: "contaminated",
    CONTAMINATED: "contaminated",
    SLUSH: "slush reported",
    SNOW: "snow reported",
    ICE: "ice reported"
  };
  return surfaces[token] || String(token || "").toLowerCase();
}

function decodeBrakingAction(token) {
  const action = {
    GOOD: "good",
    MEDIUM: "medium",
    POOR: "poor",
    NIL: "nil"
  }[token];
  return action || String(token || "not reported").toLowerCase();
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

function decodeDirectionSequence(tokens) {
  const directions = [];
  for (const token of tokens) {
    if (token === "AND") continue;
    if (!isDirectionToken(token)) break;
    directions.push(decodeDirection(token));
  }
  if (!directions.length) return "direction not reported";
  if (directions.length === 1) return directions[0];
  return `${directions.slice(0, -1).join(", ")} and ${directions[directions.length - 1]}`;
}

function decodeSector(value) {
  return String(value || "")
    .split("-")
    .map(decodeDirection)
    .join(" through ");
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
  return `${formatDisplayDate(date)} ${formatZuluTime(date)} ${formatUtcOffsetLabel(date)}`;
}

function formatCompactDateTime(value) {
  const date = new Date(value);
  return `${formatCompactZuluDate(date)} ${formatZuluTime(date)}`;
}

function formatPulledAtDateTime(value) {
  const date = new Date(value);
  return formatNowReference(date);
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
  return formatCompactZuluDate(date);
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

function formatNowReference(date) {
  const localDate = formatCompactLocalDate(date);
  const zuluDate = formatCompactZuluDate(date);
  const localTime = formatLocalTime(date);
  const zuluTime = formatZuluTime(date);
  const offset = formatUtcOffsetLabel(date);
  if (localDate === zuluDate) {
    return `${localDate} ${localTime} | ${zuluTime} (${offset})`;
  }
  return `${localDate} ${localTime} | ${zuluDate} ${zuluTime} (${offset})`;
}

function formatCompactLocalDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const year = String(date.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

function formatCompactZuluDate(date) {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}${month}${year}`;
}

function formatLocalTime(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}${minutes}L`;
}

function formatUtcOffsetLabel(date) {
  const offsetMinutes = -date.getTimezoneOffset();
  if (offsetMinutes === 0) return "UTC";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  return minutes === 0 ? `UTC${sign}${hours}` : `UTC${sign}${hours}:${String(minutes).padStart(2, "0")}`;
}

function formatZuluDateTimeInput(date) {
  return `${date.toISOString().slice(0, 10)}T${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

function buildZuluDateTimeIso(value) {
  if (!value) return new Date().toISOString();
  const [datePart, timePart = "00:00"] = value.split("T");
  const [hours = "00", minutes = "00"] = timePart.split(":");
  return `${datePart}T${hours.padStart(2, "0").slice(0, 2)}:${minutes.padStart(2, "0").slice(0, 2)}:00.000Z`;
}

function getFlightDurationState(takeoffValue, landingValue, referenceDate = new Date()) {
  if (!takeoffValue || !landingValue) return { label: "--", status: "" };
  const takeoff = new Date(buildZuluDateTimeIso(takeoffValue));
  const landing = new Date(buildZuluDateTimeIso(landingValue));
  const rawDurationMinutes = Math.round((landing.getTime() - takeoff.getTime()) / 60000);
  const durationMinutes = Math.abs(rawDurationMinutes);
  const label = `${rawDurationMinutes < 0 ? "-" : ""}${formatDurationMinutes(durationMinutes)}`;
  const status = rawDurationMinutes < 0 || landing.getTime() < referenceDate.getTime() ? "bad" : "good";
  return { label, status };
}

function formatDurationMinutes(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return `${String(hours).padStart(2, "0")}${String(minutes).padStart(2, "0")}`;
}

function parseDurationInput(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length <= 2) return Number(digits) * 60;
  const normalized = digits.padStart(4, "0").slice(-4);
  const hours = Number(normalized.slice(0, 2));
  const minutes = Number(normalized.slice(2, 4));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + Math.min(minutes, 59);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Local previews still work without offline caching.
    });
  }
}
