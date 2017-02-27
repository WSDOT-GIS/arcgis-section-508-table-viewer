requirejs.config({
    baseUrl: "script",
});

import { default as getTable } from "./tableUtils";

let url = new URL("https://data.wsdot.wa.gov/arcgis/rest/services/Shared/CountyBoundaries/MapServer/0/");
let promise = getTable(url);
promise.then((frag) => {
    document.body.appendChild(frag);
});
promise.catch((error) => {
    let errorMsg = document.createElement("p");
    errorMsg.textContent = `Error loading data from ${url.toString()}`;
    document.body.appendChild(errorMsg);
});
