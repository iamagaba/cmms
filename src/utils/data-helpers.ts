const transformKeys = (obj: any, transform: (key: string) => string): any => {
  if (Array.isArray(obj)) {
    return obj.map(v => transformKeys(v, transform));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const newKey = transform(key);
      acc[newKey] = transformKeys(obj[key], transform);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
};

export const camelToSnakeCase = (obj: any): any => {
  return transformKeys(obj, (key) => key.replace(/([A-Z])/g, "_$1").toLowerCase());
};

export const snakeToCamelCase = (obj: any): any => {
  return transformKeys(obj, (key) => key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()));
};