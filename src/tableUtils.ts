import { Error as ErrorResponse, FeatureSet } from "./FeatureTypes";

/**
 * Queries a Feature Layer for all records (or the max allowed by the server for services with a large amount).
 * @param layerUrl - Feature Layer URL.
 */
export async function getData(layerUrl: URL): Promise<FeatureSet> {
    let sp = new URLSearchParams();
    sp.append("where", "1=1");
    sp.append("outFields", "*");
    sp.append("returnGeometry", false.toString());
    sp.append("f", "json");

    let url = new URL(`${layerUrl}/query?${sp.toString()}`);
    let response = await fetch(url.toString());
    let json = await response.json() as FeatureSet | ErrorResponse;
    let err = json as ErrorResponse;
    if (err.error) {
        throw err.error;
    }
    return json as FeatureSet;
}

/**
 * Creates an HTML table showing the contents of a feature set.
 * @param featureSet - A feature set.
 */
export function createTableFromData(featureSet: FeatureSet) {
    let table = document.createElement("table");

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);
    let thead = document.createElement("thead");
    table.appendChild(thead);
    let row = document.createElement("tr");
    thead.appendChild(row);

    for (let field of featureSet.fields) {
        let th = document.createElement("th");
        th.textContent = field.alias || field.name;
        row.appendChild(th);
    }

    const dateRe = /Date$/ig;

    for (let feature of featureSet.features) {
        row = document.createElement("tr");

        for (let field of featureSet.fields) {
            let cell = document.createElement("td");
            let value = feature.attributes[field.name];
            if (dateRe.test(field.type) && typeof value === "number") {
                // ArcGIS services return dates as integers.
                // Add a <time> element with the date.
                let theDate = new Date(value);
                let time = document.createElement("time");
                time.dateTime = theDate.toISOString();
                time.textContent = `${theDate}`;
                cell.appendChild(time);
            } else {
                cell.textContent = `${value}`;
            }
            cell.classList.add(field.type);
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    return table;
}

/**
 * Queries a feature layer and returns the results as an HTML table.
 * @param layerUrl URL to a feature layer.
 */
export default async function (layerUrl: URL) {
    let featureSet = await getData(layerUrl);
    return createTableFromData(featureSet);
}
