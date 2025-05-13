import { DI_PARAM_TYPES } from './decorators.js';
import type {
  IServiceProvider,
  IServiceScope,
  ServiceDescriptor,
  ServiceIdentifier,
  Constructor,
} from './types.js';

/**
 * Represents a scope for scoped services.
 *
 * A service scope provides access to scoped services that are created once per scope.
 *
 * @implements {IServiceScope}
 */
export class ServiceScope implements IServiceScope {
  /**
   * The service provider associated with this scope
   */
  public readonly serviceProvider: IServiceProvider;

  /**
   * Creates a new service scope
   *
   * @param serviceProvider - The service provider for this scope
   */
  constructor(serviceProvider: IServiceProvider) {
    this.serviceProvider = serviceProvider;
  }

  /**
   * Disposes the scope and clears any scoped service instances
   */
  dispose(): void {
    this.serviceProvider.dispose();
  }
}

/**
 * A provider that can resolve registered services by their service identifier.
 *
 * The service provider is responsible for creating and managing service instances
 * according to their registered lifetime.
 *
 * @implements {IServiceProvider}
 */
export class ServiceProvider implements IServiceProvider {
  /**
   * Map of service descriptors by service identifier
   */
  private readonly _descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>>;

  /**
   * Map of singleton service instances by service identifier
   */
  private readonly _singletonInstances: Map<ServiceIdentifier<unknown>, unknown> = new Map();

  /**
   * Map of scoped service instances by service identifier
   */
  private readonly _scopedInstances: Map<ServiceIdentifier<unknown>, unknown> = new Map();

  /**
   * Creates a new service provider
   *
   * @param descriptors - Map of service descriptors
   * @param parent - Optional parent service provider to inherit singleton instances from
   */
  constructor(
    descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>>,
    parent?: ServiceProvider,
  ) {
    this._descriptors = descriptors;

    if (parent) {
      parent._singletonInstances.forEach((value, key) => {
        this._singletonInstances.set(key, value);
      });
    }

    // Pre-resolve singleton services
    for (const descriptor of descriptors.values()) {
      if (descriptor.lifetime === 'singleton') {
        this.resolveService(descriptor);
      }
    }
  }

  /**
   * Gets a service instance by its service identifier
   *
   * @template T - The type of the service to resolve
   * @param serviceType - The service identifier of the service to resolve
   * @returns The resolved service instance
   * @throws Error if the service is not registered
   *
   * @example
   * ```typescript
   * const userService = serviceProvider.getService(userServiceIdentifier);
   * ```
   */
  getService<T>(serviceType: ServiceIdentifier<T>): T {
    const descriptor = this._descriptors.get(serviceType);

    if (!descriptor) {
      throw new Error(`Service of type ${serviceType.toString()} is not registered.`);
    }

    return this.resolveService(descriptor as ServiceDescriptor<T>);
  }

  /**
   * Creates a new scope for scoped services
   *
   * @returns A new service scope
   *
   * @example
   * ```typescript
   * const scope = serviceProvider.createScope();
   * const scopedService = scope.serviceProvider.getService(serviceIdentifier);
   * // ... use scoped service
   * scope.dispose();
   * ```
   */
  createScope(): IServiceScope {
    const scopedProvider = new ServiceProvider(this._descriptors, this);
    return new ServiceScope(scopedProvider);
  }

  /**
   * Disposes the service provider and clears any scoped service instances
   */
  dispose(): void {
    this._scopedInstances.clear();
  }

  /**
   * Resolves a service instance from its descriptor
   *
   * @template T - The type of the service to resolve
   * @param descriptor - The service descriptor
   * @returns The resolved service instance
   * @throws Error if the service lifetime is unknown
   */
  private resolveService<T>(descriptor: ServiceDescriptor<T>): T {
    const { serviceType, implementationType, lifetime, factory } = descriptor;

    switch (lifetime) {
      case 'singleton': {
        if (this._singletonInstances.has(serviceType)) {
          return this._singletonInstances.get(serviceType) as T;
        }
        const singletonInstance = factory ? factory(this) : this.createInstance(implementationType);
        this._singletonInstances.set(serviceType, singletonInstance);
        return singletonInstance;
      }
      case 'scoped': {
        if (this._scopedInstances.has(serviceType)) {
          return this._scopedInstances.get(serviceType) as T;
        }
        const scopedInstance = factory ? factory(this) : this.createInstance(implementationType);
        this._scopedInstances.set(serviceType, scopedInstance);
        return scopedInstance;
      }
      case 'transient':
        return factory ? factory(this) : this.createInstance(implementationType);
      default:
        throw new Error(`Unknown service lifetime: ${lifetime}`);
    }
  }

  /**
   * Creates an instance of a service class and resolves its dependencies
   *
   * @template T - The type of the service to create
   * @param ctor - The constructor of the service class
   * @returns A new instance of the service class with its dependencies resolved
   */
  private createInstance<T>(ctor: Constructor<T>): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) ?? [];

    const params = paramTypes.map((_: unknown, index: number) => {
      const serviceType = Reflect.getMetadata(
        DI_PARAM_TYPES,
        ctor,
        index.toString(),
      ) as ServiceIdentifier<unknown>;

      return this.getService(serviceType);
    });

    return new ctor(...params);
  }
}
