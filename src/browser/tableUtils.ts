import { IFeatureSet } from "arcgis-rest-api-typescript/arcgis-rest";
import { ILayer } from "arcgis-rest-api-typescript/layer";

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
 * Creates a table with an empty TBODY.
 * @param layer service layer definition
 */
export function createTable(layer: ILayer) {
    let table = document.createElement("table");

    let thead = document.createElement("thead");
    let row = document.createElement("tr");
    for (let field of layer.fields) {
        let th = document.createElement("th");
        th.textContent = field.alias || field.name;
        row.appendChild(th);
    }
    thead.appendChild(row);

    table.appendChild(thead);
    // Add empty table body.
    table.appendChild(document.createElement("tbody"));


    return table;
}

/**
 * Creates an document fragment containing table rows of data from the feature set.
 * @param featureSet - A feature set.
 * @returns A document fragment to be inserted into the table body.
 */
export function createRowsFromData(featureSet: IFeatureSet) {
    let docFrag = document.createDocumentFragment();

    let row = document.createElement("tr");
    docFrag.appendChild(row);

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
    }

    return docFrag;
}
