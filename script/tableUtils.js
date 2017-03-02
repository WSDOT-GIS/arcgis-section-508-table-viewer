(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Queries a Feature Layer for all records (or the max allowed by the server for services with a large amount).
     * @param layerUrl - Feature Layer URL.
     */
    function getData(layerUrl) {
        var sp = new URLSearchParams();
        sp.append("where", "1=1");
        sp.append("outFields", "*");
        sp.append("returnGeometry", false.toString());
        sp.append("f", "json");
        var url = new URL(layerUrl + "/query?" + sp.toString());
        return fetch(url.toString()).then(function (response) {
            return response.json();
        }).then(function (jsonResponse) {
            var err = jsonResponse;
            if (err.error) {
                throw err.error;
            }
            return jsonResponse;
        }, function (reason) {
            throw reason;
        });
    }
    exports.getData = getData;
    /**
     * Creates an HTML table showing the contents of a feature set.
     * @param featureSet - A feature set.
     */
    function createTableFromData(featureSet) {
        var frag = document.createDocumentFragment();
        var table = document.createElement("table");
        frag.appendChild(table);
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        var thead = document.createElement("thead");
        table.appendChild(thead);
        var row = document.createElement("tr");
        thead.appendChild(row);
        for (var _i = 0, _a = featureSet.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var th = document.createElement("th");
            th.textContent = field.alias || field.name;
            row.appendChild(th);
        }
        var dateRe = /Date$/ig;
        for (var _b = 0, _c = featureSet.features; _b < _c.length; _b++) {
            var feature = _c[_b];
            row = document.createElement("tr");
            for (var _d = 0, _e = featureSet.fields; _d < _e.length; _d++) {
                var field = _e[_d];
                var cell = document.createElement("td");
                var value = feature.attributes[field.name];
                if (dateRe.test(field.type) && typeof value === "number") {
                    // ArcGIS services return dates as integers.
                    // Add a <time> element with the date.
                    var theDate = new Date(value);
                    var time = document.createElement("time");
                    time.dateTime = theDate.toISOString();
                    time.textContent = "" + theDate;
                    cell.appendChild(time);
                }
                else {
                    cell.textContent = "" + value;
                }
                cell.classList.add(field.type);
                row.appendChild(cell);
            }
            tbody.appendChild(row);
        }
        return frag;
    }
    exports.createTableFromData = createTableFromData;
    /**
     * Queries a feature layer and returns the results as an HTML table.
     * @param layerUrl URL to a feature layer.
     */
    function default_1(layerUrl) {
        var dataPromise = getData(layerUrl);
        return dataPromise.then(function (featureSet) {
            return createTableFromData(featureSet);
        });
    }
    exports.default = default_1;
});
