"use strict";

// ============================================================
// 1. MAP INITIALIZATION
// ============================================================

const worldMap = L.map("worldMap", {
  center: [15, 0],
  zoom: 2,
  minZoom: 1,
  maxZoom: 6,
  zoomControl: true,
  attributionControl: false,
  worldCopyJump: false,
  zoomSnap: 0.1,
});

// Geographic bounds excluding Antarctica
const worldBounds = L.latLngBounds([-60, -170], [85, 180]);

// ============================================================
// 2. MAP ELEMENTS AND STATE
// ============================================================

const mapDataset = document.getElementById("mapDataset");
const showOrigins = document.getElementById("showOrigins");

const compareButton = document.getElementById("compareButton");
const clearComparisonButton = document.getElementById("clearComparisonButton");

const comparisonPopulation1 = document.getElementById("comparisonPopulation1");

const comparisonPopulation2 = document.getElementById("comparisonPopulation2");

// Independent map layers
const frequencyLayer = L.layerGroup().addTo(worldMap);
const originLayer = L.layerGroup().addTo(worldMap);

// Currently selected populations
let selectedPopulations = [];

// Dataset file paths
const datasetFiles = {
  hbs: "data/hbs-frequencies.json",
  lactase: "data/lactase-frequencies.json",
  epas1: "data/epas1-frequencies.json",
};

// Cache loaded datasets
const datasetCache = new Map();

// Prevent older requests from replacing newer selections
let currentRequest = 0;

// ============================================================
// 3. HELPER FUNCTIONS
// ============================================================

// Escape text before inserting it into HTML popups
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character];
  });
}

// Validate geographic coordinates
function hasValidCoordinates(latitude, longitude) {
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// ============================================================
// 4. COUNTRY BOUNDARIES
// ============================================================

fetch("data/world.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load world.geojson");
    }

    return response.json();
  })
  .then((worldData) => {
    const countries = L.geoJSON(worldData, {
      // Exclude Antarctica
      filter: (feature) => {
        return feature.properties?.ADMIN !== "Antarctica";
      },

      // Country styling
      style: {
        color: "#344454",
        weight: 1,
        fillColor: "#1e2b39",
        fillOpacity: 1,
      },

      // Country hover effects
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties?.ADMIN || "Unknown region";

        layer.bindTooltip(countryName, {
          sticky: true,
          direction: "top",
        });

        layer.on("mouseover", () => {
          layer.setStyle({
            fillColor: "#2b433b",
            color: "#a8ffb2",
            weight: 1.5,
          });
        });

        layer.on("mouseout", () => {
          countries.resetStyle(layer);
        });
      },
    }).addTo(worldMap);

    worldMap.fitBounds(worldBounds, {
      padding: [10, 10],
      animate: false,
    });

    // Keep population markers above country boundaries
    frequencyLayer.bringToFront?.();

    console.log(
      "World map loaded:",
      countries.getLayers().length,
      "geographic features",
    );
  })
  .catch((error) => {
    console.error("Map loading error:", error);
  });

// ============================================================
// 5. DATASET LOADING
// ============================================================

