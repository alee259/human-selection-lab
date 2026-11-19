"use strict";

// ============================================================
// 1. EDUCATIONAL CONTENT ELEMENTS
// ============================================================

const educationTitle = document.getElementById("educationTitle");
const educationBackground = document.getElementById("educationBackground");
const educationMechanism = document.getElementById("educationMechanism");
const educationPrediction = document.getElementById("educationPrediction");
const educationCaveat = document.getElementById("educationCaveat");
const educationSources = document.getElementById("educationSources");

// ============================================================
// 2. DISPLAY EDUCATIONAL CONTENT
// ============================================================

function updateEducationContent(scenarioName) {
  const content = educationContent[scenarioName];

  if (!content) {
    console.warn("No educational content found for:", scenarioName);
    return;
  }

  // Update scenario title and explanations
  educationTitle.textContent = content.title;
  educationBackground.textContent = content.background;
  educationMechanism.textContent = content.mechanism;
  educationPrediction.textContent = content.prediction;
  educationCaveat.textContent = content.caveat;

  // Clear references from the previous scenario
  educationSources.replaceChildren();

  // Add scientific references
  content.sources.forEach((source) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");

    link.href = source.url;
    link.textContent = source.label;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    listItem.appendChild(link);
    educationSources.appendChild(listItem);
  });

  // Handle scenarios without specific references
  if (content.sources.length === 0) {
    const listItem = document.createElement("li");

    listItem.textContent =
      "This is a hypothetical experiment using the simulation model.";

    educationSources.appendChild(listItem);
  }
}

// ============================================================
// 3. SCENARIO SELECTION
// ============================================================

// Listen for scenario changes
document.querySelectorAll(".scenario-card").forEach((card) => {
  card.addEventListener("click", () => {
    const scenarioName = card.dataset.scenario;

    updateEducationContent(scenarioName);
  });
});

// ============================================================
// 4. INITIALIZATION
// ============================================================

// Display the starting scenario
updateEducationContent("sickleCell");
