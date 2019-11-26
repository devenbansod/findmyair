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

	$(marker._icon).addClass('poi_icon')
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
	var iternaries = []

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
 		iternaries.push(pois[i]);
	}

    data = {    	
    	"preferences": {
    		"cost": parseInt(airbnbcost.substring(0, airbnbcost.length - 1)),
	        "travel": parseInt(travel.substring(0, travel.length - 1)),
	        "safety": parseInt(safety.substring(0, safety.length - 1))
    	},

    	"iternaries": iternaries
    }

    console.log("Query", data) //testing
     $.ajax({ 
        // dataType: 'jsonp',
        data: JSON.stringify(data), 
        type: "POST", 
        url: "/map", //needs to be replaced\
        headers:{
    		'Content-Type': 'application/json'
  		},
        success: function(msg, status, jqXHR) { 
           createFullItinerary(iternaries)
           plotSuggestions(JSON.parse(msg));
       }
    });

    return false; 
});


var bnb_markers = [];
function plotSuggestions(obj){
	suggestions = obj["suggestions"];
	console.log(suggestions);
	var rank = 1;
	suggestions.forEach(function(suggestion){
		var marker = L.marker([suggestion["latitude"], suggestion["longitude"]]).addTo(map);
		$(marker._icon).addClass('bnb_icon')
		$(marker._icon).attr("id", "bnb_icon_"+rank)
		$("#itineary").hide()
		$("#suggested_airbnbs").append("<p class='suggestion_item' id='bnb_list_"+rank+"'>\
			Rank: "+rank+"\
			ID:"+suggestion.id+"\
			Total Score: "+suggestion.suitability_score+"\
			<a href='#' onclick=clickOnSuggestion("+rank+")>Select</a>\
			</p>")
		
		
		marker.bindPopup("<div class='bnb_popup' id='bnb_holder_"+rank+"'>\
					Rank: "+rank+"\
					<a href='"+ suggestion.url +"' target='_blank'>Link to book</a>\
					<p>Total Score: "+suggestion.suitability_score+"</p>\
					<p>Cost Score: "+suggestion.cost_score+"</p>\
					<p>Safety Score: "+suggestion.safety_score+"</p>\
					<p>Travel Score: "+suggestion.travel_score+"</p>\
					</div>").openPopup();

		marker.on('mouseover', function(e){
			this.openPopup();
		});
		marker.on('mouseout', function(e){
			this.closePopup();
		});
		marker.on('click', function(e){
			$(".selectedPath").remove();
			if($(marker._icon).hasClass('selectedBnb')){
				$(marker._icon).removeClass('selectedBnb');
				selectBnB($(marker._icon).attr("id").split("_")[2], true)
			} else {
				$(marker._icon).addClass('selectedBnb');
				handlePaths(Number($(marker._icon).attr("id").split("_")[2])-1, Number($('#day-selector input:radio:checked').val())-1)
				selectBnB($(marker._icon).attr("id").split("_")[2], false)
				
				// alert("show paths now");
			}
		});

		bnb_markers.push(marker)

		rank += 1;
	})
}

function clickOnSuggestion(rank) {
	selectedMarker = bnb_markers[rank - 1];
	selectedMarker.fire('click');
}

function selectBnB(rank, already){
	if(already){
		$("#bnb_list_"+rank).removeClass('selectedBnbPara');
	}
	else {
		$("#bnb_list_"+rank).addClass('selectedBnbPara');
		//$("#bnb_list_"+rank).get(0).scrollIntoView();
	}
	
}
fullItinerary = []
function createFullItinerary(iternaries){
	for(i=0;i<iternaries.length;i++){
		var day = iternaries[i];
		dayWiseItinerary = []
		for(j=0;j<day.length;j++){
			dayWiseItinerary.push([pointsOfInterest[iternaries[i][j]]["latitude"], pointsOfInterest[iternaries[i][j]]["longitude"]])
		}
		fullItinerary.push(dayWiseItinerary)
	}
	console.log(fullItinerary)
}

function handlePaths(selectedAirBnb,selectedDay){	
	
	dayWisePath = [[suggestions[selectedAirBnb]["latitude"], suggestions[selectedAirBnb]["longitude"]]]

	for(i = 0;i<fullItinerary[selectedDay].length;i++){
		dayWisePath.push([fullItinerary[selectedDay][i][0], fullItinerary[selectedDay][i][1]])
	}
	dayWisePath.push([suggestions[selectedAirBnb]["latitude"], suggestions[selectedAirBnb]["longitude"]])
	var polyline = L.motion.polyline(dayWisePath, {
						className: 'selectedPath',
						color: "#000000"
					}, {
						auto: true,
						easing: L.Motion.Ease.swing,
						weight:2
					},{
						removeOnEnd: true,
						
						icon: L.divIcon({
							className: 'pathMarker',
							iconSize: L.point(20, 20)})
					}).motionSpeed(10000).addTo(map);
}


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