var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./serviceUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var serviceUtils_1 = require("./serviceUtils");
    /**
     * Determines if a date/time is midnight UTC.
     * If so it was probably intended to represent only a date.
     * @param dateTime a Date
     * @returns Returns true if the UTC time is midnight, false otherwise.
     */
    function isMidnightUtc(dateTime) {
        return dateTime.getUTCHours() === 0 &&
            dateTime.getUTCMinutes() === 0 &&
            dateTime.getUTCSeconds() === 0 &&
            dateTime.getUTCMilliseconds() === 0;
    }
    /**
     * Creates an HTML table showing the contents of a feature set.
     * @param featureSet - A feature set.
     */
    function createTableFromData(featureSet) {
        var table = document.createElement("table");
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);
        var thead = document.createElement("thead");
        table.appendChild(thead);
        var row = document.createElement("tr");
        thead.appendChild(row);
        // Omit the Object ID field.
        var oidFieldNameRe = /^O(bject)ID$/i;
        if (!featureSet.fields) {
            throw TypeError("fields property not defined on feature set object.");
        }
        for (var _i = 0, _a = featureSet.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            if (oidFieldNameRe.test(field.name)) {
                continue;
            }
            var th = document.createElement("th");
            th.textContent = field.alias || field.name;
            row.appendChild(th);
        }
        var dateRe = /Date$/ig;
        var urlRe = /^https?:\/\//i;
        var gMapsRe = /^https?:\/\/www.google.com\/maps\/place\/([^/]+)\//i;
        var frag = document.createDocumentFragment();
        for (var _b = 0, _c = featureSet.features; _b < _c.length; _b++) {
            var feature = _c[_b];
            row = document.createElement("tr");
            for (var _d = 0, _e = featureSet.fields; _d < _e.length; _d++) {
                var field = _e[_d];
                if (oidFieldNameRe.test(field.name)) {
                    continue;
                }
                var cell = document.createElement("td");
                var value = feature.attributes[field.name];
                if (value === null) {
                    cell.classList.add("null");
                    cell.textContent = "(null)"; // "∅"; reader reads as "zero". can't use
                }
                else if (dateRe.test(field.type) && typeof value === "number") {
                    // ArcGIS services return dates as integers.
                    // Add a <time> element with the date.
                    var theDate = new Date(value);
                    var time = document.createElement("time");
                    if (isMidnightUtc(theDate)) {
                        time.setAttribute("dateTime", theDate.toISOString());
                        time.textContent = "" + theDate.toLocaleDateString();
                    }
                    else {
                        time.setAttribute("dateTime", theDate.toISOString());
                        time.textContent = "" + theDate.toLocaleString();
                    }
                    cell.appendChild(time);
                }
                else if (typeof value === "string" && urlRe.test(value)) {
                    var linkUrl = value;
                    var a = document.createElement("a");
                    a.href = value;
                    a.target = "externallink";
                    var gMapsMatch = value.match(gMapsRe);
                    if (gMapsMatch) {
                        a.textContent = gMapsMatch[1].replace(/\+/g, " ");
                    }
                    else {
                        a.textContent = "link";
                    }
                    cell.appendChild(a);
                }
                else {
                    cell.textContent = "" + value;
                }
                cell.classList.add(field.type);
                row.appendChild(cell);
            }
            frag.appendChild(row);
        }
        tbody.appendChild(frag);
        return table;
    }
    exports.createTableFromData = createTableFromData;
    /**
     * Queries a feature layer and returns the results as an HTML table.
     * @param layerUrl URL to a feature layer.
     */
    function default_1(layerUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var featureSet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, serviceUtils_1.getData(layerUrl)];
                    case 1:
                        featureSet = _a.sent();
                        return [2 /*return*/, createTableFromData(featureSet)];
                }
            });
        });
    }
    exports.default = default_1;
});
//# sourceMappingURL=C:/Users/jacobsj/Documents/GitHub/arcgis-section-508-table-viewer/script/tableUtils.js.map