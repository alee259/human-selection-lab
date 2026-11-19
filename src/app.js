"use strict";

// ============================================================
// 1. SIMULATION STATE
// ============================================================

let selectedScenario = "sickleCell";
let settings = { ...presets.sickleCell };

let alleleChart = null;
let comparisonMode = false;
let activeComparison = null; // { population1, population2, datasetName }

// Scenario-specific chart titles
const scenarioTitles = {
  sickleCell: "HbS Allele Frequency Over Time",
  lactase: "Lactase Persistence — Allele Frequency Over Time",
  founder: "Allele A Frequency — Founder Effect",
  altitude: "High-Altitude Adaptation — Allele Frequency Over Time",
  custom: "Allele A Frequency Over Time",
};

// Map datasets to simulation presets
const scenarioMap = {
  hbs: "sickleCell",
  lactase: "lactase",
  epas1: "altitude",
};

// ============================================================
// 2. HTML ELEMENTS
// ============================================================

const runButton = document.getElementById("runButton");
const runMultipleButton = document.getElementById("runMultipleButton");
const resetButton = document.getElementById("resetButton");

const chartCanvas = document.getElementById("alleleChart");
const chartTitle = document.getElementById("chartTitle");
const exitComparisonButton = document.getElementById("exitComparisonButton");

const scenarioCards = document.querySelectorAll(".scenario-card");

const runCount = document.getElementById("runCount");
const lossCount = document.getElementById("lossCount");
const fixationCount = document.getElementById("fixationCount");

const interpretationPanel = document.querySelector(".interpretation-panel");

const comparisonResultsPanel = document.getElementById("comparisonResults");

const resultsSummary = document.querySelector(".results-summary");

// ============================================================
// 3. EVOLUTIONARY FORCE AND PARAMETER CONTROLS
// ============================================================

const forceNames = [
  "enableMutation",
  "enableGeneFlow",
  "enableSelection",
  "enableDrift",
];

const parameterNames = [
  "populationSize",
  "startingAlleleFreq",
  "generations",
  "yearsPerGeneration",
  "fitnessAA",
  "fitnessAa",
  "fitnessaa",
  "forwardMutationRate",
  "reverseMutationRate",
  "migrationRate",
  "sourceAlleleFreq",
  "migrationGenerations",
];

const integerParameters = new Set([
  "populationSize",
  "generations",
  "migrationGenerations",
  "yearsPerGeneration",
]);

function updateForceControls() {
  forceNames.forEach((forceName) => {
    const checkbox = document.getElementById(forceName);
    checkbox.checked = settings[forceName];
  });
}

function updateParameterControls() {
  parameterNames.forEach((name) => {
    const slider = document.getElementById(name);
    const numberInput = document.getElementById(`${name}Value`);

    slider.value = settings[name];
    numberInput.value = settings[name];
  });
}

function validateParameter(name, value, input) {
  const min = Number(input.min);
  const max = Number(input.max);

  if (!Number.isFinite(value)) {
    return settings[name];
  }

  let validValue = Math.min(max, Math.max(min, value));

  if (integerParameters.has(name)) {
    validValue = Math.round(validValue);
  }

  return validValue;
}

// Connect evolutionary force switches
forceNames.forEach((forceName) => {
  const checkbox = document.getElementById(forceName);

  checkbox.addEventListener("change", () => {
    settings[forceName] = checkbox.checked;
  });
});

// Connect sliders and number inputs
parameterNames.forEach((name) => {
  const slider = document.getElementById(name);
  const numberInput = document.getElementById(`${name}Value`);

  slider.addEventListener("input", () => {
    const value = Number(slider.value);

    settings[name] = value;
    numberInput.value = value;
  });

  numberInput.addEventListener("change", () => {
    const value =
      numberInput.value.trim() === "" ? NaN : Number(numberInput.value);

    const validValue = validateParameter(name, value, numberInput);

    settings[name] = validValue;
    slider.value = validValue;
    numberInput.value = validValue;
  });
});

// ============================================================
// 4. CHART CONFIGURATION
// ============================================================

// Shared Chart.js options for normal and comparison modes
function createChartOptions(showLegend = false) {
  const axisColor = "#8795a7";
  const gridColor = "rgba(148, 163, 184, 0.3)";

  return {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: axisColor,
        },
      },
    },

    scales: {
      x: {
        title: {
          display: true,
          text: "Generation",
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },

      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: "Allele frequency",
          color: axisColor,
        },
        ticks: {
          color: axisColor,
        },
        grid: {
          color: gridColor,
        },
      },
    },
  };
}

