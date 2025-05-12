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

export class ServiceCollection implements IServiceCollection {
  private readonly _descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>> =
    new Map();

  public addSingleton<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'singleton');
  }

  public addScoped<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'scoped');
  }

  public addTransient<T>(
    serviceType: ServiceIdentifier<T>,
    implementationOrFactory: ServiceFactory<T> | Constructor<T>,
  ): IServiceCollection {
    return this.add(serviceType, implementationOrFactory, 'transient');
  }

  public build(): IServiceProvider {
    return new ServiceProvider(this._descriptors);
  }

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

  private isConstructor(func: unknown): func is Constructor<unknown> {
    return typeof func === 'function' &&
      !!func.prototype &&
      func.prototype.constructor === func;
  }
}
