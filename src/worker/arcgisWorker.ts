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
export async function getServiceInfo(serviceUrl: string) {
    let response = await fetch(`${serviceUrl}?f=json`);
    let json = await response.json() as ILayer | IError;
    let errorJson = json as IError;
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
export async function getData(layerUrl: string, fieldNames?: string[]) {
    // Get the names of the fields, excluding the OID field.
    // tslint:disable-next-line:max-line-length
    // let fieldNames = serviceInfo.fields.filter((field) => field.type !== "esriFieldTypeOID").map((field) => field.name);

    let sp = {
        f: "json",
        outFields: fieldNames ? fieldNames.join(",") : "*",
        returnGeometry: false,
        where: "1=1"
    };

    let searchParts = new Array<string>(4);
    for (let key in sp) {
        if (!(key in sp)) {
            continue;
        }
        searchParts.push(`${key}=${encodeURIComponent(sp[key])}`);
    }

    let url = `${layerUrl}/query?${searchParts.join("&")}`;
    let response = await fetch(url);
    let json = await response.json() as IFeatureSet | IError;
    let err = json as IError;
    if (err.error) {
        throw err.error;
    }
    let featureSet = json as IFeatureSet;
    return featureSet;
}

addEventListener("message", async (msgEvt) => {
    if (msgEvt.data && typeof msgEvt.data === "string") {
        let url = msgEvt.data;
        let svcPromise = getServiceInfo(url);
        let serviceInfo = await svcPromise;
        postMessage({
            data: {
                serviceInfo,
                type: "serviceInfo"
            }
        });
        let fields = serviceInfo.fields.filter(
            (field) => field.type !== "esriFieldTypeOID").map(
                (field) => field.name);
        let dataPromise = getData(url, fields);
        dataPromise.then((featureSet) => {
            postMessage({
                data: {
                    type: "featureSet",
                    featureSet
                }
            });
        });

        let allPromise = Promise.all([svcPromise, dataPromise]);
        allPromise.then((results) => {
            postMessage({
                data: {
                    serviceInfo: results[0],
                    featureSet: results[1]
                }
            });
            close();
        });
    } else {
        throw new TypeError("Unrecognized input message.");
    }
});
