import { IFeatureSet } from "arcgis-rest-api-typescript/arcgis-rest";
import { ILayer } from "arcgis-rest-api-typescript/layer";

/**
 * Represents the response that is returned from a GIS
 * service when there's an error, but the HTTP status
 * code is 200.
 */
export interface IError {
    error: {
        [name: string]: any,
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
 */
export async function getData(layerUrl: string) {
    // Get the info about the layer.
    let serviceInfo = await getServiceInfo(layerUrl);
    // Get the names of the fields, excluding the OID field.
    let fieldNames = serviceInfo.fields.filter((field) => field.type !== "esriFieldTypeOID").map((field) => field.name);

    let sp = new URLSearchParams();
    sp.append("where", "1=1");
    sp.append("outFields", fieldNames.join(","));
    sp.append("returnGeometry", false.toString());
    sp.append("f", "json");

    let url = new URL(`${layerUrl}/query?${sp.toString()}`);
    let response = await fetch(url.toString());
    let json = await response.json() as IFeatureSet | IError;
    let err = json as IError;
    if (err.error) {
        throw err.error;
    }
    let featureSet = json as IFeatureSet;
    return featureSet;
}
