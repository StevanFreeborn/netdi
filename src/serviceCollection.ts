import { ServiceProvider } from './serviceProvider.js';
import type {
  Constructor,
  IServiceCollection,
  IServiceProvider,
  ServiceDescriptor,
  ServiceFactory,
  ServiceIdentifier,
  ServiceLifetime,
} from './types.js';

/**
 * A collection of service descriptors that can be used to build a service provider.
 * 
 * This class is used to register services with different lifetimes and build a service provider
 * that can resolve those services at runtime.
 * 
 * @implements {IServiceCollection}
 */
export class ServiceCollection implements IServiceCollection {
  /**
   * Internal map of service descriptors, keyed by service identifiers
   */
  private readonly _descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>> =
    new Map();

  /**
   * Registers a singleton service with the collection.
   * 
   * Singleton services are created once and shared by all consumers.
   * 
   * @template T - The type of the service to register
   * @param serviceType - The service identifier
   * @param implementationOrFactory - The implementation class or factory function
   * @returns The service collection instance for method chaining
   * 
   * @example
   * ```typescript
   * services.addSingleton(userServiceIdentifier, UserService);
   * // or with a factory:
   * services.addSingleton(userServiceIdentifier, (provider) => new UserService(provider.getService(loggerIdentifier)));
   * ```
   */
  public addSingleton<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'singleton');
  }

  /**
   * Registers a scoped service with the collection.
   * 
   * Scoped services are created once per scope. This is useful for services that should be
   * shared within a request but not across requests.
   * 
   * @template T - The type of the service to register
   * @param serviceType - The service identifier
   * @param implementationOrFactory - The implementation class or factory function
   * @returns The service collection instance for method chaining
   * 
   * @example
   * ```typescript
   * services.addScoped(userServiceIdentifier, UserService);
   * // or with a factory:
   * services.addScoped(userServiceIdentifier, (provider) => new UserService(provider.getService(loggerIdentifier)));
   * ```
   */
  public addScoped<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'scoped');
  }

  /**
   * Registers a transient service with the collection.
   * 
   * Transient services are created each time they are requested.
   * 
   * @template T - The type of the service to register
   * @param serviceType - The service identifier
   * @param implementationOrFactory - The implementation class or factory function
   * @returns The service collection instance for method chaining
   * 
   * @example
   * ```typescript
   * services.addTransient(userServiceIdentifier, UserService);
   * // or with a factory:
   * services.addTransient(userServiceIdentifier, (provider) => new UserService(provider.getService(loggerIdentifier)));
   * ```
   */
  public addTransient<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'transient');
  }

  /**
   * Builds a service provider from the registered services.
   * 
   * @returns A new service provider that can resolve the registered services
   */
  public build(): IServiceProvider {
    return new ServiceProvider(this._descriptors);
  }

  /**
   * Internal method to add a service descriptor to the collection.
   * 
   * @template T - The type of the service to register
   * @param serviceType - The service identifier
   * @param implementationOrFactory - The implementation class or factory function
   * @param lifetime - The service lifetime
   * @returns The service collection instance for method chaining
   */
  private add<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
    lifetime: ServiceLifetime,
  ): IServiceCollection {
    if (typeof implementationOrFactory === 'function' && this.isConstructor(implementationOrFactory) === false) {
      const descriptor: ServiceDescriptor<T> = {
        serviceType,
        implementationType: Object as unknown as Constructor<T>,
        lifetime,
        factory: implementationOrFactory as ServiceFactory<T>,
      };

      this._descriptors.set(serviceType, descriptor);
    } else {
      const descriptor: ServiceDescriptor<T> = {
        serviceType,
        implementationType: implementationOrFactory as Constructor<T>,
        lifetime,
      };

      this._descriptors.set(serviceType, descriptor);
    }

    return this;
  }

  /**
   * Checks if a function is a constructor
   * 
   * @param func - The function to check
   * @returns True if the function is a constructor, false otherwise
   */
  private isConstructor(func: unknown): func is Constructor<unknown> {
    return typeof func === 'function' &&
      !!func.prototype &&
      func.prototype.constructor === func;
  }
}