// Reusable chart-rendering function
function renderChart(datasets, generationCount, showLegend = false) {
  if (alleleChart !== null) {
    alleleChart.destroy();
  }

  const generations = Array.from(
    { length: generationCount + 1 },
    (_, index) => index,
  );

  alleleChart = new Chart(chartCanvas, {
    type: "line",

    data: {
      labels: generations,
      datasets,
    },

    options: createChartOptions(showLegend),
  });
}

// ============================================================
// 5. RESULTS AND EVOLUTIONARY TIME
// ============================================================

function updateResultsSummary(allResults) {
  let lost = 0;
  let fixed = 0;

  allResults.forEach((results) => {
    if (results.includes(0)) {
      lost++;
    }

    if (results.includes(1)) {
      fixed++;
    }
  });

  runCount.textContent = `Runs: ${allResults.length}`;
  lossCount.textContent = `Allele Lost: ${lost}`;
  fixationCount.textContent = `Allele Fixed: ${fixed}`;
}

function describeAlleleOutcome(results) {
  const startingFrequency = results[0];
  const finalFrequency = results.at(-1);

  const firstLoss = results.indexOf(0);
  const firstFixation = results.indexOf(1);

  if (firstLoss !== -1 || firstFixation !== -1) {
    const lossOccurredFirst =
      firstLoss !== -1 && (firstFixation === -1 || firstLoss < firstFixation);

    const eventGeneration = lossOccurredFirst ? firstLoss : firstFixation;

    const eventName = lossOccurredFirst ? "Allele loss" : "Allele fixation";

    return `${eventName} first occurred at generation ${eventGeneration}.`;
  }

  if (finalFrequency > startingFrequency) {
    return "The tracked allele increased in frequency.";
  }

  if (finalFrequency < startingFrequency) {
    return "The tracked allele decreased in frequency.";
  }

  return "The tracked allele ended at its starting frequency.";
}

// Explain enabled mechanisms without treating the observed path as proof of causation.
function explainMechanisms(results, runSettings = settings) {
  const start = results[0];
  const end = results.at(-1);
  const notes = [];
  const delta = end - start;
  const direction = Math.abs(delta) < 1e-10 ? "unchanged overall" :
    delta > 0 ? "increased overall" : "decreased overall";
  notes.push(`The tracked frequency ${direction} from ${(start * 100).toFixed(1)}% to ${(end * 100).toFixed(1)}% over ${results.length - 1} generations.`);

  if (runSettings.enableSelection) {
    const { fitnessAA: aa, fitnessAa: hetero, fitnessaa: other } = runSettings;
    if (aa === hetero && hetero === other) {
      notes.push("Selection is enabled, but all three genotype fitnesses are equal, so it has no effect.");
    } else {
      try {
        const selected = applySelection(start, aa, hetero, other);
        const selectionDirection = selected > start + 1e-10 ? "favors an increase in" :
          selected < start - 1e-10 ? "favors a decrease in" : "does not initially change";
        notes.push(`With the specified genotype fitnesses, selection alone ${selectionDirection} the tracked frequency at its starting value. Its effect may change as allele frequencies change.`);
        if (hetero > aa && hetero > other) {
          notes.push("Heterozygote advantage can maintain both genetic states at an intermediate frequency rather than driving one to fixation.");
        }
      } catch (error) {
        notes.push("Selection could not be evaluated at the initial frequency with these fitness values.");
      }
    }
  }
  if (runSettings.enableMutation) {
    const net = (1 - start) * runSettings.forwardMutationRate - start * runSettings.reverseMutationRate;
    notes.push(`Mutation changes copies in both directions (a to A: ${runSettings.forwardMutationRate}; A to a: ${runSettings.reverseMutationRate}). At the starting frequency, its expected direct contribution is ${net >= 0 ? "+" : ""}${net.toFixed(5)} per generation before other forces.`);
  }
  if (runSettings.enableGeneFlow) {
    if (runSettings.migrationGenerations > 0 && runSettings.migrationRate > 0) {
      notes.push(`For the first ${Math.min(runSettings.generations, runSettings.migrationGenerations)} generations, migration (${(runSettings.migrationRate * 100).toFixed(1)}% per generation) pulls the frequency toward the source frequency of ${(runSettings.sourceAlleleFreq * 100).toFixed(1)}%.`);
    } else {
      notes.push("Gene flow is enabled but its rate or duration is zero, so it has no effect.");
    }
  }
  if (runSettings.enableDrift) {
    notes.push(`Drift samples ${2 * runSettings.populationSize} allele copies each generation. Chance can push the path above or below its expected trend; smaller populations generally fluctuate more.`);
  } else {
    notes.push("Drift is disabled, so repeated runs with identical parameters follow the same deterministic trajectory.");
  }
  if (!runSettings.enableMutation && !runSettings.enableGeneFlow && !runSettings.enableSelection && !runSettings.enableDrift) {
    notes.push("No forces are enabled, so the frequency remains constant.");
  }
  notes.push("These are explanations of the model's mechanisms, not proof of which force caused each movement or a reconstruction of a real population's history.");
  return notes.join(" ");
}

