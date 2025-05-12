import type { ServiceIdentifier } from './types.js';

export function inject<T>(serviceType: ServiceIdentifier<T>): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  return (target: Object, _: string | symbol | undefined, parameterIndex: number) => {
    Reflect.defineMetadata('di:paramtypes', serviceType, target, parameterIndex.toString());
  };
}

export function injectable(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata('di:injectable', true, target);
  };
}
