import type { ServiceIdentifier } from './types.js';

export const DI_PARAM_TYPES = 'di:paramtypes';
export const DI_INJECTABLE = 'di:injectable';

export function inject<T>(serviceType: ServiceIdentifier<T>): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  return (target: Object, _: string | symbol | undefined, parameterIndex: number) => {
    Reflect.defineMetadata(DI_PARAM_TYPES, serviceType, target, parameterIndex.toString());
  };
}

export function injectable(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata(DI_INJECTABLE, true, target);
  };
}
