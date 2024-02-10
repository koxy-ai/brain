import Types from "../../types/types.ts";

export default function dynamicType(
  key: string,
  value: unknown,
  type: Types,
): unknown {
  // number type
  if (type === "number") {
    if (typeof value === "string" && value.includes("$")) {
      return value;
    }
    if (typeof value === "object") {
      if (value === null) {
        return null;
      }
      if (Array.isArray(value) && value.length === 1 && Number(value[0])) {
        return value[0];
      }
      if (
        Object.keys(value).length === 1 &&
        Number((value as any)[Object.keys(value)[0]])
      ) {
        return Number((value as any)[Object.keys(value)[0]]);
      }
    }
    return Number(value);
  }

  // string type
  if (type === "string") {
    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  // boolean type
  if (type === "boolean") {
    return Boolean(value);
  }

  // object type
  if (type === "object") {
    if (typeof value === "object") {
      return value;
    }
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_err: unknown) {
        return { [key]: value };
      }
    }
    return { [key]: value };
  }

  // array type
  if (type === "array") {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (_err: unknown) {
        if (value.includes("{,}")) {
          return value.split("{,}");
        }
        if (value.includes(",")) {
          return value.split(",");
        }
        if (value.includes(" ")) {
          return value.split(" ");
        }
        return [value];
      }
    }
    if (typeof value === "object") {
      return value;
    }
    return [value];
  }

  return value;
}
