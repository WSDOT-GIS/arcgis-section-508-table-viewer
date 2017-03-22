(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["./tableUtils"], factory);
    } else if (typeof exports !== "undefined") {
        factory(require("./tableUtils"));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.tableUtils);
        global.index = mod.exports;
    }
})(this, function (_tableUtils) {
    "use strict";

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
    // If the url is provided in the search, load the data from the specified service.
    // Otherwise display a form the user can use to specify a service URL.
    var match = !!location.search && location.search.match(/url=([^&]+)/);
    if (match) {
        var url = decodeURIComponent(match[1]);
        var progress = document.createElement("progress");
        progress.textContent = "Loading table data...";
        document.body.appendChild(progress);
        // Start worker to load data.
        var worker = new Worker("script/worker/arcgisWorker.js");
        worker.addEventListener("message", function (ev) {
            if (ev.data.type === "serviceInfo" && ev.data.serviceInfo) {
                var table = (0, _tableUtils.createTable)(ev.data.serviceInfo, ev.data.fields);
                var h1 = document.createElement("h1");
                h1.textContent = ev.data.serviceInfo.name;
                document.body.appendChild(h1);
                document.body.appendChild(table);
            } else if (ev.data.type === "featureSet") {
                // Add rows to table.
                var frag = (0, _tableUtils.createRowsFromData)(ev.data.featureSet);
                var tbody = document.querySelector("tbody");
                if (tbody) {
                    tbody.appendChild(frag);
                } else {
                    console.error("Could not find table body");
                }
            } else if (ev.data.type === "done") {
                document.body.removeChild(progress);
                // Check for "errors". Report these to console.
                if (ev.data.errors) {
                    console.error(ev.data.errors);
                }
            } else {
                console.warn("Unexpected condition", ev);
            }
        });
        worker.addEventListener("error", function (ev) {
            console.error(ev.error);
        });
        worker.postMessage(url);
    } else {
        var form = createForm();
        document.body.appendChild(form);
    }
});