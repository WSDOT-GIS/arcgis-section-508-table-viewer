(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["exports"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports);
        global.reUtils = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.matchRegExps = matchRegExps;
    /**
     * Regular expression utilities
     */
    /**
     * Tests a string against multiple regular expressions.
     * @param str Test string
     * @param stopOnFirst Set to true to stop testing after the first match has been found.
     * @param regexps One or more regular expressions.
     */
    /**
     * Regular expression utilities
     */function matchRegExps(str) {
        var stopOnFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        for (var _len = arguments.length, regexps = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            regexps[_key - 2] = arguments[_key];
        }

        if (!stopOnFirst) {
            return regexps.map(function (re) {
                return str.match(re);
            });
        } else {
            var match = void 0;
            return regexps.map(function (re, i) {
                if (match) {
                    return null;
                } else {
                    return str.match(re);
                }
            });
        }
    }
});