async function loadDataset(datasetName) {
  // Return cached data if already loaded
  if (datasetCache.has(datasetName)) {
    return datasetCache.get(datasetName);
  }

  const filePath = datasetFiles[datasetName];

  if (!filePath) {
    throw new Error(`Unknown map dataset: ${datasetName}`);
  }

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Could not load ${filePath}`);
  }

  const data = await response.json();

  // Population observations are required
  if (!Array.isArray(data.observations)) {
    throw new Error(`Missing or invalid observations in ${datasetName}`);
  }

  // Historical annotations are optional
  if (data.history == null) {
    data.history = [];
  } else if (!Array.isArray(data.history)) {
    throw new Error(`Invalid history data in ${datasetName}`);
  }

  datasetCache.set(datasetName, data);

  return data;
}

// ============================================================
// 6. SCIENTIFIC CONTEXT
// ============================================================

function updateMapContext(datasetName) {
  // mapContent is defined in map-content.js
  if (typeof mapContent === "undefined" || !mapContent[datasetName]) {
    console.warn("Scientific context unavailable for:", datasetName);
    return;
  }

  const content = mapContent[datasetName];

  const contextFields = {
    mapContextTitle: content.title,
    mapPopulationExplanation: content.populations,
    mapHistoryExplanation: content.history,
    mapLimitations: content.limitations,
  };

  // Update explanatory text
  Object.entries(contextFields).forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = value ?? "";
    }
  });

  // Update scientific research link
  const researchLink = document.getElementById("mapResearchLink");

  if (researchLink && content.source) {
    researchLink.href = content.source;
    researchLink.hidden = false;
  }
}

// ============================================================
// 7. POPULATION COMPARISON SELECTION
// ============================================================

function updateComparisonControls() {
  const first = selectedPopulations[0];
  const second = selectedPopulations[1];

  comparisonPopulation1.textContent = first
    ? `${first.population} (${(first.frequency * 100).toFixed(1)}%)`
    : "Not selected";

  comparisonPopulation2.textContent = second
    ? `${second.population} (${(second.frequency * 100).toFixed(1)}%)`
    : "Not selected";

  compareButton.disabled = selectedPopulations.length !== 2;
}

function selectPopulation(observation) {
  // Prevent selecting the same population twice
  const alreadySelected = selectedPopulations.some(
    (population) => population.population === observation.population,
  );

  if (alreadySelected) {
    return;
  }

  // Begin a new pair if two were already selected
  if (selectedPopulations.length === 2) {
    selectedPopulations = [];
  }

  selectedPopulations.push(observation);

  updateComparisonControls();
}

function clearPopulationSelection() {
  selectedPopulations = [];
  updateComparisonControls();
}

// ============================================================
// 8. POPULATION FREQUENCY MARKERS
// ============================================================

function addFrequencyMarker(observation, variant) {
  const frequency = Number(observation.frequency);
  const latitude = Number(observation.latitude);
  const longitude = Number(observation.longitude);

  // Reject invalid frequencies or coordinates
  if (
    !Number.isFinite(frequency) ||
    frequency < 0 ||
    frequency > 1 ||
    !hasValidCoordinates(latitude, longitude)
  ) {
    console.warn("Invalid population observation:", observation);
    return;
  }

  // Higher allele frequencies produce larger circles
  const radius = 5 + 16 * Math.sqrt(frequency);

  const marker = L.circleMarker([latitude, longitude], {
    radius,
    color: "#a8ffb2",
    weight: 2,
    fillColor: "#a8ffb2",
    fillOpacity: 0.55,
  });

  const sampleSize =
    observation.sampleSize == null ? "Not specified" : observation.sampleSize;

  // Population information popup
  const popup = `
    <div class="genetic-popup">
      <strong>${escapeHTML(observation.population)}</strong>

      <p>${escapeHTML(observation.region)}</p>

      <p>
        <strong>${escapeHTML(variant)}</strong><br>
        Allele frequency:
        ${(frequency * 100).toFixed(1)}%
      </p>

      <p>
        Sample size: ${escapeHTML(sampleSize)}
      </p>

      <p>${escapeHTML(observation.notes)}</p>

      <a
        href="${escapeHTML(observation.sourceUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeHTML(observation.source)}
      </a>
    </div>
  `;

  marker.bindPopup(popup);

  // Select population when marker is clicked
  marker.on("click", () => {
    selectPopulation(observation);
  });

  marker.addTo(frequencyLayer);
}

// ============================================================
// 9. EVOLUTIONARY HISTORY MARKERS
// ============================================================

function addHistoryMarker(record) {
  // Currently supports historical selection regions
  if (record.type !== "selection_region" || !Array.isArray(record.bounds)) {
    return;
  }

  const region = L.rectangle(record.bounds, {
    color: "#f5c77a",
    weight: 2,
    fillColor: "#f5c77a",
    fillOpacity: 0.1,
    dashArray: "6, 5",
  });

  const popup = `
    <div class="genetic-popup">
      <strong>${escapeHTML(record.label)}</strong>

      <p>${escapeHTML(record.period)}</p>

      <p>${escapeHTML(record.notes)}</p>

      <a
        href="${escapeHTML(record.sourceUrl)}"
        target="_blank"
        rel="noopener noreferrer"
      >
        ${escapeHTML(record.source)}
      </a>
    </div>
  `;

  region.bindPopup(popup);
  region.addTo(originLayer);
}

// ============================================================
// 10. DATASET SELECTION
// ============================================================

async function updateMapDataset() {
  const datasetName = mapDataset.value;
  const requestId = ++currentRequest;

  // Clear previous dataset
  frequencyLayer.clearLayers();
  originLayer.clearLayers();

  // Prevent comparisons between different genetic variants
  clearPopulationSelection();

  // Update scientific explanations immediately
  updateMapContext(datasetName);

  try {
    const data = await loadDataset(datasetName);

    // Ignore responses from outdated requests
    if (requestId !== currentRequest) {
      return;
    }

    // Add observed population-frequency markers
    data.observations.forEach((observation) => {
      addFrequencyMarker(observation, data.trackedAllele);
    });

    // Add evolutionary-history annotations
    data.history.forEach((record) => {
      addHistoryMarker(record);
    });

    // Explain when no geographic historical annotations exist
    const historyNotice = document.getElementById("mapHistoryNotice");

    if (data.history.length === 0) {
      historyNotice.textContent =
        "No geographically precise historical annotation is available " +
        "for this variant. See Evolutionary History below for " +
        "information about its proposed origins and selection history.";

      historyNotice.hidden = false;
    } else {
      historyNotice.textContent = "";
      historyNotice.hidden = true;
    }

    console.log(
      `${data.name}:`,
      data.observations.length,
      "population observations,",
      data.history.length,
      "historical annotations",
    );
  } catch (error) {
    if (requestId === currentRequest) {
      console.error("Dataset loading error:", error);
    }
  }
}

// ============================================================
// 11. EVOLUTIONARY HISTORY VISIBILITY
// ============================================================

function updateOriginVisibility() {
  if (showOrigins.checked) {
    originLayer.addTo(worldMap);
  } else {
    worldMap.removeLayer(originLayer);
  }
}

// ============================================================
// 12. EVENT LISTENERS
// ============================================================

// Change genetic dataset
mapDataset.addEventListener("change", updateMapDataset);

// Toggle historical evidence
showOrigins.addEventListener("change", updateOriginVisibility);

// Recalculate Leaflet dimensions on window resize
window.addEventListener("resize", () => {
  worldMap.invalidateSize();
});

// Compare two selected populations
compareButton.addEventListener("click", () => {
  if (selectedPopulations.length !== 2) {
    return;
  }

  // comparePopulations() is defined in app.js
  comparePopulations(
    selectedPopulations[0],
    selectedPopulations[1],
    mapDataset.value,
  );

  // Scroll to simulation results
  document.querySelector(".chart-panel").scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

// Clear selected populations
clearComparisonButton.addEventListener("click", clearPopulationSelection);

// ============================================================
// 13. INITIALIZATION
// ============================================================

updateComparisonControls();
updateMapDataset();
updateOriginVisibility();
