// initialize the map
var map = L.map('map').setView([40.730610, -73.935242], 12);

// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  // attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
  maxZoom: 17,
  minZoom: 9
}).addTo(map);

var marker = L.marker([40.75362, -73.98377]).addTo(map);
marker.bindPopup("<b>Hello world!</b><br>Airbnb").openPopup();