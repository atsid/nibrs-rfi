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
