import { ILayer } from "arcgis-rest-api-ts-d";
import { createRowsFromData, createTable } from "./tableUtils";

/**
 * Creates a form that the user can enter a feature layer URL into.
 */
function createForm() {
    const form = document.createElement("form");
    const urlBox = document.createElement("input");
    urlBox.type = "url";
    urlBox.id = "urlBox";
    urlBox.name = "url";
    urlBox.pattern = /.+\/\d+\/?$/.source;
    urlBox.placeholder = "https://data.example.com/arcgis/rest/folder/ServiceName/0";

    const label = document.createElement("label");
    label.htmlFor = urlBox.id;
    label.textContent = "Enter a URL to an ArcGIS Server Map or Feature Service layer";
    form.appendChild(label);
    form.appendChild(urlBox);

    const button = document.createElement("button");
    button.type = "submit";
    button.textContent = "Submit";

    form.appendChild(button);

    return form;
}

// Get the specified URL from the search string.
// If the url is provided in the search, load the data from the specified service.
// Otherwise display a form the user can use to specify a service URL.
const match = !!location.search && location.search.match(/url=([^&]+)/);
if (match) {
    const url = decodeURIComponent(match[1]);
    const progress = document.createElement("progress");
    progress.textContent = "Loading table data...";
    document.body.appendChild(progress);

    // Start worker to load data.
    const worker = new Worker("script/arcgisWorker.js");
    worker.addEventListener("message", (ev) => {
        if (ev.data.type === "serviceInfo" && ev.data.serviceInfo) {
            const table = createTable(ev.data.serviceInfo, ev.data.fields);
            const h1 = document.createElement("h1");
            h1.textContent = (ev.data.serviceInfo as ILayer).name;
            document.body.appendChild(h1);
            document.body.appendChild(table);
        } else if (ev.data.type === "featureSet") {
            // Add rows to table.
            const frag = createRowsFromData(ev.data.featureSet);
            const tbody = document.querySelector("tbody");
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
    const form = createForm();
    document.body.appendChild(form);
}
