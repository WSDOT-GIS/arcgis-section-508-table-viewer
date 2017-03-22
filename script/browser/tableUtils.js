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
        global.tableUtils = mod.exports;
    }
})(this, function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.createTable = createTable;
    exports.createRowsFromData = createRowsFromData;
    /**
     * Determines if a date/time is midnight UTC.
     * If so it was probably intended to represent only a date.
     * @param dateTime a Date
     * @returns Returns true if the UTC time is midnight, false otherwise.
     */
    function isMidnightUtc(dateTime) {
        return dateTime.getUTCHours() === 0 && dateTime.getUTCMinutes() === 0 && dateTime.getUTCSeconds() === 0 && dateTime.getUTCMilliseconds() === 0;
    }
    /**
     * Creates a table with an empty TBODY.
     * @param layer service layer definition
     */
    function createTable(layer, fields) {
        var table = document.createElement("table");
        var caption = document.createElement("caption");
        caption.textContent = layer.name;
        table.appendChild(caption);
        var thead = document.createElement("thead");
        var row = document.createElement("tr");
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = (fields || layer.fields)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var field = _step.value;

                var th = document.createElement("th");
                th.textContent = field.alias || field.name;
                row.appendChild(th);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        thead.appendChild(row);
        table.appendChild(thead);
        // Add empty table body.
        table.appendChild(document.createElement("tbody"));
        return table;
    }
    /**
     * Creates an document fragment containing table rows of data from the feature set.
     * @param featureSet - A feature set.
     * @returns A document fragment to be inserted into the table body.
     */
    function createRowsFromData(featureSet) {
        var dateRe = /Date$/ig;
        var urlRe = /^https?:\/\//i;
        var gMapsRe = /^https?:\/\/www.google.com\/maps\/place\/([^/]+)\//i;
        var phoneRe = /^(?:1[+-]?)?\(?(\d{3})[)-]?(\d{3})-?(\d{4})$/;
        var phoneFieldRe = /phone/ig;
        var emailRe = /^[^@]+@[^@]+$/;
        var emailFieldRe = /e\-?mail/ig;
        var frag = document.createDocumentFragment();
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = featureSet.features[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var feature = _step2.value;

                var row = document.createElement("tr");
                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                    for (var _iterator3 = featureSet.fields[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var field = _step3.value;

                        var cell = document.createElement("td");
                        var value = feature.attributes[field.name];
                        if (value === null) {
                            cell.classList.add("null");
                            cell.textContent = "null";
                        } else if (dateRe.test(field.type) && typeof value === "number") {
                            // ArcGIS services return dates as integers.
                            // Add a <time> element with the date.
                            var theDate = new Date(value);
                            var time = document.createElement("time");
                            if (isMidnightUtc(theDate)) {
                                time.setAttribute("dateTime", theDate.toISOString());
                                time.textContent = "" + theDate.toLocaleDateString();
                            } else {
                                time.setAttribute("dateTime", theDate.toISOString());
                                time.textContent = "" + theDate.toLocaleString();
                            }
                            cell.appendChild(time);
                        } else if (typeof value === "string" && urlRe.test(value)) {
                            var linkUrl = value;
                            var a = document.createElement("a");
                            a.href = value;
                            a.target = "externallink";
                            var gMapsMatch = value.match(gMapsRe);
                            if (gMapsMatch) {
                                a.textContent = gMapsMatch[1].replace(/\+/g, " ");
                            } else {
                                var linkMatch = linkUrl.match(/\/([^/]+)$/);
                                var textElement = document.createTextNode(linkMatch ? linkMatch[1] : "link");
                                a.appendChild(textElement);
                            }
                            cell.appendChild(a);
                        } else if (phoneFieldRe.test(field.name) && typeof value === "string") {
                            var match = value.match(phoneRe);
                            if (match) {
                                var _a = document.createElement("a");
                                _a.textContent = match[0];
                                _a.href = "tel:1+" + match[1] + match[2] + match[3];
                                _a.classList.add("fa", "fa-phone-square");
                                cell.appendChild(_a);
                            } else {
                                cell.textContent = "" + value;
                            }
                        } else if (emailFieldRe.test(field.name) && typeof value === "string" && emailRe.test(value)) {
                            var _a2 = document.createElement("a");
                            _a2.textContent = value;
                            _a2.href = "mailto:" + value;
                            cell.appendChild(_a2);
                        } else {
                            cell.textContent = "" + value;
                        }
                        cell.classList.add(field.type);
                        row.appendChild(cell);
                    }
                } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                            _iterator3.return();
                        }
                    } finally {
                        if (_didIteratorError3) {
                            throw _iteratorError3;
                        }
                    }
                }

                frag.appendChild(row);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        return frag;
    }
});