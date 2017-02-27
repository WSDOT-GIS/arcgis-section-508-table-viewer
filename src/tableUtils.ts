import { Error as ErrorResponse, FeatureSet } from "./FeatureTypes";

export function getData(layerUrl: URL): Promise<FeatureSet> {
    const params = {
        f: "json",
        outFields: "*",
        returnGeometry: "false",
        where: encodeURIComponent("1=1"),
    };
    let search: string[] = [];
    // tslint:disable-next-line:forin
    for (let key in params) {
        search.push(`${key}=${params[key]}`);
    }
    let queryString = search.join("&");
    let url = new URL(`query?${queryString}`, layerUrl.toString());

    // let sp = new URLSearchParams();
    // sp.append("where", "1=1");
    // sp.append("outFields", "*");
    // sp.append("returnGeometry", false.toString());
    // sp.append("f", "json");

    // let url = new URL(`query?${sp.toString()}`, layerUrl.toString());

    return fetch(url.toString()).then((response) => {
        return response.json() as Promise<FeatureSet | ErrorResponse>;
    }).then((jsonResponse) => {
        let err = jsonResponse as ErrorResponse;
        if (err.error) {
            throw err.error;
        }
        return jsonResponse as FeatureSet;
    }, (reason) => {
        throw reason;
    });
}

export function createTableFromData(featureSet: FeatureSet) {
    let frag = document.createDocumentFragment();
    let table = document.createElement("table");
    frag.appendChild(table);

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

    for (let feature of featureSet.features) {
        row = document.createElement("tr");

        for (let field of featureSet.fields) {
            let cell = document.createElement("td");
            let value = feature.attributes[field.name];
            cell.textContent = `${value}`;
            cell.classList.add(field.type);
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    return frag;
}

export default function (layerUrl: URL) {
    let dataPromise = getData(layerUrl);
    return dataPromise.then((featureSet) => {
        return createTableFromData(featureSet);
    });
}
