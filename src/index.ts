requirejs.config({
    baseUrl: "script",
});

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

// searchParams property defined incorrectly as searchparams.
let url = ((pageUrl as any).searchParams as URLSearchParams).get("url");

// If the url is provided in the search, load the data from the specified service.
// Otherwise display a form the user can use to specify a service URL.
if (url) {
    let promise = getTable(new URL(url));
    promise.then((frag) => {
        document.body.appendChild(frag);
    });
    promise.catch((error) => {
        let errorMsg = document.createElement("p");
        errorMsg.textContent = `Error loading data from ${url}`;
        document.body.appendChild(errorMsg);
    });
} else {
    let form = createForm();
    document.body.appendChild(form);
}
