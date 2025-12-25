// Utility functions for converting between camelCase and snake_case
// This matches the main app's data conversion utilities

const transformKeys = (obj: any, transform: (key: string) => string): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => transformKeys(item, transform));
  
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = transform(key);
    result[newKey] = transformKeys(value, transform);
  }
  return result;
};

export const camelToSnakeCase = (obj: any): any => {
  return transformKeys(obj, (key) => key.replace(/([A-Z])/g, "_$1").toLowerCase());
};

export const snakeToCamelCase = (obj: any): any => {
  return transformKeys(obj, (key) => key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()));
};