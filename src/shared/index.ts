export * from './toDisplayString';

export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === 'object';
};

export const isString = (value) => {
  return typeof value === 'string';
};

export function hasChanged(val, newVal) {
  return !Object.is(val, newVal);
}

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
//add-foo => addFoo
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_: any, c: string) => {
    return c ? c.toUpperCase() : '';
  });
};
export const toHandlerKey = (str: string) => {
  return str ? 'on' + capitalize(str) : '';
};
