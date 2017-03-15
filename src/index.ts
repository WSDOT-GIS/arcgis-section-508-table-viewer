requirejs.config({
    baseUrl: "script",
});

import { getServiceInfo } from "./serviceUtils";
import { default as getTable } from "./tableUtils";

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

async function addTable(serviceUrl: string) {
    try {
        let table = await getTable(serviceUrl);
        document.body.appendChild(table);
        return table;
    } catch (error) {
        let errorMsg = document.createElement("p");
        errorMsg.textContent = `Error loading data from ${serviceUrl}`;
        document.body.appendChild(errorMsg);
    }
}

// If the url is provided in the search, load the data from the specified service.
// Otherwise display a form the user can use to specify a service URL.
if (url) {
    // Create the progress bar.
    let progress = document.createElement("progress");
    progress.textContent = "Loading table data...";
    document.body.appendChild(progress);

    let tablePromise = addTable(url);
    let layerInfoPromise = getServiceInfo(url);
    let allPromise = Promise.all([tablePromise, layerInfoPromise]);
    allPromise.then((results) => {
        document.body.removeChild(progress);
        let table = results[0];
        let data = results[1];
        // Add title to page.
        if (data.name) {
            document.title = data.name;
            let header = document.createElement("h1");
            header.textContent = data.name;
            document.body.insertBefore(header, document.body.firstChild);

            if (table) {
                let caption = document.createElement("caption");
                caption.textContent = data.name;
                table.appendChild(caption);
            }
        }
    });
    allPromise.catch((reason) => {
        document.body.removeChild(progress);
        console.error(reason);
    });
} else {
    let form = createForm();
    document.body.appendChild(form);
}
