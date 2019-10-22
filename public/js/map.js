const locations = JSON.parse(document.getElementById('map').getAttribute('data-locations'));

const lat = locations.lat, long = locations.long;

// initialize the map
const map = L.map('map').setView([lat, long], 8);


// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  // attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
  maxZoom: 17,
  minZoom: 1
}).addTo(map);


pointsOfInterest = [
	{
		id: 1,
		name: "Point A",
		latLong:[40.72, -73.9]
	}, 
	{
		id: 2,
		name: "Point B",
		latLong:[41.72, -73.9]
	}, 
	{
		id: 3,
		name: "Point C",
		latLong:[40.72, -74.9]
	}, 
];


pointsOfInterest.forEach(function(point){
	var marker = L.marker(point.latLong).addTo(map);
	marker.bindPopup("<div class='poi_popup itemNotInItineary' id='point_holder_"+point.id+"'>\
					<p>Name: " + point.name +"</p>\
					<img src='img/points_of_interest/" + point.id + ".jpg'>\
					</div>").openPopup();

	marker.on('mouseover', function(e){
		this.openPopup();
	});
	marker.on('mouseout', function(e){
		this.closePopup();
	});

	var itineary = $("#itineary ul");
	marker.on('click', function(e){
		if($(marker._icon).hasClass('selectedMarker')){
			$("#point_li_"+point.id).remove();
			$(marker._icon).removeClass('selectedMarker');
		} else {
			itineary.append("<li id='point_li_"+point.id+"'>"+point.name+"</li>");
			$(marker._icon).addClass('selectedMarker');
		}
	});
})

// If you want to use D3 instead of native leaflet
// var cities = [];
// var d3OverLay = L.d3SvgOverlay(function(sel,proj){
//  var pointsOfInterestUpd = sel.selectAll('circle').data(pointsOfInterest);
//  pointsOfInterestUpd.enter()
//      .append('circle')
//      .attr('r',function(d){return 100;})
//      .attr('cx',function(d){return proj.latLngToLayerPoint(d).x;})
//      .attr('cy',function(d){return proj.latLngToLayerPoint(d).y;})
//      .attr('stroke','black')
//      .attr('stroke-width',1)
//      .attr('fill', "red");
// });

// d3OverLay.addTo(map);