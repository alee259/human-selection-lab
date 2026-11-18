// Starting scenario and settings
let selectedScenario = "sickleCell";
let settings = { ...presets.sickleCell };

// HTML elements
const runButton = document.getElementById("runButton");
const runMultipleButton = document.getElementById("runMultipleButton");
const resetButton = document.getElementById("resetButton");

const chartCanvas = document.getElementById("alleleChart");
const scenarioCards = document.querySelectorAll(".scenario-card");

const runCount = document.getElementById("runCount");
const lossCount = document.getElementById("lossCount");
const fixationCount = document.getElementById("fixationCount");

let alleleChart = null;

// Evolutionary force toggles
const forceNames = [
  "enableMutation",
  "enableGeneFlow",
  "enableSelection",
  "enableDrift",
];

// Parameter names match the IDs in index.html
const parameterNames = [
  "populationSize",
  "startingAlleleFreq",
  "generations",
  "fitnessAA",
  "fitnessAa",
  "fitnessaa",
  "forwardMutationRate",
  "reverseMutationRate",
  "migrationRate",
  "sourceAlleleFreq",
  "migrationGenerations",
];

// Parameters that must be whole numbers
const integerParameters = [
  "populationSize",
  "generations",
  "migrationGenerations",
];

// Update evolutionary force switches
function updateForceControls() {
  forceNames.forEach((forceName) => {
    const checkbox = document.getElementById(forceName);
    checkbox.checked = settings[forceName];
  });
}

// Update sliders and number inputs
function updateParameterControls() {
  parameterNames.forEach((name) => {
    const slider = document.getElementById(name);
    const numberInput = document.getElementById(name + "Value");

    slider.value = settings[name];
    numberInput.value = settings[name];
  });
}

// Validate numerical inputs
function validateParameter(name, value, input) {
  const min = Number(input.min);
  const max = Number(input.max);

  // Reject invalid or empty inputs
  if (!Number.isFinite(value)) {
    return settings[name];
  }

  // Restrict value to allowed range
  let validValue = Math.min(max, Math.max(min, value));

  // Round integer-only parameters
  if (integerParameters.includes(name)) {
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

// Connect sliders and editable number fields
parameterNames.forEach((name) => {
  const slider = document.getElementById(name);
  const numberInput = document.getElementById(name + "Value");

  // Slider updates number input
  slider.addEventListener("input", () => {
    const value = Number(slider.value);

    settings[name] = value;
    numberInput.value = value;
  });

  // Number input updates slider
  numberInput.addEventListener("change", () => {
    const value =
      numberInput.value.trim() === "" ? NaN : Number(numberInput.value);

    const validValue = validateParameter(name, value, numberInput);

    settings[name] = validValue;
    slider.value = validValue;
    numberInput.value = validValue;
  });
});

// Count allele loss and fixation across runs
function updateResultsSummary(allResults) {
  let lost = 0;
  let fixed = 0;

  allResults.forEach((results) => {
    // Count runs that reached frequency 0
    if (results.includes(0)) {
      lost++;
    }

    // Count runs that reached frequency 1
    if (results.includes(1)) {
      fixed++;
    }
  });

  runCount.textContent = `Runs: ${allResults.length}`;
  lossCount.textContent = `Allele Lost: ${lost}`;
  fixationCount.textContent = `Allele Fixed: ${fixed}`;
}

// Display one or more simulation trajectories
function displayResults(allResults) {
  // Generation labels: 0, 1, 2, ...
  const generations = allResults[0].map((_, index) => index);

  // Create one dataset per simulation
  const datasets = allResults.map((results, index) => {
    const highlighted = index === 0;

    return {
      label: `Run ${index + 1}`,
      data: results,

      borderColor: highlighted ? "#ff6b61" : "rgba(255, 107, 97, 0.25)",

      borderWidth: highlighted ? 3 : 1.5,
      pointRadius: 0,
      tension: 0,
    };
  });

  // Remove previous chart
  if (alleleChart !== null) {
    alleleChart.destroy();
  }

  // Create new chart
  alleleChart = new Chart(chartCanvas, {
    type: "line",

    data: {
      labels: generations,
      datasets: datasets,
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          title: {
            display: true,
            text: "Generation",
            color: "#8795a7",
          },
          ticks: {
            color: "#8795a7",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },

        y: {
          min: 0,
          max: 1,
          title: {
            display: true,
            text: "Allele A frequency",
            color: "#8795a7",
          },
          ticks: {
            color: "#8795a7",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.3)",
          },
        },
      },
    },
  });

  // Update result counters
  updateResultsSummary(allResults);
}

// Run one simulation
function runAndDisplay() {
  try {
    const results = runSimulation(settings);
    displayResults([results]);
  } catch (error) {
    alert("Simulation error: " + error.message);
  }
}

// Run 10 independent simulations
function runMultipleSimulations() {
  const allResults = [];

  try {
    for (let i = 0; i < 10; i++) {
      const results = runSimulation(settings);
      allResults.push(results);
    }

    displayResults(allResults);
  } catch (error) {
    alert("Simulation error: " + error.message);
  }
}

// Run button
runButton.addEventListener("click", runAndDisplay);

// Run 10 Times button
runMultipleButton.addEventListener("click", runMultipleSimulations);

// Handle scenario selection
scenarioCards.forEach((card) => {
  card.addEventListener("click", () => {
    // Remove highlight from all cards
    scenarioCards.forEach((otherCard) => {
      otherCard.classList.remove("selected");
    });

    // Highlight selected card
    card.classList.add("selected");

    // Load the selected scenario
    selectedScenario = card.dataset.scenario;
    settings = { ...presets[selectedScenario] };

    // Synchronize controls
    updateForceControls();
    updateParameterControls();

    // Run selected scenario
    runAndDisplay();
  });
});

// Reset to original preset settings
resetButton.addEventListener("click", () => {
  settings = { ...presets[selectedScenario] };

  updateForceControls();
  updateParameterControls();

  runAndDisplay();
});

// Initialize controls when the page loads
updateForceControls();
updateParameterControls();
