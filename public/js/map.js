const locations = JSON.parse(document.getElementById('map').getAttribute('data-locations'));
const pois = JSON.parse(document.getElementById('map').getAttribute('data-pois'));

const lat = locations.lat, long = locations.long;

// initialize the map
const map = L.map('map').setView([lat, long], 12);


// load a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
  // attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
  maxZoom: 18,
  minZoom: 10
}).addTo(map);


pointsOfInterest = pois.map((poi, id) => {
    poi.id = id;
    poi.latLong = [Number(poi.latitude), Number(poi.longitude)];

    return poi;
});


pointsOfInterest.forEach(function(point){
	var marker = L.marker(point.latLong).addTo(map);
	marker.bindPopup("<div class='poi_popup itemNotInItineary' id='point_holder_"+point.id+"'>\
					<p>"+ point.name +"</p>\
					<img src=" + point.image_url + ">\
					</div>").openPopup();

	marker.on('mouseover', function(e){
		this.openPopup();
	});
	marker.on('mouseout', function(e){
		this.closePopup();
	});


	marker.on('click', function(e){
		var selectedDay = $('#day-selector input:radio:checked').val()
	
		if (selectedDay > 0){
			var itineary = $("#itineary-day-"+selectedDay+" ul");
			if($(marker._icon).hasClass('selectedMarker')){
				$("#point_li_"+point.id).remove();
				$(marker._icon).removeClass('selectedMarker');
			} else {
				itineary.append("<li id='point_li_"+point.id+"'>"+point.name+"</li>");
				$(marker._icon).addClass('selectedMarker');
			}
		} else {
			alert("Select number of days first");
		}
		
	});
})


$('.dropdown-item').click(function() {
	var numberOfDays = parseInt($(this).text());
	$('#day-selector').html("");
	$('#itineary').html("Your Itineary:<br><br>");
	$('.selectedMarker').removeClass('selectedMarker')
  	for (i = 1; i <= numberOfDays; i++) {
    	$('<label class="btn btn-secondary '+ (i==1 ? "active": "")+'">\
   		<input type="radio" name="options" id="radio-day-'+i+'" value="'+i+'"autocomplete="off" '+(i==1 ? "checked": "")+'> Day '+i+'\
  		</label>').appendTo('#day-selector');

  		$('<div id="itineary-day-'+i+'" class="itineary-day">Day '+i+'<ul></ul></div>').appendTo('#itineary');
	}
});



$('#submit_pref').click(function() {
	var pois = {}

	var number_of_days = $(".itineary-day").length;
	var safety = $("#proportions-table tr var")[0].innerHTML
	var travel = $("#proportions-table tr var")[1].innerHTML
	var airbnbcost = $("#proportions-table tr var")[2].innerHTML

	var itineary_day = $(".itineary-day");

	for (var i = 1; i <= number_of_days; i++) {
		pois[i] = []
 		list_elements = $("#itineary-day-"+i + " li");
 		list_elements.each(function(iter, item){
 			pois[i].push(parseInt($(item).attr("id").split("_")[2]));
 		})
	}

    data = {
    	"number_of_days":  number_of_days,
    	"safety_cost": parseInt(safety.substring(0, safety.length - 1)),
    	"travel_cost": parseInt(travel.substring(0, travel.length - 1)), 
    	"airbnb_cost": parseInt(airbnbcost.substring(0, airbnbcost.length - 1)),
    	"pois": pois
    }

    console.log(data) //testing
    $.ajax({ 
        data: data, 
        type: "POST", 
        url: "", //needs to be replaced
        success: function(response) { 
           console.log("Got response");
        }
    });
    return false; 
});

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