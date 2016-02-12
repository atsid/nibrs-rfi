/**
 * Created by greg.kedge on 2/11/16.
 */

/*jshint nonew:true, jquery:true, curly:true, noarg:true, indent:2,
 trailing:true, white:true, forin:true, noempty:true, smarttabs:true,
 eqeqeq:true, strict:true, undef:true, debug:true, bitwise:true,
 browser:true, gcl:true, devel:true */

/* eslint no-multi-spaces: [2, { exceptions: { "VariableDeclarator": true } }]  */
/* eslint key-spacing: [2, { align: "colon" }] */
/* eslint no-underscore-dangle: 0 */

/* global CRISP, jQuery, console */

((function ($) {
    'use strict';

    var NIBRS = window.NIBRS || {};

    NIBRS.namespace = function (name, immediateDefinition) {
        NIBRS.module = NIBRS.module || {};

        var parts = name.split('.'),
            container = NIBRS.module;

        for (var i = 0; i < parts.length; i++) {
            if (i < parts.length - 1 && !container[parts[i]]) {
                container[parts[i]] = {};
            }
            else {
                if (container[parts[i]]) {
                    log.warn('Double module import: ' + name);
                    return;
                }
                container[parts[i]] = immediateDefinition(container, $);
            }
            container = container[parts[i]];
        }
    };

    window.NIBRS = NIBRS;
    
}))(jQuery);



/**
 * Created by greg.kedge on 2/11/16.
 */

/*jshint nonew:true, jquery:true, curly:true, noarg:true, indent:2,
 trailing:true, white:true, forin:true, noempty:true, smarttabs:true,
 eqeqeq:true, strict:true, undef:true, debug:true, bitwise:true,
 browser:true, gcl:true, devel:true */

/* eslint no-multi-spaces: [2, { exceptions: { "VariableDeclarator": true } }]  */
/* eslint key-spacing: [2, { align: "colon" }] */
/* eslint no-underscore-dangle: 0 */

/* global NIBRS, console, Promise, performance */

