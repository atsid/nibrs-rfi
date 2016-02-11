/*jshint nonew:true, jquery:true, curly:true, noarg:true, indent:2,
 trailing:true, white:true, forin:true, noempty:true, smarttabs:true,
 eqeqeq:true, strict:true, undef:true, debug:true, bitwise:true,
 browser:true, gcl:true, devel:true */

/* eslint no-multi-spaces: [2, { exceptions: { "VariableDeclarator": true } }]  */
/* eslint key-spacing: [2, { align: "colon" }] */
/* eslint no-underscore-dangle: 0 */

/* global NIBRS, console, Promise, performance */

NIBRS.namespace('nibrsGraph', function (nibrsGraph, $) {
    'use strict';

    nibrsGraph = {};
    
    var utils = NIBRS.module.utils;
    
    var dateChart = dc.lineChart("#date-chart");
    var hourChart = dc.barChart("#hour-chart");
    var dayChart = dc.rowChart("#day-chart");
    //var sourceChart = dc.rowChart("#source-chart");
    //var statusChart = dc.rowChart("#status-chart");
    //var neighborhoodChart = dc.rowChart("#neighborhood-chart");
    //var reasonChart = dc.rowChart("#reason-chart");
    //var openDaysChart = dc.rowChart("#opendays-chart");
    //var dataTable = dc.dataTable("#data-table");
    var dataCount = dc.dataCount('.data-count');

    var allCharts = [
        { chart: dateChart, id: "#date-chart" },
        { chart: hourChart, id: "#hour-chart" },
        { chart: dayChart, id: "#day-chart" },
        //{ chart: sourceChart, id: "#source-chart" },
        //{ chart: statusChart, id: "#status-chart" },
        //{ chart: neighborhoodChart, id: "#neighborhood-chart" },
        //{ chart: reasonChart, id: "#reason-chart" },
        //{ chart: openDaysChart, id: "#opendays-chart" }
    ];
    
    var endDate = new Date('7/1/2014'),
        thirtyDaysFrom = utils.getDate30DaysFrom(endDate);
    
    function onFiltered(chart, filter) {
        //updateMap(locations.top(Infinity));
    }

    var minDateLength = '1 Jan 14'.length;
    performance.mark('Start');
    function getNIBRSData() {
        return new Promise(function (resolve, reject) {
            d3.csv('../data/mu_nibrs2-slim.csv',
                function(incident) {
                    var incidentDateStr = incident.INCIDENT_DATE && incident.INCIDENT_DATE.length ?
                                          utils.replaceAll(incident.INCIDENT_DATE, '-', ' ') : '';
                    
                    if (incidentDateStr.length >= minDateLength) {
                        var incidentDate = new Date(incidentDateStr);
                        if (incidentDate >= thirtyDaysFrom.thirtyDaysAgo) {
                            var retainedIncident = {};
                            
                            retainedIncident.hour = incident.INCIDENT_HOUR && incident.INCIDENT_HOUR.length ?
                                                    incident.INCIDENT_HOUR : 0;
                            
                            incidentDate.setHours(retainedIncident.hour);
                            
                            retainedIncident.dateHour = d3.time.hour(incidentDate);
                            
                            //retainedIncident.offense = incident.OFFENSE && incident.OFFENSE.length ? offenses[incident.OFFENSE.trim()] : "";
                            //retainedIncident.location = incident.LOCATION && incident.LOCATION.length ? locations[incident.LOCATION.trim()] : "";
                            //retainedIncident.victimAge = victimAgeParts.length >= 2 ? victimAgeParts[1] : "";
                            //retainedIncident.offenderAge = offenderAgeParts.length >= 2 ? offenderAgeParts[1] : "";

                            //var arrestDate = arrestDateParts.length >= 4 ?
                            //                 new Date(arrestDateParts[1] + ' ' +
                            //                          arrestDateParts[2] + ' ' +
                            //                          arrestDateParts[3]) :
                            //                 null;
                            //
                            //retainedIncident.arrestDate = arrestDate ? dateFormat(arrestDate) : "";
                            //retainedIncident.arresteeAge = arresteeAgeParts.length >= 2 ? arresteeAgeParts[1] : "";

                            return retainedIncident;
                        }
                    }
                },
                function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
        });
    }

    Promise.all([$.getJSON('../data/locations.json'),
                 $.getJSON('../data/offenses.json'),
                 getNIBRSData()])
        .spread(function (locations, offenses, nibrsData) {
            performance.mark('Data loaded.');
            
            var graphLineColor = "#1a8bba",
                dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                index = crossfilter(nibrsData);
            
            performance.mark('Cross-Filter loaded.');

            var all = index.groupAll();
            performance.mark('Cross-Filter grouped.');

            dataCount
                .dimension(index)
                .group(all);

            var
            //dataYear = index.dimension( function(incident) { return incident.DATA_YEAR; }),
            //month = index.dimension( function(incident) { return incident.MONTH_NUM; }),
            //incidentDate = index.dimension( function(incident) { return incident.INCIDENT_DATE; }),
                incidentDateTime = index.dimension(function (incident) {
                    return incident.dateHour;
                }),
                incidentDays = index.dimension( function(incident) { 
                    var day = incident.dateHour.getDay();
                    return day + '.' + dayName[day];
                }),
                incidentHours = index.dimension( function(incident) { return incident.hour; })
            
            //offense = index.dimension( function(incident) { return incident.OFFENSE; }),
            //location = index.dimension( function(incident) { return incident.LOCATION; }),
            //weapon = index.dimension( function(incident) { return incident.WEAPON; }),
            //victimSex = index.dimension( function(incident) { return incident.VICTIM_SEX; }),
            //victimRace = index.dimension( function(incident) { return incident.VICTIM_RACE; }),
            //victimEthnicity = index.dimension( function(incident) { return incident.VICTIM_ETHN; }),
            //victimAge = index.dimension( function(incident) { return incident.VICTIM_AGE; }),
            //offenderSex = index.dimension( function(incident) { return incident.OFFENDER_SEX; }),
            //offenderRace = index.dimension( function(incident) { return incident.OFFENDER_RACE; }),
            //offenderEthnicity = index.dimension( function(incident) { return incident.OFFENDER_ETHN; }),
            //offenderAge = index.dimension( function(incident) { return incident.OFFENDER_AGE; }),
            //relationship = index.dimension( function(incident) { return incident.RELATIONSHIP_NAME; }),
            //arrestDate = index.dimension( function(incident) { return incident.ARREST_DATE; }),
            //arresteeAge = index.dimension( function(incident) { return incident.ARRESTEE_AGE; }),
            //arrestSex = index.dimension( function(incident) { return incident.ARREST_SEX; }),
            //arresteeRace = index.dimension( function(incident) { return incident.ARRESTEE_RACE; }),
            //arresteeEthnicity = index.dimension( function(incident) { return incident.ARRESTEE_ETHN; })
                ;

            performance.mark('Dimensions created.');

            dateChart
                .width($('#date-chart').innerWidth() - 30)
                .height(200)
                .margins({ top: 10, left: 30, right: 10, bottom: 20 })
                .x(d3.time.scale().domain([thirtyDaysFrom.thirtyDaysAgo, endDate]))
                .colors([graphLineColor])
                .dimension(incidentDateTime)
                .group(incidentDateTime.group())
                .renderArea(true)
                .elasticY(true)
                .yAxis().ticks(6);
            dateChart.on("postRedraw", onFiltered);

            performance.mark('dateChart created.');
            
            hourChart
                .width($('#hour-chart').innerWidth() - 30)
                .height(250)
                .margins({ top: 10, left: 35, right: 10, bottom: 20 })
                .x(d3.scale.linear().domain([1, 24]))
                .colors([graphLineColor])
                .dimension(incidentHours)
                .group(incidentHours.group())
                .gap(1)
                .elasticY(true);

            dayChart
                .width($('#day-chart').innerWidth() - 30)
                .height(183)
                .margins({ top: 10, left: 5, right: 10, bottom: - 1 })
                .label(function (i) {
                    return i.key.split('.')[1];
                })
                .title(function (i) {
                    return i.key.split('.')[1] + ': ' + i.value;
                })
                .colors([graphLineColor])
                .dimension(incidentDays)
                .group(incidentDays.group())
                .elasticX(true)
                .gap(1)
                .xAxis().ticks(0);

            /*
            
            statusChart
                .width($('#status-chart').innerWidth() - 30)
                .height(60)
                .margins({ top: 10, left: 5, right: 10, bottom: - 1 })
                .colors([graphLineColor])
                .group(status.group())
                .gap(1)
                .dimension(status)
                .elasticX(true)
                .xAxis().ticks(0);

            sourceChart
                .width($('#source-chart').innerWidth() - 30)
                .height(158)
                .margins({ top: 10, left: 5, right: 10, bottom: - 1 })
                .colors([graphLineColor])
                .group(sources.group())
                .dimension(sources)
                .elasticX(true)
                .gap(1)
                .ordering(function (i) {
                    return - i.value;
                })
                .xAxis().ticks(0);

            neighborhoodChart
                .width($('#neighborhood-chart').innerWidth() - 30)
                .height(435)
                .margins({ top: 10, left: 5, right: 10, bottom: 20 })
                .colors([graphLineColor])
                .group(neighborhoods.group())
                .dimension(neighborhoods)
                .elasticX(true)
                .gap(1)
                .ordering(function (i) {
                    return - i.value;
                })
                .labelOffsetY(12)
                .xAxis().ticks(3);

            reasonChart
                .width($('#reason-chart').innerWidth() - 30)
                .height(1000)
                .margins({ top: 10, left: 5, right: 10, bottom: 20 })
                .colors([graphLineColor])
                .group(reasons.group())
                .dimension(reasons)
                .elasticX(true)
                .gap(1)
                .ordering(function (i) {
                    return - i.value;
                })
                .labelOffsetY(12)
                .xAxis().ticks(3);

            openDaysChart
                .width($('#opendays-chart').innerWidth() - 30)
                .height(533)
                .margins({ top: 10, left: 5, right: 10, bottom: 20 })
                .colors([graphLineColor])
                .group(days_open.group())
                .dimension(days_open)
                .elasticX(true)
                .gap(1)
                .labelOffsetY(12)
                .xAxis().ticks(3);

            dataTable
                .dimension(open_dates)
                .group(function (d) {
                    return tda_date + " &ndash; present";
                })
                .size(100) // (optional) max number of records to be shown, :default = 25
                .columns([
                    function (d) {
                        return d.d;
                    },
                    function (d) {
                        return d.id;
                    },
                    function (d) {
                        return d.a;
                    },
                    function (d) {
                        return d.t;
                    },
                    function (d) {
                        return d.l;
                    },
                    function (d) {
                        return d.s;
                    },
                    function (d) {
                        return d.c_exp;
                    }
                ])
                .sortBy(function (d) {
                    return d.d
                })
                .order(d3.descending);
*/
            dc.renderAll();
            utils.measure();
        })
        .catch(function (reason) {
            console.error("Failed to load D3 with data: " + reason);
            utils.clearMarksAndMeasures();
        });

    window.onresize = function (event) {
        allCharts.forEach(function (chart) {
            // Disable redraw animation first to prevent jitter while resizing window
            chart.chart.transitionDuration(0).width($(chart.id).innerWidth() - 30);
        });
        dc.renderAll();
        // Set transition back to default:
        allCharts.forEach(function (chart) {
            chart.chart.transitionDuration(750);
        });
    };

    return nibrsGraph;
});

