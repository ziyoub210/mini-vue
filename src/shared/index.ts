export const extend = Object.assign;
export const hasChanged = (n: any, v: any) => !!Object.is(n, v);
export const isObject = (val: any) => {
  return val !== null && typeof val === 'object';
};
