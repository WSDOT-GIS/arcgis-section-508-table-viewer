import { createRowsFromData, createTable } from "./tableUtils";

/**
 * Creates a form that the user can enter a feature layer URL into.
 */
function createForm() {
    let form = document.createElement("form");
    let urlBox = document.createElement("input");
    urlBox.type = "url";
    urlBox.id = "urlBox";
    urlBox.name = "url";
    urlBox.pattern = /.+\/\d+\/?$/.source;
    urlBox.placeholder = "https://data.example.com/arcgis/rest/folder/ServiceName/0";

    let label = document.createElement("label");
    label.htmlFor = urlBox.id;
    label.textContent = "Enter a URL to an ArcGIS Server Map or Feature Service layer";
    form.appendChild(label);
    form.appendChild(urlBox);

    let button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Submit";

    form.appendChild(button);

    return form;
}

// Get the specified URL from the search string.
// If the url is provided in the search, load the data from the specified service.
// Otherwise display a form the user can use to specify a service URL.
let match = !!location.search && location.search.match(/url=([^&]+)/);
if (match) {
    let url = decodeURIComponent(match[1]);
    let progress = document.createElement("progress");
    progress.textContent = "Loading table data...";
    document.body.appendChild(progress);

    // Start worker to load data.
    let worker = new Worker("script/worker/arcgisWorker.js");
    worker.addEventListener("message", (ev) => {
        if (ev.data.type === "serviceInfo" && ev.data.serviceInfo) {
            let table = createTable(ev.data.serviceInfo, ev.data.fields);
            document.body.appendChild(table);
        } else if (ev.data.type === "featureSet") {
            // Add rows to table.
            let frag = createRowsFromData(ev.data.featureSet);
            let tbody = document.querySelector("tbody");
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
    worker.addEventListener("error", (ev) => {
        console.error(ev.error);
    });
    worker.postMessage(url);
} else {
    let form = createForm();
    document.body.appendChild(form);
}
