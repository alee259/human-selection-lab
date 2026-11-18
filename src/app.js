"use strict";

// ============================================================
// 1. SIMULATION STATE
// ============================================================

let selectedScenario = "sickleCell";
let settings = { ...presets.sickleCell };

let alleleChart = null;
let comparisonMode = false;

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
}

// ============================================================
// 6. NORMAL SIMULATION MODE
// ============================================================

function displayResults(allResults) {
  comparisonMode = false;

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
}

function runAndDisplay() {
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

  updateEvolutionaryTime();
}

function comparePopulations(population1, population2, datasetName) {
  const scenarioName = scenarioMap[datasetName];

  if (!scenarioName) {
    console.error("Unknown comparison dataset:", datasetName);
    return;
  }

  // Load the appropriate scenario preset
  selectedScenario = scenarioName;
  settings = { ...presets[scenarioName] };

  // Highlight the selected scenario
  scenarioCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.scenario === scenarioName);
  });

  updateForceControls();
  updateParameterControls();

  // Use the same evolutionary parameters,
  // but different starting allele frequencies
  const settings1 = {
    ...settings,
    startingAlleleFreq: population1.frequency,
  };

  const settings2 = {
    ...settings,
    startingAlleleFreq: population2.frequency,
  };

  try {
    const results1 = runSimulation(settings1);
    const results2 = runSimulation(settings2);

    displayComparison(results1, results2, population1, population2);
  } catch (error) {
    alert("Comparison error: " + error.message);
  }
}

// ============================================================
// 8. BUTTONS AND SCENARIO SELECTION
// ============================================================

runButton.addEventListener("click", runAndDisplay);

runMultipleButton.addEventListener("click", runMultipleSimulations);

// Change scenario
scenarioCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedScenario = card.dataset.scenario;
    settings = { ...presets[selectedScenario] };

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
