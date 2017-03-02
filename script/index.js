(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./tableUtils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    requirejs.config({
        baseUrl: "script",
    });
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
    // searchParams property defined incorrectly as searchparams.
    var url = pageUrl.searchParams.get("url");
    // If the url is provided in the search, load the data from the specified service.
    // Otherwise display a form the user can use to specify a service URL.
    if (url) {
        var promise = tableUtils_1.default(new URL(url));
        promise.then(function (frag) {
            document.body.appendChild(frag);
        });
        promise.catch(function (error) {
            var errorMsg = document.createElement("p");
            errorMsg.textContent = "Error loading data from " + url;
            document.body.appendChild(errorMsg);
        });
    }
    else {
        var form = createForm();
        document.body.appendChild(form);
    }
});
