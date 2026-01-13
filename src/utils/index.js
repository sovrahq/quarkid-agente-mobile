import { decode } from "js-base64";
import jsonpath from "jsonpath";
import * as jsonschema from "jsonschema";
import * as Localization from "expo-localization";

export const formatTitle = (text) =>
  text
    ?.replace(/(_|-)/g, " ")
    .trim()
    .replace(/\w\S*/g, function (str) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    })
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");

export const getOOB = (url) => {
  try {
    if (url.includes("oob=")) {
      return decode(url?.split("oob=")[1].split("&")[0]);
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const formatDid = (did) => did?.replace(/:/g, ".");

export const validateSchema = (vc, inputDescriptor) => {
  for (const field of inputDescriptor.constraints.fields) {
    const fieldValues = field.path?.map((path) => {
      return jsonpath.value(vc, path);
    });

    for (const value of fieldValues) {
      if (!value) return false;
      if (field.filter) {
        const { errors } = jsonschema.validate(value, field.filter);
        if (errors.length) {
          return false;
        }
      }
    }
  }
  return true;
};

export const formatField = (vc, field) => {
  if (!field) return null;
  if (field.text) {
    return field.text;
  }

  if (field.path) {
    for (const path of field.path) {
      if (!path) continue;

      const value = jsonpath.value(vc, path);

      if (value !== undefined && value !== null) {
        // Convertir el valor según el formato especificado en schema
        if (field.schema?.type === "string") {
          switch (field.schema.format) {
            case "date":
              return new Date(value).toLocaleDateString(
                Localization.locale.slice(0, 2)
              );
            case "date-time":
              return new Date(value).toLocaleString(
                Localization.locale.slice(0, 2)
              );
            case "time":
              return new Date(value).toLocaleTimeString(
                Localization.locale.slice(0, 2)
              );
            case "email":
            case "idn-email":
            case "hostname":
            case "idn-hostname":
            case "ipv4":
            case "ipv6":
            case "uri":
            case "uri-reference":
            case "iri":
            case "iri-reference":
              return String(value);
            default:
              return value.toString();
          }
        } else if (
          field.schema?.type === "number" ||
          field.schema?.type === "integer"
        ) {
          return value.toString();
        } else if (field.schema?.type === "boolean") {
          return value ? "true" : "false";
        } else {
          return String(value);
        }
      }
    }
  }

  return field.fallback || null;
};

export const validateDate = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

export const isImgUrl = (url) => {
  return /\.(jpg|jped|png|webp|gif)$/.test(url);
};
