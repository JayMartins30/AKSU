

// Initialize map centered on main campus
const map = L.map('map').setView([4.970411, 7.756878], 16);

// Add map tiles (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentCampus = 'main';
let markers = [];
let places = [];


// Toast Notification

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `show ${type === 'error' ? 'error' : ''}`;

  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3000);
}



// Load location data

function loadLocations() {
  const file = currentCampus === 'main' ? 'data/locations.json' : 'data/locations_obioakpa.json';
  fetch(file)
    .then(res => res.json())
    .then(data => {
      places = data;
      renderMarkers();
      renderList();
    })
    .catch(err => console.error('Error loading locations:', err));
}


// Render markers on map

function renderMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  places.forEach(place => {
    const marker = L.marker([place.lat, place.lng]).addTo(map);
    marker.bindPopup(`
      <b>${place.name}</b><br>
      <i>${place.category}</i><br>
      <button onclick="openInGoogleMaps(${place.lat}, ${place.lng})">Open in Google Maps</button>
    `);
    markers.push(marker);
  });
}


// Render list in sidebar

function renderList(listData = places) {
  const list = document.getElementById('placeList');
  list.innerHTML = '';

  if (listData.length === 0) {
    list.innerHTML = '<li>No results found.</li>';
    return;
  }

  listData.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    li.onclick = () => {
      map.setView([p.lat, p.lng], 18);
      openInGoogleMaps(p.lat, p.lng);
    };
    list.appendChild(li);
  });
}


// Open in Google Maps

function openInGoogleMaps(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}`;
  window.open(url, '_blank');
}


// Campus Selector

document.getElementById('campusSelect').onchange = (e) => {
  currentCampus = e.target.value === 'main' ? 'main' : 'obioakpa';
  showToast(`Switched to ${currentCampus === 'main' ? 'Main Campus (Ikot Akpaden)' : 'Obio Akpa Campus'}`);
  loadLocations();
};


// Category Filter
document.getElementById('categoryFilter').onchange = () => {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all'
    ? places
    : places.filter(p => p.category === category);
  renderList(filtered);
};


// Search Functionality

document.getElementById('searchBox').addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const results = places.filter(p => p.name.toLowerCase().includes(term));
  renderList(results);
});


// Locate Me

document.getElementById('locateBtn').onclick = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;

      
      if (window.userMarker) map.removeLayer(window.userMarker);

      
      window.userMarker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup('📍 You are here!')
        .openPopup();

      
      map.flyTo([latitude, longitude], 18);

    }, err => {
      showToast('Unable to get your location.', 'error');
      console.error(err);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  } else {
    showToast('Geolocation not supported by your browser.', 'error');
  }
};

document.getElementById('year').textContent = new Date().getFullYear();


loadLocations();
