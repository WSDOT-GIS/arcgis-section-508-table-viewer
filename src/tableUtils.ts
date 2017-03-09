import { IFeatureSet } from "arcgis-rest-api-typescript/arcgis-rest";
import { getData } from "./serviceUtils";

/**
 * Determines if a date/time is midnight UTC.
 * If so it was probably intended to represent only a date.
 * @param dateTime a Date
 * @returns Returns true if the UTC time is midnight, false otherwise.
 */
function isMidnightUtc(dateTime: Date) {
    return dateTime.getUTCHours() === 0 &&
        dateTime.getUTCMinutes() === 0 &&
        dateTime.getUTCSeconds() === 0 &&
        dateTime.getUTCMilliseconds() === 0;
}

/**
 * Creates an HTML table showing the contents of a feature set.
 * @param featureSet - A feature set.
 */
export function createTableFromData(featureSet: IFeatureSet) {
    let table = document.createElement("table");

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);
    let thead = document.createElement("thead");
    table.appendChild(thead);
    let row = document.createElement("tr");
    thead.appendChild(row);

    // Omit the Object ID field.
    const oidFieldNameRe = /^O(bject)ID$/i;

    if (!featureSet.fields) {
        throw TypeError("fields property not defined on feature set object.");
    }
    for (let field of featureSet.fields) {
        if (oidFieldNameRe.test(field.name)) {
            continue;
        }
        let th = document.createElement("th");
        th.textContent = field.alias || field.name;
        row.appendChild(th);
    }

    const dateRe = /Date$/ig;
    const urlRe = /^https?:\/\//i;
    const gMapsRe = /^https?:\/\/www.google.com\/maps\/place\/([^/]+)\//i;

    for (let feature of featureSet.features) {
        row = document.createElement("tr");

        for (let field of featureSet.fields) {
            if (oidFieldNameRe.test(field.name)) {
                continue;
            }
            let cell = document.createElement("td");
            let value = feature.attributes[field.name];
            if (value === null) {
                cell.classList.add("null");
                cell.textContent = "(null)"; // "∅"; reader reads as "zero". can't use
            } else if (dateRe.test(field.type) && typeof value === "number") {
                // ArcGIS services return dates as integers.
                // Add a <time> element with the date.
                let theDate = new Date(value);
                let time = document.createElement("time");
                if (isMidnightUtc(theDate)) {
                    time.setAttribute("dateTime", theDate.toISOString());
                    time.textContent = `${theDate.toLocaleDateString()}`;
                } else {
                    time.setAttribute("dateTime", theDate.toISOString());
                    time.textContent = `${theDate.toLocaleString()}`;
                }
                cell.appendChild(time);
            } else if (urlRe.test(value)) {
                let linkUrl = value as string;
                let a = document.createElement("a");
                a.href = value;
                a.target = "externallink";
                let gMapsMatch = value.match(gMapsRe);
                if (gMapsMatch) {
                    a.textContent = gMapsMatch[1].replace(/\+/g, " ");
                } else {
                    a.textContent = "link";
                }
                cell.appendChild(a);
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
export default async function (layerUrl: string) {
    let featureSet = await getData(layerUrl);
    return createTableFromData(featureSet);
}
