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
        define(["require", "exports", "./fixes", "./serviceUtils", "./tableUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require("./fixes");
    requirejs.config({
        baseUrl: "script",
    });
    var serviceUtils_1 = require("./serviceUtils");
    var tableUtils_1 = require("./tableUtils");
    /**
     * Creates a form that the user can enter a feature layer URL into.
     */
    function createForm() {
        var form = document.createElement("form");
        var urlBox = document.createElement("input");
        urlBox.type = "url";
        urlBox.id = "urlBox";
        urlBox.name = "url";
        urlBox.pattern = /.+\/\d+\/?$/.source;
        urlBox.placeholder = "https://data.example.com/arcgis/rest/folder/ServiceName/0";
        var label = document.createElement("label");
        label.htmlFor = urlBox.id;
        label.textContent = "Enter a URL to an ArcGIS Server Map or Feature Service layer";
        form.appendChild(label);
        form.appendChild(urlBox);
        var button = document.createElement("button");
        button.type = "submit";
        button.textContent = "Submit";
        form.appendChild(button);
        return form;
    }
    // Get the specified URL from the search string.
    var pageUrl = new URL(location.href);
    var url = pageUrl.searchParams.get("url");
    function addTable(serviceUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var table, error_1, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, tableUtils_1.default(serviceUrl)];
                    case 1:
                        table = _a.sent();
                        document.body.appendChild(table);
                        return [2 /*return*/, table];
                    case 2:
                        error_1 = _a.sent();
                        errorMsg = document.createElement("p");
                        errorMsg.textContent = "Error loading data from " + serviceUrl;
                        document.body.appendChild(errorMsg);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    // If the url is provided in the search, load the data from the specified service.
    // Otherwise display a form the user can use to specify a service URL.
    if (url) {
        // Create the progress bar.
        var progress_1 = document.createElement("progress");
        progress_1.textContent = "Loading table data...";
        document.body.appendChild(progress_1);
        var tablePromise = addTable(url);
        var layerInfoPromise = serviceUtils_1.getServiceInfo(url);
        var allPromise = Promise.all([tablePromise, layerInfoPromise]);
        allPromise.then(function (results) {
            document.body.removeChild(progress_1);
            var table = results[0];
            var data = results[1];
            // Add title to page.
            if (data.name) {
                document.title = data.name;
                var header = document.createElement("h1");
                header.textContent = data.name;
                document.body.insertBefore(header, document.body.firstChild);
                if (table) {
                    var caption = document.createElement("caption");
                    caption.textContent = data.name;
                    table.appendChild(caption);
                }
            }
        });
        allPromise.catch(function (reason) {
            document.body.removeChild(progress_1);
            console.error(reason);
        });
    }
    else {
        var form = createForm();
        document.body.appendChild(form);
    }
});
//# sourceMappingURL=c:/Users/JacobsJ/Documents/GitHub/arcgis-section-508-table-viewer/script/index.js.map