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
	{
		id: 4,
		name: "Point D",
		latLong:[41.72, -74.9]
	},
	{
		id: 5,
		name: "Point E",
		latLong:[41.92, -74.5]
	},
	{
		id: 6,
		name: "Point F",
		latLong:[40.9, -74.9]
	}, 
	{
		id: 7,
		name: "Point G",
		latLong:[39.9, -74.9]
	}, 
	{
		id: 8,
		name: "Point H",
		latLong:[39.9, -73.9]
	}, 
];

$(document).ready(setupPieChart);
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
			alert("select days first");
		}
		
	});
})


$('.dropdown-item').click(function() {
	var numberOfDays = parseInt($(this).text());
	$('#day-selector').html("");
	$('#itineary').html("");
  	for (i = 1; i <= numberOfDays; i++) {
    	$('<label class="btn btn-secondary '+ (i==1 ? "active": "")+'">\
   		<input type="radio" name="options" id="radio-day-'+i+'" value="'+i+'"autocomplete="off" '+(i==1 ? "checked": "")+'> Day '+i+'\
  		</label>').appendTo('#day-selector');

  		$('<div id="itineary-day-'+i+'">Day '+i+'<ul></ul></div>').appendTo('#itineary');
	}
});

function setupPieChart() {
		var dimensions = ['Safety', 'Travel Cost', 'Airbnb Cost'];
		var randomProportions = [0.34,0.33,0.33];
        var proportions = dimensions.map(function(d,i) { return {
            label: d,
            proportion: randomProportions[i],
            collapsed: false,
            format: {
                label: d.charAt(0).toUpperCase() + d.slice(1) // capitalise first letter
            }
        }});


        var setup = {
            canvas: document.getElementById('piechart'),
            radius: 0.9,
            collapsing: true,
            proportions: proportions,
            drawSegment: drawSegmentOutlineOnly,
            onchange: onPieChartChange
        };

        var newPie = new DraggablePiechart(setup);

        function drawSegmentOutlineOnly(context, piechart, centerX, centerY, radius, startingAngle, arcSize, format, collapsed) {

            if (collapsed) { return; }

            // Draw segment
            context.save();
            var endingAngle = startingAngle + arcSize;
            context.beginPath();
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
            context.closePath();

            context.fillStyle = '#f5f5f5';
            context.fill();
            context.stroke();
            context.restore();

            // Draw label on top
            context.save();
            context.translate(centerX, centerY);
            context.rotate(startingAngle);

            var fontSize = Math.floor(context.canvas.height / 25);
            var dx = radius - fontSize;
            var dy = centerY / 10;

            context.textAlign = "right";
            context.font = fontSize + "pt Helvetica";
            context.fillText(format.label, dx, dy);
            context.restore();
        }

        function onPieChartChange(piechart) {

            var table = document.getElementById('proportions-table');
            var percentages = piechart.getAllSliceSizePercentages();

            var labelsRow = '<tr>';
            var propsRow = '<tr>';
            for(var i = 0; i < proportions.length; i += 1) {
                labelsRow += '<th>' + proportions[i].format.label + '</th>';

                var v = '<var>' + percentages[i].toFixed(0) + '%</var>';
                var plus = '<div id="plu-' + dimensions[i] + '" class="adjust-button" data-i="' + i + '" data-d="-1">&#43;</div>';
                var minus = '<div id="min-' + dimensions[i] + '" class="adjust-button" data-i="' + i + '" data-d="1">&#8722;</div>';
                propsRow += '<td>' + v + plus + minus + '</td>';
            }
            labelsRow += '</tr>';
            propsRow += '</tr>';

            table.innerHTML = labelsRow + propsRow;

            var adjust = document.getElementsByClassName("adjust-button");

            function adjustClick(e) {
                var i = this.getAttribute('data-i');
                var d = this.getAttribute('data-d');

                piechart.moveAngle(i, (d * 0.1));
            }

            for (i = 0; i < adjust.length; i++) {
                adjust[i].addEventListener('click', adjustClick);
            }

        }
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