NIBRS.namespace('utils', function (utils, $) {
    'use strict';

    var hasCaptureStackTrace = false;
    try {
        Error.captureStackTrace({}, '');
        hasCaptureStackTrace = true;
    } catch (e) {
        hasCaptureStackTrace = false;
    }

    function handleRejection(reason, message) {
        if (reason instanceof Error) {
            message = Error.prototype.name +': ' + message;
            message += '\n' + reason.message;
            if (_.isUndefined(reason.serviceChain)) {
                message += '\n' + reason.stack;
            }
        }
        else if (typeof reason === 'string') {
            message = reason;
        }
        else {
            message = '';
        }
        
        if (hasCaptureStackTrace) {
            var stackTrace = {};
            Error.captureStackTrace(stackTrace, handleRejection);
            var stack = stackTrace.stack;
            var breadcrumb = stack;
            // Cut off junk on front of stack string.
            _.each(['/internal/', 'at eval (', 'Error\n'], function (startOffsetStr) {
                var start = stack.indexOf(startOffsetStr);
                if (start > - 1) {
                    start += startOffsetStr.length;
                    breadcrumb = stack.substring(start);
                    return false;
                }
            });

            // Cut off junk on end of stack string.
            _.each([')', '\n'], function (endOffsetStr) {
                var end = breadcrumb.indexOf(endOffsetStr);
                if (end > - 1) {
                    breadcrumb = breadcrumb.substring(0, end);
                    return false;
                }
            });
            message += 'Breadcrumb: ' + breadcrumb;
        }

        console.error(message);
    }

    function spread(promises, fulfilled, rejected) {
        return Promise.all(promises).spread(fulfilled, rejected);
    }

    Promise.prototype.spread = function (fulfilled, rejected) {
        return this.then(function (allResults) {
            return fulfilled.apply(void 0, allResults);
        }, rejected);
    };
    Promise.spread = spread;

    function replaceAll(string, omit, place, prevstring) {
        if (prevstring && string === prevstring)
        {
            return string;
        }
        prevstring = string.replace(omit, place);
        return replaceAll(prevstring, omit, place, string)
    }

    function clearMarksAndMeasures() {
        performance.clearMeasures();
        performance.clearMarks();
    }

    function measure() {
        performance.measure(
            'Data loaded.',
            'Start',
            'Data loaded.');
        performance.measure(
            'Cross-Filter loaded.',
            'Data loaded.',
            'Cross-Filter loaded.');
        performance.measure(
            'Cross-Filter grouped.',
            'Cross-Filter loaded.',
            'Cross-Filter grouped.');
        performance.measure(
            'Dimensions created.',
            'Cross-Filter grouped.',
            'Dimensions created.');
        performance.measure(
            'dateChart created.',
            'Dimensions created.',
            'dateChart created.');
        performance.measure(
            'Total.',
            'Start',
            'dateChart created.');

        var perfMeasures = performance.getEntriesByType("measure");
        _.each(_.sortBy(perfMeasures, ['startTime', 'name']), function (perfMeasure) {
            console.info(perfMeasure.name + ':\t' +
                         parseFloat(perfMeasure.duration).toFixed(2) + 'ms');
        });

        clearMarksAndMeasures();
    }

    function getDate30DaysFrom(date) {
        date = date || performance.now;
        var thirtyDaysAgo = d3.time.day(new Date(date.getTime() - 30 * 24 * 60 * 60 * 1000)),
            thirtyDaysAgoISO = thirtyDaysAgo.toISOString().substring(0, 10);
        return { from: date, thirtyDaysAgo: thirtyDaysAgo, thirtyDaysAgoISO: thirtyDaysAgoISO };
    }

    function scrubString(dirtyString, defaultValue) {
        return dirtyString && dirtyString.length ? dirtyString.trim() : (defaultValue || '');
    }

    utils = {
        replaceAll           : replaceAll,
        scrubString          : scrubString,
        getDate30DaysFrom    : getDate30DaysFrom,
        measure              : measure,
        handleRejection      : handleRejection,
        clearMarksAndMeasures: clearMarksAndMeasures
    };

    return utils;
});

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

    var search = window.location.search,
        dataName = (search && search.indexOf('full') > 0) ? 'slim' : 'jun', //little hack to let us test out the full size dataset
        dataUrl = 'data/mu_nibrs2-' + dataName + '.csv',
        endDate = new Date('7/1/2014'),
        thirtyDaysFrom = utils.getDate30DaysFrom(endDate),
        minDateLength = '1 Jan 14'.length,
        dateChart = dc.lineChart("#date-chart"),
        hourChart = dc.barChart("#hour-chart"),
        dayChart = dc.rowChart("#day-chart"),
        sexByAgeChart = dc.barChart("#sex-by-age-chart"),
        raceByAgeChart = dc.barChart("#race-by-age-chart"),
        locationChart = dc.rowChart("#location-chart"),
        offenseChart = dc.rowChart("#offense-chart"),
        dataCount = dc.dataCount('.data-count');

    var allCharts = [
        { chart: dateChart, id: "#date-chart" },
        { chart: hourChart, id: "#hour-chart" },
        { chart: dayChart, id: "#day-chart" },
        { chart: sexByAgeChart, id: "#sex-by-age-chart" },
        { chart: raceByAgeChart, id: "#race-by-age-chart" },
        { chart: locationChart, id: "#location-chart" },
        { chart: offenseChart, id: "#offense-chart" }
    ];

    function onFiltered(chart, filter) {
        //updateMap(locations.top(Infinity));
    }

    performance.mark('Start');
    function getNIBRSData() {
        var ageRegex = /(\d+)-+/;

        return new Promise(function (resolve, reject) {
            d3.csv(dataUrl,
                function (incident) {
                    var incidentDateStr = incident.INCIDENT_DATE && incident.INCIDENT_DATE.length ?
                                          utils.replaceAll(incident.INCIDENT_DATE, '-', ' ') : '';

                    if (incidentDateStr.length >= minDateLength) {
                        var incidentDate = new Date(incidentDateStr);

                        if (incidentDate >= thirtyDaysFrom.thirtyDaysAgo) {
                            var incidentHour = utils.scrubString(incident.INCIDENT_HOUR, '0'),
                                offenderAgeParts = utils.scrubString(incident.OFFENDER_AGE, '')
                                                       .match(ageRegex) || [];

                            incidentDate.setHours(incidentHour);

                            var interestingIncident = {
                                hour        : incidentHour,
                                dateHour    : d3.time.hour(incidentDate),
                                offense     : utils.scrubString(incident.OFFENSE),
                                location    : utils.scrubString(incident.LOCATION),
                                offenderAge : offenderAgeParts.length >= 2 ?
                                              offenderAgeParts[1] : "",
                                offenderSex : utils.scrubString(incident.OFFENDER_SEX, 'U'),
                                offenderRace: utils.scrubString(incident.OFFENDER_RACE, 'U'),
                            };
                            return interestingIncident;
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

    Promise.all([$.getJSON('data/locations.json'),
                 $.getJSON('data/offenses.json'),
                 getNIBRSData()])
        .spread(function (locations, offenses, nibrsData) {
            performance.mark('Data loaded.');

            var graphLineColor = "#F5DE93",
                dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                index = crossfilter(nibrsData);

            performance.mark('Cross-Filter loaded.');

            var all = index.groupAll();
            performance.mark('Cross-Filter grouped.');

            dataCount
                .dimension(index)
                .group(all);

            var incidentDateTime = index.dimension(function (incident) {
                    return incident.dateHour;
                }),
                incidentDays = index.dimension(function (incident) {
                    var day = incident.dateHour.getDay();
                    return day + '.' + dayName[day];
                }),
                incidentHours = index.dimension(function (incident) {
                    return incident.hour;
                }),
                offense = index.dimension(function (incident) {
                    return offenses[incident.offense];
                }),
                location = index.dimension(function (incident) {
                    return locations[incident.location];
                }),
                offenderAge = index.dimension(function (incident) {
                    return incident.offenderAge;
                });

            performance.mark('Dimensions created.');

            dateChart
                .width($('#date-chart').innerWidth() - 30)
                .height(200)
                .margins({ top: 10, left: 50, right: 10, bottom: 20 })
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

            var sexByAge = offenderAge.group().reduce(
                function (p, v) {
                    switch (v.offenderSex) {
                        case 'F':
                            p.female ++;
                            break;
                        case 'M':
                            p.male ++;
                            break;
                        default:
                        case 'U':
                            p.unknown ++;
                            break;
                    }
                    return p;
                },
                function (p, v) {
                    switch (v.offenderSex) {
                        case 'F':
                            p.female --;
                            break;
                        case 'M':
                            p.male --;
                            break;
                        default:
                        case 'U':
                            p.unknown --;
                            break;
                    }
                    return p;
                },
                function () {
                    return {
                        unknown: 0,
                        female : 0,
                        male   : 0
                    };
                }
            );

            var sexInnerWidth = $('#sex-by-age-chart').innerWidth();
            sexByAgeChart
                .width(sexInnerWidth - 30)
                .height(200)
                .margins({ top: 40, right: 50, bottom: 30, left: 60 })
                .dimension(offenderAge)
                .group(sexByAge, "Unknown")
                .valueAccessor(function (d) {
                    return d.value.unknown;
                })
                .stack(sexByAge, "Female", function (d) {
                    return d.value.female;
                })
                .stack(sexByAge, "Male", function (d) {
                    return d.value.male;
                })
                .x(d3.scale.linear().domain([5, 80]))
                .renderHorizontalGridLines(true)
                .centerBar(true)
                .elasticY(true)
                .brushOn(false)
                .legend(dc.legend().x(sexInnerWidth - 100).y(10));

            var raceByAge = offenderAge.group().reduce(
                function (p, v) {
                    switch (v.offenderRace) {
                        case 'A':
                            p.asian ++;
                            break;
                        case 'W':
                            p.caucasian ++;
                            break;
                        case 'B':
                            p.african ++;
                            break;
                        case 'P':
                            p.pacificIslander ++;
                            break;
                        case 'I':
                            p.indigenous ++;
                            break;
                        default:
                        case 'U':
                            p.unknown ++;
                            break;
                    }
                    return p;
                },
                function (p, v) {
                    switch (v.offenderRace) {
                        case 'A':
                            p.asian --;
                            break;
                        case 'W':
                            p.caucasian --;
                            break;
                        case 'B':
                            p.african --;
                            break;
                        case 'P':
                            p.pacificIslander --;
                            break;
                        case 'I':
                            p.indigenous --;
                            break;
                        default:
                        case 'U':
                            p.unknown --;
                            break;
                    }
                    return p;
                },
                function () {
                    return {
                        unknown        : 0,
                        asian          : 0,
                        caucasian      : 0,
                        african        : 0,
                        pacificIslander: 0,
                        indigenous     : 0
                    };
                }
            );

            var raceInnerWidth = $('#race-by-age-chart').innerWidth();
            raceByAgeChart
                .width(raceInnerWidth - 30)
                .height(200)
                .margins({ top: 40, right: 50, bottom: 30, left: 60 })
                .dimension(offenderAge)
                .group(raceByAge, "Unknown")
                .valueAccessor(function (d) {
                    return d.value.unknown;
                })
                .stack(raceByAge, "Asian", function (d) {
                    return d.value.asian;
                })
                .stack(raceByAge, "Caucasian", function (d) {
                    return d.value.caucasian;
                })
                .stack(raceByAge, "African", function (d) {
                    return d.value.african;
                })
                .stack(raceByAge, "Pacific Isle", function (d) {
                    return d.value.pacificIslander;
                })
                .stack(raceByAge, "Indigenous", function (d) {
                    return d.value.indigenous;
                })
                .x(d3.scale.linear().domain([5, 80]))
                .renderHorizontalGridLines(true)
                .centerBar(true)
                .elasticY(true)
                .brushOn(false)
                .legend(dc.legend().x(raceInnerWidth - 100).y(10));

            locationChart
                .width($('#location-chart').innerWidth() - 30)
                .height(935)
                .margins({ top: 10, left: 5, right: 10, bottom: 20 })
                .colors([graphLineColor, ])
                .group(location.group())
                .dimension(location)
                .elasticX(true)
                .gap(1)
                .ordering(function (i) {
                    return - i.value;
                })
                .labelOffsetY(12)
                .xAxis().ticks(3);

            offenseChart
                .width($('#offense-chart').innerWidth() - 30)
                .height(935)
                .margins({ top: 10, left: 5, right: 10, bottom: 20 })
                .colors([graphLineColor])
                .group(offense.group())
                .dimension(offense)
                .elasticX(true)
                .gap(1)
                .ordering(function (i) {
                    return - i.value;
                })
                .labelOffsetY(12)
                .xAxis().ticks(3);

            dc.renderAll();
            utils.measure();
        })
        .catch(function (reason) {
            utils.handleRejection(reason, "Failed to load D3 with data:");
            utils.clearMarksAndMeasures();
        });
    
    $('a.reset').on('click', function() {
        var chartID = '#' + $(this).closest('.chart').attr('id');
        _.each(allCharts, function(chart) {
            if (chart.id === chartID) {
                chart.chart.filterAll();
                dc.redrawAll();
                return false;
            }
        });
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

