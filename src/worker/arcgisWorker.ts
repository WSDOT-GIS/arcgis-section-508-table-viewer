import { IFeatureSet, ILayer } from "arcgis-rest-api-ts-d";

importScripts("../polyfill.min.js");

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
    let response = await fetch(`${serviceUrl}?f=json`);
    let json = await response.json() as ILayer | IError;
    let errorJson = json as IError;
    if (errorJson.error) {
        throw errorJson.error;
    }
    return json as ILayer;
}

function toUrlSearch(obj: any) {
    let searchParts = new Array<string>();
    for (let key in obj) {
        if (!(key in obj)) {
            continue;
        }
        searchParts.push(`${key}=${encodeURIComponent(obj[key])}`);
    }
    return searchParts.join("&");
}

// async function getFeatureCount(layerUrl: string) {
//     const query = {
//         f: "json",
//         where: "1=1",
//         returnIdsOnly: true
//     };
//     let url = `${layerUrl}/query?${toUrlSearch(query)}`;
//     let response = await fetch(url);
//     let json = await response.json();
//     if (json.error) {
//         throw json.error;
//     } else if (json.count) {
//         return json.count as number;
//     } else {
//         throw TypeError("Unexpected result type");
//     }
// }

async function getObjectIds(layerUrl: string) {
    const query = {
        f: "json",
        where: "1=1",
        returnIdsOnly: true
    };
    let url = `${layerUrl}/query?${toUrlSearch(query)}`;
    let response = await fetch(url);
    let json = await response.json();
    if (json.error) {
        throw json.error;
    }
    return json as {
        objectIdFieldName: string,
        objectIds: number[]
    };
}

async function getDataInChunks(layerUrl: string, fieldNames?: string[], layerInfo?: ILayer) {
    let objectIdInfo = await getObjectIds(layerUrl);
    if (!layerInfo) {
        layerInfo = await getServiceInfo(layerUrl);
    }
    let maxRecords = layerInfo.maxRecordCount;
    if (objectIdInfo.objectIds.length > maxRecords) {
        let promises = new Array<Promise<IFeatureSet>>();
        for (let i = 0, l = objectIdInfo.objectIds.length; i < l; i += maxRecords) {
            let idset = objectIdInfo.objectIds.slice(i, maxRecords);
            let where = `'${objectIdInfo.objectIdFieldName}' IN (${idset.join(",")})`;
            let promise = getData(layerUrl, fieldNames, where);
            promises.push(promise);
        }
        return promises;
    } else {
        return await getData(layerUrl, fieldNames);
    }
}

/**
 * Queries a Feature Layer for all records (or the max allowed by the server for services with a large amount).
 * @param layerUrl - Feature Layer URL.
 * @param [fieldNames] - Used to explicitly specify what fields will be included in output.
 * If omitted, all fields ("*") will be returned.
 */
async function getData(layerUrl: string, fieldNames?: string[], where: string= "1=1") {
    // Get the names of the fields, excluding the OID field.
    // tslint:disable-next-line:max-line-length
    // let fieldNames = serviceInfo.fields.filter((field) => field.type !== "esriFieldTypeOID").map((field) => field.name);

    let sp: any = {
        f: "json",
        outFields: fieldNames ? fieldNames.join(",") : "*",
        returnGeometry: false,
        where
    };

    let url = `${layerUrl}/query?${toUrlSearch(sp)}`;
    let response = await fetch(url);
    let json = await response.json();
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
        let serviceInfo = await getServiceInfo(url);
        let fields = serviceInfo.fields.filter(
            (field) => field.type !== "esriFieldTypeOID" && field.type !== "esriFieldTypeGeometry");
        let fieldNames = fields.map((field) => field.name);
        postMessage({
            fields,
            serviceInfo,
            type: "serviceInfo"
        });
        // let dataPromise = getData(url, fieldNames);
        // dataPromise.then((featureSet) => {
        //     postMessage({
        //         type: "featureSet",
        //         featureSet
        //     });
        // });

        let dataPromise = await getDataInChunks(url, fieldNames, serviceInfo);

        if (dataPromise instanceof Promise) {
            let promises = dataPromise as Array<Promise<IFeatureSet>>;
            const pLen = promises.length;
            postMessage({
                type: "queryCount",
                queryCount: pLen
            });
            promises.forEach((promise, i) => {
                promise.then((featureSet) => {
                    postMessage({
                        type: "featureSet",
                        featureSet,
                        index: i,
                        total: pLen
                    });
                });
            });
            try {
                await Promise.all(promises);
                postMessage({
                    type: "done"
                });
                close();
            } catch (error) {
                postMessage({
                    type: "done",
                    error
                });
            }
            close();
        } else {
            postMessage({
                type: "featureSet",
                featureSet: dataPromise as IFeatureSet
            });
            postMessage({
                type: "done"
            });
            close();
        }
    } else {
        throw new TypeError("Unrecognized input message.");
    }
});
