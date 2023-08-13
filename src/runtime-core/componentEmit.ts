import { camelize, toHandlerKey } from '../shared/index';
export function emit(instance, event, ...args) {
  console.log(event, 'event');

  const { props } = instance;

  //TDD
  //先去写一个特定的行为 =》 重构成通用的行为

  const handlerName = toHandlerKey(camelize(event) as any);
  const handler = props[handlerName];
  handler && handler(...args);
}
