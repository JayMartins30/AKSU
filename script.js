// Initialize map centered on your campus
const map = L.map('map').setView([4.970411, 7.756878], 16);

// Add map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Main campus marker
L.marker([4.970411, 7.756878])
  .addTo(map)
  .bindPopup("<b>Akwa Ibom State University</b><br>Main Campus, Ikot Akpaden, Mkpat Enin LGA.")
  .openPopup();

// Define colors for each category
const iconColors = {
  academic: 'blue',
  administration: 'red',
  hostel: 'green',
  facility: 'orange',
  lecture: 'purple'
};

// Function to create colored marker icons
function createIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Load location data
fetch('data/location.json')
  .then(res => res.json())
  .then(locations => {
    const placeList = document.getElementById("placeList");
    const searchBox = document.getElementById("searchBox");
    const categoryFilter = document.getElementById("categoryFilter");

    // Keep reference to markers
    const markers = [];

    // Function to add markers to map
    function displayMarkers(data) {
      // Clear existing markers
      markers.forEach(m => map.removeLayer(m));
      markers.length = 0;

      // Clear sidebar list
      placeList.innerHTML = "";

      data.forEach(place => {
        // Skip invalid coordinates
        if (!place.coords || place.coords.length !== 2) return;

        const color = iconColors[place.category] || 'blue';
        const icon = createIcon(color);

        const popupContent = `
          <div style="text-align:center;">
            <h4>${place.name}</h4>
            ${place.image ? `<img src="${place.image}" width="150" style="border-radius:8px; margin-bottom:8px;">` : ""}
            <p>${place.desc}</p>
            <small><b>Category:</b> ${place.category}</small>
          </div>
        `;

        const marker = L.marker(place.coords, { icon })
          .addTo(map)
          .bindPopup(popupContent);

        markers.push(marker);

        // Add to sidebar list
        const li = document.createElement("li");
        li.textContent = place.name;
        li.addEventListener("click", () => {
          map.setView(place.coords, 18);
          marker.openPopup();
        });
        placeList.appendChild(li);
      });
    }

    // Initial load
    displayMarkers(locations);

    // Filter by category
    categoryFilter.addEventListener("change", () => {
      const selected = categoryFilter.value;
      const filtered =
        selected === "all"
          ? locations
          : locations.filter(p => p.category === selected);
      displayMarkers(filtered);
    });

    // Search functionality
    searchBox.addEventListener("input", e => {
      const query = e.target.value.toLowerCase().trim();

      if (query === "") {
        displayMarkers(locations);
        return;
      }

      const filtered = locations.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query)
      );

      displayMarkers(filtered);

      // Zoom to first result
      if (filtered.length > 0) {
        const first = filtered[0];
        map.setView(first.coords, 18);
      }
    });
  })
  .catch(err => console.error("Error loading locations:", err));

// Locate Me button functionality
const locateBtn = document.getElementById("locateBtn");

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  locateBtn.textContent = "Locating...";
  locateBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const userCoords = [latitude, longitude];

      // Add or move user marker
      if (window.userMarker) {
        map.removeLayer(window.userMarker);
      }

      window.userMarker = L.marker(userCoords, {
        title: "You are here"
      }).addTo(map).bindPopup("<b>You are here 📍</b>").openPopup();

      map.setView(userCoords, 17);
      locateBtn.textContent = "📍 Locate Me";
      locateBtn.disabled = false;
    },
    error => {
      alert("Unable to retrieve your location.");
      console.error(error);
      locateBtn.textContent = "📍 Locate Me";
      locateBtn.disabled = false;
    }
  );
});


// 🧭 Collapsible Map Legend
const legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  const div = L.DomUtil.create("div", "map-legend collapsed");
  div.innerHTML = `
    <div class="legend-header">
      <h4>Campus Legend</h4>
     
    </div>
     <button id="toggleLegend">☰</button>
    <div class="legend-content">
      <p><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"> Academic</p>
      <p><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"> Administration</p>
      <p><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"> Hostel</p>
      <p><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"> Facility</p>
      <p><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png"> Lecture Hall</p>
    </div>
  `;

  // Toggle collapse/expand
  setTimeout(() => {
    const toggleBtn = document.getElementById("#toggleLegend");
    toggleBtn.addEventListener("click", () => {
      div.classList.toggle("collapsed");
    });
  }, 100);

  return div;
};

legend.addTo(map);
