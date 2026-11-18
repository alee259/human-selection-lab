// Initialize the world map
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

// Load locally stored country boundaries
fetch("data/world.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load world.geojson");
    }

    return response.json();
  })
  .then((worldData) => {
    // Draw country boundaries
    const countries = L.geoJSON(worldData, {
      // Exclude Antarctica
      filter: (feature) => {
        return feature.properties.ADMIN !== "Antarctica";
      },

      // Country styling
      style: {
        color: "#344454",
        weight: 1,
        fillColor: "#1e2b39",
        fillOpacity: 1,
      },

      // Country hover tooltips
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties.ADMIN;

        layer.bindTooltip(countryName, {
          sticky: true,
          direction: "top",
        });

        // Highlight country on hover
        layer.on("mouseover", () => {
          layer.setStyle({
            fillColor: "#2b433b",
            color: "#a8ffb2",
            weight: 1.5,
          });
        });

        // Restore original styling
        layer.on("mouseout", () => {
          countries.resetStyle(layer);
        });
      },
    }).addTo(worldMap);

    // Fit the main continents into the available rectangle
    worldMap.fitBounds(worldBounds, {
      padding: [10, 10],
      animate: false,
    });

    console.log("World map loaded:", countries.getLayers().length, "countries");
  })
  .catch((error) => {
    console.error("Map loading error:", error);
  });

window.addEventListener("resize", () => {
  worldMap.invalidateSize();
});
