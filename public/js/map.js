const locations = JSON.parse(document.getElementById('map').getAttribute('data-locations'));
const pois = JSON.parse(document.getElementById('map').getAttribute('data-pois'));

const lat = locations.lat, long = locations.long;

// initialize the map
const map = L.map('map', {closePopupOnClick: false}).setView([lat, long], 12);

// load a tile layer
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
{
  // attribution: 'Tiles by <a href="http://mapc.org">MAPC</a>, Data by <a href="http://mass.gov/mgis">MassGIS</a>',
  maxZoom: 18,
  minZoom: 10
}).addTo(map);

$(document).ready(function () {
  $("#loading").hide();
});

pointsOfInterest = pois.map((poi, id) => {
    poi.id = id;
    poi.latLong = [Number(poi.latitude), Number(poi.longitude)];

    return poi;
});

pointsOfInterest.forEach(function(point){
	var marker = L.marker(point.latLong, {
      icon: L.icon({
        iconUrl: "img/marker-icon.png",
        iconSize: [20, 30],
      }),
      title: point.name,
      riseOnHover: true
    }).addTo(map);
	marker.bindPopup("<div class='poi_popup itemNotInitinerary' id='point_holder_"+point.id+"'>\
					<p><b>"+ trimString(point.name, 20) +"</b></p>\
					<img src=" + point.image_url + " width='100px' height='80px'>\
					</div>");

	$(marker._icon).addClass('poi_icon')
	marker.on('mouseover', function(e){
		this.openPopup();
	});
	marker.on('mouseout', function(e){
		this.closePopup();
	});


	marker.on('click', function(e) {
		var selectedDay = $('#day-selector input:radio:checked').val()
	
		if (selectedDay > 0) {
			var itinerary = $("#itinerary-day-"+selectedDay+" ul");
			if($(marker._icon).hasClass('selectedMarker')){
				$("#point_li_"+point.id).remove();
				$(marker._icon).removeClass('selectedMarker');
			} else {
				itinerary.append("<li id='point_li_"+point.id+"'>"+point.name+"</li>");
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
	$('#itinerary').html("Your itinerary:<br><br>");
	$('.selectedMarker').removeClass('selectedMarker')
  	for (i = 1; i <= numberOfDays; i++) {
    	$('<label class="btn btn-secondary '+ (i==1 ? "active": "")+'">\
   		<input type="radio" name="options" id="radio-day-'+i+'" value="'+i+'"autocomplete="off" '+(i==1 ? "checked": "")+'> Day '+i+'\
  		</label>').appendTo('#day-selector');

  		$('<div id="itinerary-day-'+i+'" class="itinerary-day">Day '+i+'<ul></ul></div>').appendTo('#itinerary');
	}
});



$('#submit_pref').click(function() {
	var pois = {}
	var iternaries = []

	var number_of_days = $(".itinerary-day").length;
	var safety = $("#proportions-table tr var")[0].innerHTML
	var travel = $("#proportions-table tr var")[1].innerHTML
	var airbnbcost = $("#proportions-table tr var")[2].innerHTML

	var itinerary_day = $(".itinerary-day");

	for (var i = 1; i <= number_of_days; i++) {
		pois[i] = []
 		list_elements = $("#itinerary-day-"+i + " li");
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

			$('.search-tab-link a').click();

       }
    });

    return false; 
});



function roundToTwoDecimal(num){
	if (num > 0)
		return Math.round(num * 100) / 100
	else
		return 0
}

function trimString(string, length){
	if(string){
		if (string.length > length)
			return string.substring(0, length) + "...";
		else
			return string
	} else  {
		return "PlaceHolder";
	}

}

var bnb_markers = [];
function plotSuggestions(obj){
	suggestions = obj["suggestions"];
	var rank = 1;

    // remove any previous markers, selected Bnbs or paths
    bnb_markers.forEach((marker) => {
        map.removeLayer(marker);
    });
    $(".selectedPath").remove();
    $(".selectedBnb").removeClass('selectedBnb');

	suggestions.forEach(function(suggestion){

		var marker = L.marker([suggestion["latitude"], suggestion["longitude"]], {
	      icon: L.icon({
	        iconUrl: "css/leaflet/images/bnb-blue.png",
	        iconSize: [24, 28],
	      }),
	      title: suggestion['url'],
	      riseOnHover: true
	    }).addTo(map);
		$(marker._icon).addClass('bnb_icon')
		$(marker._icon).attr("id", "bnb_icon_"+rank)


		console.log(suggestion)

		marker.bindPopup("<div class='bnb_popup' id='bnb_holder_"+rank+"'>\
					<a href='"+ suggestion.url +"' target='_blank'>"+trimString(suggestion.name, 20)+"</a><br>\
					<p style='margin: 5px 0'><b>Rank:</b> "+rank+"\
					| <b>Score:</b> "+roundToTwoDecimal(suggestion.suitability_score)+"</p>\
					<table class='table'><thead><tr style='border-top: 1px solid lightgray;'><th>S</th><th>T</th><th>C</th></tr></thead><tbody>\
					<tr><td>"+roundToTwoDecimal(suggestion.safety_score)+"</td>\
					<td>"+roundToTwoDecimal(suggestion.travel_score)+"</td>\
					<td>"+roundToTwoDecimal(suggestion.cost_score)+"</td></tr></tbody></table>\
					</div>");

		marker.on('click', function(e){
			$('.leaflet-popup-close-button').on('click', function(e) {
				$(marker._icon).removeClass('selectedBnb');
				$(".selectedPath").remove();
			});
			$(".selectedPath").remove();

			if($(marker._icon).hasClass('selectedBnb')) {
				$(marker._icon).removeClass('selectedBnb');
				selectBnB($(marker._icon).attr("id").split("_")[2], true)
			} else {
				$('.selectedBnb').removeClass('selectedBnb');
				$(marker._icon).addClass('selectedBnb');
				handlePaths(Number($(marker._icon).attr("id").split("_")[2])-1, Number($('#day-selector input:radio:checked').val())-1);

				selectBnB($(marker._icon).attr("id").split("_")[2], false)
			}
		});
		bnb_markers.push(marker)

		rank += 1;
	})

	bnb_markers[bnb_markers.length - 1].fire('click')

	showSuggestionsResult(suggestions);
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
var fullItinerary = []
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

function handleInputClick(e) {
  e.preventDefault();
  var target = e.target;
  var parent = $(target).parent();
  if (parent.hasClass('active')) {
    return;
  }

  $('.active').removeClass('active');
  parent.addClass('active');
  var otherTab = $('.input-tab');
  otherTab.show();

  var thisTab = $('.search-tab');
  thisTab.hide();

  $('.input-tab-link').addClass('active');
}

function handleResultsClick(e) {
  e.preventDefault();
  var target = e.target;
  var parent = $(target).parent();
  if (parent.hasClass('active')) {
    return;
  }

  $('.active').removeClass('active');
  parent.addClass('active');
  var otherTab = $('.search-tab');
  otherTab.show();

  var thisTab = $('.input-tab');
  thisTab.hide();

  $('.search-tab-link').addClass('active');
}

function showSuggestionsResult(suggestions) {
	var table = $('#suggestion_table');
    table.html('');

	var rank = 1;
	suggestions.forEach((suggestion) => {
		table.append("<tr class='suggestion_item' id='bnb_list_"+rank+"'>\
			<td>"+rank+"</td>\
			<td><a href='#' onclick=clickOnSuggestion("+rank+")>"+suggestion.id+"</a></td>\
		 	<td>"+suggestion.suitability_score.toFixed(3) +"</td>\
			</tr>");

		rank += 1;
	});
}

$('.input-tab').show();
$('.search-tab').hide();
