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
let pageUrl = new URL(location.href);
let url = (pageUrl as any).searchParams.get("url");

// If the url is provided in the search, load the data from the specified service.
// Otherwise display a form the user can use to specify a service URL.
if (url) {
    let progress = document.createElement("progress");
    progress.textContent = "Loading table data...";
    document.body.appendChild(progress);

    // Start worker to load data.
    let worker = new Worker("script/worker/arcgisWorker.js");
    worker.addEventListener("message", (ev) => {
        console.log("worker message received", ev.data);
        if (ev.data.type === "serviceInfo" && ev.data.svcInfo) {
            let table = createTable(ev.data.svcInfo);
        } else if (ev.data.type === "featureSet") {
            // Add rows to table.
            let frag = createRowsFromData(ev.data.featureSet);
            let tbody = document.querySelector("tbody");
            if (tbody) {
                tbody.appendChild(frag);
            } else {
                console.error("Could not find table body");
            }
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
