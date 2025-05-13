import type { ServiceIdentifier } from './types.js';

/**
 * Metadata key for storing parameter type information for dependency injection
 * @internal
 */
export const DI_PARAM_TYPES = 'di:paramtypes';

/**
 * Metadata key for marking classes as injectable
 * @internal
 */
export const DI_INJECTABLE = 'di:injectable';

/**
 * Decorator for constructor parameters that specifies which service identifier to use for injection
 *
 * @template T - The type of the service to be injected
 * @param serviceType - The service identifier for the dependency to inject
 * @returns A parameter decorator function that associates the parameter with the service identifier
 *
 * @example
 * ```typescript
 * class MyService {
 *   constructor(
 *     @inject(loggerIdentifier) private logger: ILogger
 *   ) {}
 * }
 * ```
 */
export function inject<T>(serviceType: ServiceIdentifier<T>): ParameterDecorator {
  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  return (target: Object, _: string | symbol | undefined, parameterIndex: number) => {
    Reflect.defineMetadata(DI_PARAM_TYPES, serviceType, target, parameterIndex.toString());
  };
}

/**
 * Decorator that marks a class as injectable, allowing the container to create instances with dependencies
 *
 * @returns A class decorator function that marks the class as injectable
 *
 * @example
 * ```typescript
 * @injectable()
 * class MyService {
 *   constructor() {}
 * }
 * ```
 */
export function injectable(): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (target: Function) => {
    Reflect.defineMetadata(DI_INJECTABLE, true, target);
  };
}
