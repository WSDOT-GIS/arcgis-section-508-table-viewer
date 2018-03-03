import { IFeatureSet, IField, ILayer } from "arcgis-rest-api-ts-d";

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
export function createTable(layer: ILayer, fields?: IField[]) {
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.textContent = layer.name;
    table.appendChild(caption);

    const thead = document.createElement("thead");
    const row = document.createElement("tr");
    for (const field of (fields || layer.fields)) {
        const th = document.createElement("th");
        th.textContent = field.alias || field.name;
        th.scope = "col";
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
    const dateRe = /Date$/ig;
    const urlRe = /^https?:\/\//i;
    const gMapsRe = /^https?:\/\/www.google.com\/maps\/place\/([^/]+)\//i;
    const phoneRe = /^(?:1[+-]?)?\(?(\d{3})[)-]?(\d{3})-?(\d{4})$/;
    const phoneFieldRe = /phone/ig;
    const emailRe = /^[^@]+@[^@]+$/;
    const emailFieldRe = /e\-?mail/ig;

    const frag = document.createDocumentFragment();

    for (const feature of featureSet.features) {
        const row = document.createElement("tr");

        for (const field of featureSet.fields as IField[]) {
            const cell = document.createElement("td");
            const value = feature.attributes[field.name];
            if (value === null) {
                cell.classList.add("null");
                cell.textContent = "null";
            } else if (dateRe.test(field.type) && typeof value === "number") {
                // ArcGIS services return dates as integers.
                // Add a <time> element with the date.
                const theDate = new Date(value);
                const time = document.createElement("time");
                if (isMidnightUtc(theDate)) {
                    time.setAttribute("dateTime", theDate.toISOString());
                    time.textContent = `${theDate.toLocaleDateString()}`;
                } else {
                    time.setAttribute("dateTime", theDate.toISOString());
                    time.textContent = `${theDate.toLocaleString()}`;
                }
                cell.appendChild(time);
            } else if (typeof value === "string" && urlRe.test(value)) {
                const linkUrl = value as string;
                const a = document.createElement("a");
                a.href = value;
                a.target = "externallink";

                const gMapsMatch = value.match(gMapsRe);

                if (gMapsMatch) {
                    a.textContent = gMapsMatch[1].replace(/\+/g, " ");
                } else {
                    const linkMatch = linkUrl.match(/\/([^/]+)$/);
                    const textElement = document.createTextNode(linkMatch ? linkMatch[1] : "link");
                    a.appendChild(textElement);
                }
                cell.appendChild(a);
            } else if (phoneFieldRe.test(field.name) && typeof value === "string") {
                const match = value.match(phoneRe);
                if (match) {
                    const a = document.createElement("a");
                    a.textContent = match[0];
                    a.href = `tel:1+${match[1]}${match[2]}${match[3]}`;
                    a.classList.add("fa", "fa-phone-square");
                    cell.appendChild(a);
                } else {
                    cell.textContent = `${value}`;
                }
            } else if (emailFieldRe.test(field.name) && typeof value === "string" && emailRe.test(value)) {
                const a = document.createElement("a");
                a.textContent = value;
                a.href = `mailto:${value}`;
                cell.appendChild(a);
            } else {
                cell.textContent = `${value}`;
            }
            cell.classList.add(field.type);
            row.appendChild(cell);
        }
        frag.appendChild(row);
    }

    return frag;
}
