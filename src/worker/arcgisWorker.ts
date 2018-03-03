import { IFeatureSet, ILayer } from "arcgis-rest-api-ts-d";

/**
 * Represents the response that is returned from a GIS
 * service when there's an error, but the HTTP status
 * code is 200.
 */
export interface IError {
    error: {
        [name: string]: any
    };
}

/**
 * Gets information about a map service.
 * @param serviceUrl URL to the map service layer.
 */
async function getServiceInfo(serviceUrl: string) {
    const response = await fetch(`${serviceUrl}?f=json`);
    const json = await response.json() as ILayer | IError;
    const errorJson = json as IError;
    if (errorJson.error) {
        throw errorJson.error;
    }
    return json as ILayer;
}

/**
 * Queries a Feature Layer for all records (or the max allowed by the server for services with a large amount).
 * @param layerUrl - Feature Layer URL.
 * @param [fieldNames] - Used to explicitly specify what fields will be included in output.
 * If omitted, all fields ("*") will be returned.
 */
async function getData(layerUrl: string, fieldNames?: string[]) {
    const sp: any = {
        f: "json",
        outFields: fieldNames ? fieldNames.join(",") : "*",
        returnGeometry: false,
        where: "1=1"
    };

    const searchParts = new Array<string>();
    for (const key in sp) {
        if (!(key in sp)) {
            continue;
        }
        searchParts.push(`${key}=${encodeURIComponent(sp[key])}`);
    }

    // Query the service to get all data (or the max amount of records allowed by the server).
    const url = `${layerUrl}/query?${searchParts.join("&")}`;
    const response = await fetch(url);
    // Parse the JSON text response.
    const json = await response.json() as IFeatureSet | IError;
    // Sometimes "successful" HTTP requests from ArcGIS server are still errors.
    // Throw an exception if an "error" property is present in the returned JSON.
    const err = json as IError;
    if (err.error) {
        throw err.error;
    }
    // Return the FeatureSet if no errors were encountered.
    const featureSet = json as IFeatureSet;
    return featureSet;
}

// Setup handling messages from the page.
addEventListener("message", async (msgEvt) => {
    // The only messages set from page to worker will be the layer URL string.
    if (msgEvt.data && typeof msgEvt.data === "string") {
        const url = msgEvt.data;
        // Get info about the map / feature service layer.
        const svcPromise = getServiceInfo(url);
        const serviceInfo = await svcPromise;
        // Create a list of fields that excludes OID and geometry.
        const fields = serviceInfo.fields.filter(
            (field) => field.type !== "esriFieldTypeOID" && field.type !== "esriFieldTypeGeometry");
        // Create an array of field names (from the filtered list).
        const fieldNames = fields.map((field) => field.name);
        // Send layer info back to the page so it can create table and column headers
        // while awaiting features.
        postMessage({
            fields,
            serviceInfo,
            type: "serviceInfo"
        });
        // Query the service to get features (up to the max amount set by the service).
        // When the query is complete, the features will be sent to the page.
        const dataPromise = getData(url, fieldNames);
        dataPromise.then((featureSet) => {
            postMessage({
                type: "featureSet",
                featureSet
            });
        }, (error) => {
            postMessage({
                type: "error",
                error
            });
        });

        // Once all of the HTTP queries to the feature service have
        // been completed, the worker is no longer needed and can be
        // closed.
        const allPromise = Promise.all([svcPromise, dataPromise]);
        allPromise.then((results) => {
            postMessage({
                type: "done",
                serviceInfo: results[0],
                featureSet: results[1]
            });
            close();
        });
        allPromise.catch((errors) => {
            postMessage({
                type: "done",
                errors
            });
        });
    } else {
        throw new TypeError("Unrecognized input message.");
    }
});
