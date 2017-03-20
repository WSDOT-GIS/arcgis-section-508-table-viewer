import { IFeatureSet, IField, ILayer } from "arcgis-rest-api-ts-d";
import { matchRegExps } from "./reUtils";

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
    let table = document.createElement("table");
    let caption = document.createElement("caption");
    caption.textContent = layer.name;
    table.appendChild(caption);

    let thead = document.createElement("thead");
    let row = document.createElement("tr");
    for (let field of (fields || layer.fields)) {
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
 * Creates a <span> with classes defining a font awesome icon.
 * @param url A URL
 */
function getFontAwesomeFileIcon(url: string) {
    const pdfRe = /\.pdf$/i;
    const excelRe = /\.xlsx?$/i;
    const archiveRe = /\.((zip)|(7z)|(rar)|(tar)|(gz))/i;
    const videoRe = /\.((wmv)|(avi)|(mp4)|(m4v)|(mkv))$/i;
    const imageRe = /\.((jpe?g)|(png)|(bmp)|(tga)|(gif)|(tiff?))$/i;
    const audioRe = /\.((wav)|(mp3)|(ogg))$/i;
    const textRe = /\.((te?xt))$/i;
    const otherRe = /[^.]+\.\w+$/i;

    let [
        pdf,
        excel,
        archive,
        video,
        image,
        audio,
        text,
        other] = matchRegExps(url, true,
            pdfRe,
            excelRe,
            archiveRe,
            videoRe,
            imageRe,
            audioRe,
            textRe,
            otherRe);
    let typeName: string | null;

    if (pdf) {
        typeName = "file-pdf-o";
    } else if (excel) {
        typeName = "file-excel-o";
    } else if (archive) {
        typeName = "file-archive-o";
    } else if (video) {
        typeName = "file-video-o";
    } else if (image) {
        typeName = "file-image-o";
    } else if (audio) {
        typeName = "file-audio-o";
    } else if (text) {
        typeName = "file-text-o";
    } else if (other) {
        typeName = "file";
    } else {
        typeName = "external-link";
    }

    let span = document.createElement("span");
    span.classList.add("fa", `fa-${typeName}`);
    span.setAttribute("aria-hidden", "true");
    return span;
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

    let frag = document.createDocumentFragment();

    for (let feature of featureSet.features) {
        let row = document.createElement("tr");

        for (let field of featureSet.fields as IField[]) {
            let cell = document.createElement("td");
            let value = feature.attributes[field.name];
            if (value === null) {
                cell.classList.add("null");
                cell.title = "null";
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
            } else if (typeof value === "string" && urlRe.test(value)) {
                let linkUrl = value as string;
                let a = document.createElement("a");
                a.href = value;
                a.target = "externallink";

                let gMapsMatch = value.match(gMapsRe);

                if (gMapsMatch) {
                    a.textContent = gMapsMatch[1].replace(/\+/g, " ");
                } else {
                    let icon = getFontAwesomeFileIcon(linkUrl);
                    a.title = "link";
                    a.appendChild(icon);
                }
                cell.appendChild(a);
            } else if (phoneFieldRe.test(field.name) && typeof value === "string") {
                let match = value.match(phoneRe);
                if (match) {
                    let a = document.createElement("a");
                    a.textContent = match[0];
                    a.href = `tel:1+${match[1]}${match[2]}${match[3]}`;
                    a.classList.add("fa", "fa-phone-square");
                    cell.appendChild(a);
                } else {
                    cell.textContent = `${value}`;
                }
            } else if (emailFieldRe.test(field.name) && typeof value === "string" && emailRe.test(value)) {
                let a = document.createElement("a");
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
