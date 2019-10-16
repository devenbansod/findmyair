const locations = JSON.parse(document.getElementById('map').getAttribute('data-locations'));

const lat = locations.lat, long = locations.long;

// initialize the map
const map = L.map('map').setView([lat, long], 12);
const marker = L.marker([lat, long]).addTo(map);

// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  // attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
  maxZoom: 17,
  minZoom: 9
}).addTo(map);

marker.bindPopup("<b>Hello world!</b><br>Airbnb").openPopup();