'use strict';

var dateChart = dc.lineChart("#date-chart");
var hourChart = dc.barChart("#hour-chart");
var dayChart = dc.rowChart("#day-chart");
var sourceChart = dc.rowChart("#source-chart");
var statusChart = dc.rowChart("#status-chart");
var neighborhoodChart = dc.rowChart("#neighborhood-chart");
var reasonChart = dc.rowChart("#reason-chart");

//var singleColor = ["#969CEB"];
var singleColor = ["#1a8bba"];


var smallIcon = L.divIcon({className: "small-div-marker"});
var mapMarkersLayer = L.layerGroup();
var mapClustersLayer = L.markerClusterGroup();
var map = L.map('map', {
  center: [42.351, -71.065],
  zoom: 12,
  maxZoom: 18,
  layers: [mapMarkersLayer, mapClustersLayer]
});

// L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
//     maxZoom: 18
// }).addTo(map);

L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
  attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    maxZoom:18
}).addTo(map);

var locations = null;
var onFiltered = function(chart, filter) {
  updateMap(locations.top(Infinity));
};

var updateMap = function(locs) {
  mapMarkersLayer.clearLayers();
  mapClustersLayer.clearLayers();
          
  locs.forEach( function(d) {
    if (d.geocoded_location.latitude!=null && d.geocoded_location.latitude!=undefined) {
      var marker = L.marker([d.geocoded_location.latitude, d.geocoded_location.longitude], {icon: smallIcon}).bindPopup(d.case_title);
      // mapMarkersLayer.addLayer(marker);
      mapClustersLayer.addLayer(marker);
    }
  });
};

var today = new Date();
var thirty_days_ago = new Date(today.getTime() - 30*24*60*60*1000);
var tda_date = thirty_days_ago.toISOString().substring(0,10);

// Note that we're currently limiting the amount of data retrieved from the Socrata API
// Their API's maximum limit is 50,000 records. There are about 500,000 in the dataset.
// May need to switch to a local CSV  to access the full dataset.

// Add $order query param to be able to see most recent data.
d3.json("https://data.cityofboston.gov/resource/awu8-dc52?$limit=50000&$where=open_dt>'"+tda_date+"'", function(err, data) {
  var dateFormat = d3.time.format("%Y-%m-%dT%H:%M:%S");
  data.forEach(function(d) {
    d.date_opened = dateFormat.parse(d.open_dt);
    d.date_target = d.target_dt ? dateFormat.parse(d.target_dt) : null;
    d.date_closed = d.closed_dt ? dateFormat.parse(d.closed_dt) : null;

    if (d.geocoded_location.latitude!=null && d.geocoded_location.latitude!=undefined) {
      var marker = L.marker([d.geocoded_location.latitude, d.geocoded_location.longitude], {icon: smallIcon}).bindPopup(d.case_title);
      // mapMarkersLayer.addLayer(marker);
      mapClustersLayer.addLayer(marker);
    }
  });

  var index = crossfilter(data);
  var all = index.groupAll();

  var sources = index.dimension( function(d) { return d.source; });
  var open_dates = index.dimension( function(d) { return d3.time.hour(d.date_opened); } );
  var open_hours = index.dimension( function(d) { return d.date_opened.getHours()+1; } );
  var open_days = index.dimension( function(d) { 
    var day = d.date_opened.getDay();
    var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return day + '.' + name[day];
  });
  var status = index.dimension( function(d) { return d.case_status; } );
  var neighborhoods = index.dimension( function(d) { return d.neighborhood; } );
  var reasons = index.dimension( function(d) { return d.reason } ); 
  locations = index.dimension( function(d) { return d.geocoded_location; });

  dc.dataCount('.data-count')
    .dimension(index)
    .group(all);
    // .html({
    //     some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
    //         ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
    //     all:'All records selected. Please click on the graph to apply filters.'
    // });

  dateChart
    .width($('#date-chart').innerWidth()-30)
    .height(150)
    .margins({top: 10, left:30, right: 10, bottom:20})
    .x(d3.time.scale().domain([thirty_days_ago, today]))
    .colors(singleColor)
    .dimension(open_dates)
    .group(open_dates.group())
    .elasticY(true)
    .yAxis().ticks(6);
  //dateChart.on("filtered", onFiltered);

  hourChart
    .width($('#hour-chart').innerWidth()-30)
    .height(227)
    .margins({top: 10, left:35, right: 10, bottom:20})
    .x(d3.scale.linear().domain([1,24]))
    .colors(singleColor)
    .dimension(open_hours)
    .group(open_hours.group())
    .gap(1)
    .elasticY(true);
  //hourChart.on("filtered", onFiltered);

  dayChart
    .width($('#day-chart').innerWidth()-30)
    .height(160)
    .margins({top: 10, left:5, right: 10, bottom:-1})
    .label( function(i) { return i.key.split('.')[1]; })
    .title( function(i) { return i.key.split('.')[1] + ': ' + i.value; })
    .colors(singleColor)
    .dimension(open_days)
    .group(open_days.group())
    .elasticX(true)
    .gap(1)
    .xAxis().ticks(0);
  //dayChart.on("filtered", onFiltered);

  statusChart
    .width($('#status-chart').innerWidth()-30)
    .height(55)
    .margins({top: 10, left:5, right: 10, bottom:-1})
    .colors(singleColor)
    .group(status.group())
    .gap(1)
    .dimension(status)
    .xAxis().ticks(0);
  //statusChart.on("filtered", onFiltered);

  sourceChart
    .width($('#source-chart').innerWidth()-30)
    .height(140)
    .margins({top: 10, left:5, right: 10, bottom:-1})
    .colors(singleColor)
    .group(sources.group())
    .dimension(sources)
    .elasticX(true)
    .gap(1)
    .ordering(function(i){return -i.value;})
    .xAxis().ticks(0);
  //sourceChart.on("filtered", onFiltered);

  neighborhoodChart
    .width($('#neighborhood-chart').innerWidth()-30)
    .height(435)
    .margins({top: 10, left:5, right: 10, bottom:20})
    .colors(singleColor)
    .group(neighborhoods.group())
    .dimension(neighborhoods)
    .elasticX(true)
    .gap(1)
    .ordering(function(i){return -i.value;});
  //neighborhoodChart.on("filtered", onFiltered);

  reasonChart
    .width($('#reason-chart').innerWidth()-30)
    .height(1000)
    .margins({top: 10, left:5, right: 10, bottom:20})
    .colors(singleColor)
    .group(reasons.group())
    .dimension(reasons)
    .elasticX(true)
    .gap(1)
    .ordering(function(i){return -i.value;});
  //reasonChart.on("filtered", onFiltered);

  dc.renderAll();

});