function explainEvolutionaryTime(runSettings = settings) {
  const years = runSettings.generations * runSettings.yearsPerGeneration;
  const selectionNote = runSettings.enableSelection
    ? "Fitness differences influence the pace of allele-frequency change: larger advantages often cause faster shifts, but the starting frequency, genotype relationships, and other forces matter too."
    : "Natural selection is disabled in this run; changes, if any, come from other enabled forces.";
  return `${runSettings.generations} generations at ${runSettings.yearsPerGeneration} years each represent approximately ${years.toLocaleString()} years. ${selectionNote} Changing years per generation only changes this calendar-time conversion; it does not alter the simulation trajectory. These are illustrative times, not dated historical estimates.`;
}

function updateMechanismExplanation(results, runSettings = settings) {
  const element = document.getElementById("mechanismExplanation");
  if (element) element.textContent = explainMechanisms(results, runSettings);
}

function updateInterpretation(allResults) {
  const firstRun = allResults[0];

  const startingFrequency = firstRun[0];
  const finalFrequency = firstRun.at(-1);

  const finalFrequencies = allResults.map((results) => results.at(-1));

  const meanFinalFrequency =
    finalFrequencies.reduce((sum, frequency) => sum + frequency, 0) /
    finalFrequencies.length;

  document.getElementById("startingFrequencyResult").textContent =
    startingFrequency.toFixed(3);

  document.getElementById("finalFrequencyResult").textContent =
    finalFrequency.toFixed(3);

  document.getElementById("meanFrequencyResult").textContent =
    meanFinalFrequency.toFixed(3);

  document.getElementById("outcomeExplanation").textContent =
    describeAlleleOutcome(firstRun);

  const firstEventGeneration = firstRun.findIndex(
    (frequency) => frequency === 0 || frequency === 1,
  );

  const eventTiming = document.getElementById("eventTiming");

  if (firstEventGeneration >= 0) {
    const eventType =
      firstRun[firstEventGeneration] === 0 ? "loss" : "fixation";

    eventTiming.textContent =
      `Highlighted run first reached ${eventType} ` +
      `at generation ${firstEventGeneration}.`;
  } else {
    eventTiming.textContent =
      "The highlighted run did not reach loss or fixation.";
  }
}

function updateEvolutionaryTime() {
  const elapsedYears = settings.generations * settings.yearsPerGeneration;

  document.getElementById("generationsResult").textContent =
    settings.generations;

  document.getElementById("yearsPerGenerationResult").textContent =
    settings.yearsPerGeneration;

  document.getElementById("elapsedYearsResult").textContent =
    `${elapsedYears.toLocaleString()} years`;

  const timeExplanation = document.getElementById("timeExplanation");
  if (timeExplanation) timeExplanation.textContent = explainEvolutionaryTime();
}

// ============================================================
// 6. NORMAL SIMULATION MODE
// ============================================================

function displayResults(allResults) {
  comparisonMode = false;
  activeComparison = null;
  runButton.textContent = "Run Simulation";
  exitComparisonButton.hidden = true;

  // Restore normal interface
  chartTitle.textContent = scenarioTitles[selectedScenario];

  interpretationPanel.hidden = false;
  resultsSummary.hidden = false;
  comparisonResultsPanel.hidden = true;

  const datasets = allResults.map((results, index) => {
    const highlighted = index === 0;

    return {
      label: `Run ${index + 1}`,
      data: results,

      borderColor: highlighted ? "#a8ffb2" : "rgba(168, 255, 178, 0.25)",

      borderWidth: highlighted ? 3 : 1.5,
      pointRadius: 0,
      tension: 0,
    };
  });

  renderChart(datasets, allResults[0].length - 1, false);

  updateResultsSummary(allResults);
  updateInterpretation(allResults);
  updateEvolutionaryTime();
  updateMechanismExplanation(allResults[0]);
}

function runAndDisplay() {
  if (comparisonMode && activeComparison) {
    runActiveComparison();
    return;
  }
  try {
    const results = runSimulation(settings);
    displayResults([results]);
  } catch (error) {
    alert("Simulation error: " + error.message);
  }
}

function runMultipleSimulations() {
  try {
    const allResults = [];

    for (let i = 0; i < 10; i++) {
      allResults.push(runSimulation(settings));
    }

    displayResults(allResults);
  } catch (error) {
    alert("Simulation error: " + error.message);
  }
}

