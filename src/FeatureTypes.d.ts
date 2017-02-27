export interface Error {
    error: object
}

export interface Feature {
    attributes: object;
}

export interface Field {
    alias?: string;
    name: string;
    type: string;
}

export interface FeatureSet {
    displayFieldName?: string;
    features: Feature[];
    fields: Field[];
}