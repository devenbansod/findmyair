$(document).ready(setupPieChart);

function setupPieChart() {
	var abbrDimensions = ['S', 'T', 'C'];
    var fullDimensions = ['S', 'T', 'C'];
	var randomProportions = [0.34,0.33,0.33];
    var proportions = abbrDimensions.map(function(d,i) { return {
        label: d,
        proportion: randomProportions[i],
        collapsed: false,
        format: {
            label: d.charAt(0).toUpperCase() + d.slice(1) // capitalise first letter
        }
    }});


    var setup = {
        canvas: document.getElementById('piechart'),
        radius: 0.7,
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
        context.translate(centerX+4, centerY+5);

        var fontSize = Math.floor(context.canvas.height / 15);
        var dx = Math.cos(startingAngle) * (radius - fontSize + 25);
        var dy = Math.sin(startingAngle) * (radius - fontSize + 25);

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
        var buttonsRow = '<tr>';
        for(var i = 0; i < proportions.length; i += 1) {
            labelsRow += '<th style="text-align: center">' + fullDimensions[i] + "" + '</th>';

            var v = '<var>' + percentages[i].toFixed(0) + '%</var><br />';
            var plus = '<div id="plu-' + abbrDimensions[i] + '" class="adjust-button" data-i="' + i + '" data-d="-1">&#43;</div>';
            var minus = '<div id="min-' + abbrDimensions[i] + '" class="adjust-button" data-i="' + i + '" data-d="1">&#8722;</div>';
            propsRow += '<td style="text-align: center">' + v + '</td>';
            buttonsRow += '<td style="text-align: center">' + plus + minus + '</td>';
        }
        labelsRow += '</tr>';
        propsRow += '</tr>';
        buttonsRow += '</tr>';

        table.innerHTML = labelsRow + propsRow + buttonsRow;

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
