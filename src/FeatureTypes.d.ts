/**
 * Field types
 */
export type FieldType = "esriFieldTypeBlob" |
    "esriFieldTypeDate" | "esriFieldTypeDouble" |
    "esriFieldTypeGeometry" | "esriFieldTypeGlobalID" |
    "esriFieldTypeGUID" | "esriFieldTypeInteger" |
    "esriFieldTypeOID" | "esriFieldTypeRaster" |
    "esriFieldTypeSingle" | "esriFieldTypeSmallInteger" |
    "esriFieldTypeString" | "esriFieldTypeXML"

/**
 * An error returned when a query fails with a
 * 200 (OK) return code.
 */
export interface Error {
    error: {
        [name:string]: any
    }
}

/**
 * Represents a feature returned from a feature layer query.
 * @param attributes - The field values.
 */
export interface Feature {
    attributes: {
        [name:string]: string | number | null
    };
}

/**
 * Provides information about fields of the features.
 * @param alias - More descriptive name
 * @param name - Name of the field.
 * @param type - The type of field.
 */
export interface Field {
    alias?: string;
    name: string;
    type: FieldType;
}

/**
 * A collecton of features. This is the type returned
 * by a query operation.
 */
export interface FeatureSet {
    displayFieldName?: string;
    features: Feature[];
    fields: Field[];
}