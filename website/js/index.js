/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */

['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
  document.getElementById('container').addEventListener(
    eventType,
    function (e) {
      var chart,
        point,
        i,
        event;

      for (i = 0; i < Highcharts.charts.length; i = i + 1) {
        chart = Highcharts.charts[i];
        // Find coordinates within the chart
        event = chart.pointer.normalize(e);
        // Get the hovered point
        point = chart.series[0].searchPoint(event, true);

        if (point) {
          point.highlight(e);
        }
      }
    }
  );
});

/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function () {
  return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
Highcharts.Point.prototype.highlight = function (event) {
  event = this.series.chart.pointer.normalize(event);
  this.onMouseOver(); // Show the hover marker
  this.series.chart.tooltip.refresh(this); // Show the tooltip
  this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
};

/**
 * Synchronize zooming through the setExtremes event handler.
 */
function syncExtremes(e) {
  var thisChart = this.chart;

  if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
    Highcharts.each(Highcharts.charts, function (chart) {
      if (chart !== thisChart) {
        if (chart.xAxis[0].setExtremes) { // It is null while updating
          chart.xAxis[0].setExtremes(
            e.min,
            e.max,
            undefined,
            false,
            { trigger: 'syncExtremes' }
          );
        }
      }
    });
  }
}

// Get the data. The contents of the data file can be viewed at
Highcharts.ajax({
  url: 'https://sd-restful.herokuapp.com/api/data_col',
  dataType: 'text',
  success: function (activity) {

    activity = JSON.parse(activity)
    activity = buildJson(activity.response)
    console.log(activity)
    activity.datasets.forEach(function (dataset, i) {

      // Add X values
      dataset.data = Highcharts.map(dataset.data, function (val, j) {
        return [activity.xData[j], val];
      });

      var chartDiv = document.createElement('div');
      chartDiv.className = 'chart';
      document.getElementById('container').appendChild(chartDiv);

      Highcharts.chart(chartDiv, {
        chart: {
          marginLeft: 40, // Keep all charts left aligned
          spacingTop: 20,
          spacingBottom: 20
        },
        title: {
          text: dataset.name,
          align: 'left',
          margin: 0,
          x: 30
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        xAxis: {
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          labels: {
            format: '{value} km'
          }
        },
        yAxis: {
          title: {
            text: null
          }
        },
        tooltip: {
          positioner: function () {
            return {
              // right aligned
              x: this.chart.chartWidth - this.label.width,
              y: 10 // align to title
            };
          },
          borderWidth: 0,
          backgroundColor: 'none',
          pointFormat: '{point.y}',
          headerFormat: '',
          shadow: false,
          style: {
            fontSize: '18px'
          },
          valueDecimals: dataset.valueDecimals
        },
        series: [{
          data: dataset.data,
          name: dataset.name,
          type: dataset.type,
          color: Highcharts.getOptions().colors[i],
          fillOpacity: 0.3,
          tooltip: {
            valueSuffix: ' ' + dataset.unit
          }
        }]
      });
    });
    
    setTimeout(function(){// wait for 5 secs(2)
          location.reload(); // then reload the page.(3)
    }, 5000);    
  }
});

function buildJson(response){
  var newJson = new Object();
  newJson.xData = []
  console.log(newJson)

  newJson.datasets = []
  newJson.datasets[0] = []
  newJson.datasets[0].name = 'Moisture'
  newJson.datasets[0].data = []
  newJson.datasets[0].unit = '%'
  newJson.datasets[0].type = 'line'
  newJson.datasets[0].valueDecimals = 1

  newJson.datasets[1] = []
  newJson.datasets[1].name = 'Temperature'
  newJson.datasets[1].data = []
  newJson.datasets[1].unit = '°C'
  newJson.datasets[1].type = 'area'
  newJson.datasets[1].valueDecimals = 0

  newJson.datasets[2] = []
  newJson.datasets[2].name = 'Luminosity'
  newJson.datasets[2].data = []
  newJson.datasets[2].unit = '%'
  newJson.datasets[2].type = 'area'
  newJson.datasets[2].valueDecimals = 0

  response.forEach((el, i) => {
    newJson.xData[i] = Date(el.timestamp);

    newJson.datasets[0].data[i] = Number(el.moisture);
    newJson.datasets[1].data[i] = Number(el.temperature);
    newJson.datasets[2].data[i] = Number(el.luminosity);
  });

  return newJson;
}

function printData(){
  console.log(getChartData())
}