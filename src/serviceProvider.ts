import type {
  IServiceProvider,
  IServiceScope,
  ServiceDescriptor,
  ServiceIdentifier,
  Constructor,
} from './types.js';

export class ServiceScope implements IServiceScope {
  public readonly serviceProvider: IServiceProvider;

  constructor(serviceProvider: IServiceProvider) {
    this.serviceProvider = serviceProvider;
  }

  dispose(): void {
    this.serviceProvider.dispose();
  }
}

export class ServiceProvider implements IServiceProvider {
  private descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>>;
  private singletonInstances: Map<ServiceIdentifier<unknown>, unknown> = new Map();
  private scopedInstances: Map<ServiceIdentifier<unknown>, unknown> = new Map();

  constructor(
    descriptors: Map<ServiceIdentifier<unknown>, ServiceDescriptor<unknown>>,
    parent?: ServiceProvider,
  ) {
    this.descriptors = descriptors;

    if (parent) {
      parent.singletonInstances.forEach((value, key) => {
        this.singletonInstances.set(key, value);
      });
    }

    for (const descriptor of descriptors.values()) {
      if (descriptor.lifetime === 'singleton') {
        this.resolveService(descriptor);
      }
    }
  }

  getService<T>(serviceType: ServiceIdentifier<T>): T {
    const descriptor = this.descriptors.get(serviceType);
    
    if (!descriptor) {
      throw new Error(`Service of type ${serviceType.toString()} is not registered.`);
    }

    return this.resolveService(descriptor as ServiceDescriptor<T>);
  }

  createScope(): IServiceScope {
    const scopedProvider = new ServiceProvider(this.descriptors, this);
    return new ServiceScope(scopedProvider);
  }

  dispose(): void {
    this.scopedInstances.clear();
  }

  private resolveService<T>(descriptor: ServiceDescriptor<T>): T {
    const { serviceType, implementationType, lifetime, factory } = descriptor;

    switch (lifetime) {
      case 'singleton': {
        if (this.singletonInstances.has(serviceType)) {
          return this.singletonInstances.get(serviceType) as T;
        }
        const singletonInstance = factory ? factory(this) : this.createInstance(implementationType);
        this.singletonInstances.set(serviceType, singletonInstance);
        return singletonInstance;
      }
      case 'scoped': {
        if (this.scopedInstances.has(serviceType)) {
          return this.scopedInstances.get(serviceType) as T;
        }
        const scopedInstance = factory ? factory(this) : this.createInstance(implementationType);
        this.scopedInstances.set(serviceType, scopedInstance);
        return scopedInstance;
      }
      case 'transient':
        return factory ? factory(this) : this.createInstance(implementationType);
      default:
        throw new Error(`Unknown service lifetime: ${lifetime}`);
    }
  }

  private createInstance<T>(ctor: Constructor<T>): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ctor) ?? [];

    const params = paramTypes.map((_: unknown, index: number) => {
      const serviceType = Reflect.getMetadata(
        'di:paramtypes',
        ctor,
        index.toString(),
      ) as ServiceIdentifier<unknown>;

      return this.getService(serviceType);
    });

    return new ctor(...params);
  }
}