// ============================================================
// 7. POPULATION COMPARISON MODE
// ============================================================

function updateComparisonResults(results1, results2, population1, population2) {
  const populations = [
    { results: results1, population: population1 },
    { results: results2, population: population2 },
  ];

  populations.forEach(({ results, population }, index) => {
    const number = index + 1;

    document.getElementById(`comparisonResultName${number}`).textContent =
      population.population;

    document.getElementById(`comparisonStart${number}`).textContent =
      results[0].toFixed(3);

    document.getElementById(`comparisonFinal${number}`).textContent = results
      .at(-1)
      .toFixed(3);

    document.getElementById(`comparisonOutcome${number}`).textContent =
      describeAlleleOutcome(results);
  });
}

function displayComparison(results1, results2, population1, population2) {
  comparisonMode = true;
  runButton.textContent = "Rerun Comparison";
  exitComparisonButton.hidden = false;

  // Update interface for comparison mode
  chartTitle.textContent = `${scenarioTitles[selectedScenario]} — Population Comparison`;

  interpretationPanel.hidden = true;
  resultsSummary.hidden = true;
  comparisonResultsPanel.hidden = false;

  const datasets = [
    {
      label: population1.population,
      data: results1,
      borderColor: "#a8ffb2",
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0,
    },
    {
      label: population2.population,
      data: results2,
      borderColor: "#f5c77a",
      borderWidth: 2.5,
      pointRadius: 0,
      tension: 0,
    },
  ];

  renderChart(datasets, results1.length - 1, true);

  updateComparisonResults(results1, results2, population1, population2);

  const comparisonExplanation = document.getElementById("comparisonMechanismExplanation");
  if (comparisonExplanation) {
    comparisonExplanation.textContent =
      `Both runs use the same settings except for their starting frequencies. ` +
      `Population 1: ${explainMechanisms(results1)} Population 2: ${explainMechanisms(results2)} ` +
      `These simulations are independent; they do not exchange migrants with each other.`;
  }

  updateEvolutionaryTime();
}

function runActiveComparison() {
  if (!activeComparison) return;
  const { population1, population2 } = activeComparison;

  // Both populations use the current editable settings, except initial p.
  const settings1 = { ...settings, startingAlleleFreq: population1.frequency };
  const settings2 = { ...settings, startingAlleleFreq: population2.frequency };

  try {
    const results1 = runSimulation(settings1);
    const results2 = runSimulation(settings2);
    displayComparison(results1, results2, population1, population2);
  } catch (error) {
    alert("Comparison error: " + error.message);
  }
}

function comparePopulations(population1, population2, datasetName) {
  const scenarioName = scenarioMap[datasetName];
  if (!scenarioName) {
    console.error("Unknown comparison dataset:", datasetName);
    return;
  }

  selectedScenario = scenarioName;
  settings = { ...presets[scenarioName] };
  activeComparison = {
    population1: { ...population1 },
    population2: { ...population2 },
    datasetName,
  };

  scenarioCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.scenario === scenarioName);
  });
  updateForceControls();
  updateParameterControls();
  updateEducationContent(selectedScenario);
  runActiveComparison();
}

// ============================================================
// 8. BUTTONS AND SCENARIO SELECTION
// ============================================================

runButton.addEventListener("click", runAndDisplay);

runMultipleButton.addEventListener("click", runMultipleSimulations);

// Explicitly exit comparison mode and restore the current scenario.
exitComparisonButton.addEventListener("click", () => {
  comparisonMode = false;
  activeComparison = null;
  runAndDisplay();
});

// Change scenario
scenarioCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedScenario = card.dataset.scenario;
    settings = { ...presets[selectedScenario] };
    comparisonMode = false;
    activeComparison = null;

    scenarioCards.forEach((otherCard) => {
      otherCard.classList.toggle("selected", otherCard === card);
    });

    updateForceControls();
    updateParameterControls();

    runAndDisplay();
  });
});

// Reset selected scenario
resetButton.addEventListener("click", () => {
  comparisonMode = false;
  activeComparison = null;
  settings = { ...presets[selectedScenario] };

  updateForceControls();
  updateParameterControls();

  runAndDisplay();
});

// ============================================================
// 9. INITIALIZATION
// ============================================================

updateForceControls();
updateParameterControls();

chartTitle.textContent = scenarioTitles[selectedScenario];

// Ensure the correct panels are visible initially
interpretationPanel.hidden = false;
resultsSummary.hidden = false;
comparisonResultsPanel.hidden = true;

// The starting screen uses the default scenario; render it immediately.
runAndDisplay();
