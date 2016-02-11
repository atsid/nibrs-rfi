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


