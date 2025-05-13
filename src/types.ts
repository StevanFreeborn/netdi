/**
 * Represents the possible lifetimes for registered services
 *
 * - singleton: Created once and shared by all consumers
 * - scoped: Created once per scope
 * - transient: Created each time they are requested
 */
export type ServiceLifetime = 'singleton' | 'scoped' | 'transient';

/**
 * Represents a constructor function for a class
 *
 * @template T - The type of object the constructor creates
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

/**
 * A unique identifier for a service type
 *
 * @template T - The type of the service
 */
export type ServiceIdentifier<T = unknown> = symbol & { __brand: T };

/**
 * A factory function that creates a service instance
 *
 * @template T - The type of the service to create
 */
export type ServiceFactory<T> = (provider: IServiceProvider) => T;

/**
 * Descriptor for a registered service
 *
 * @template T - The type of the service
 */
export type ServiceDescriptor<T = unknown> = {
  /**
   * The service identifier
   */
  serviceType: ServiceIdentifier<T>;

  /**
   * The implementation class constructor
   */
  implementationType: Constructor<T>;

  /**
   * The service lifetime
   */
  lifetime: ServiceLifetime;

  /**
   * Optional factory function to create the service instance
   */
  factory?: ServiceFactory<T>;
};

/**
 * Creates a typed service identifier
 *
 * @template T - The type of the service
 * @returns A unique identifier for the service type
 *
 * @example
 * ```typescript
 * interface IUserService {
 *   getUserById(id: string): Promise<User>;
 * }
 *
 * const userServiceIdentifier = createServiceIdentifier<IUserService>();
 * ```
 */
export function createServiceIdentifier<T>(): ServiceIdentifier<T> {
  return Symbol() as ServiceIdentifier<T>;
}

/**
 * Interface for a collection of service descriptors that can be used to build a service provider
 */
export interface IServiceCollection {
  /**
   * Registers a singleton service with the collection
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param implementationType - The implementation class
   * @returns The service collection for method chaining
   */
  addSingleton<T>(
    serviceType: ServiceIdentifier<T>,
    implementationType: Constructor<T>,
  ): IServiceCollection;

  /**
   * Registers a singleton service with a factory function
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param factory - A factory function that creates the service instance
   * @returns The service collection for method chaining
   */
  addSingleton<T>(
    serviceType: ServiceIdentifier<T>,
    factory: ServiceFactory<T>,
  ): IServiceCollection;

  /**
   * Registers a scoped service with the collection
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param implementationType - The implementation class
   * @returns The service collection for method chaining
   */
  addScoped<T>(
    serviceType: ServiceIdentifier<T>,
    implementationType: Constructor<T>,
  ): IServiceCollection;

  /**
   * Registers a scoped service with a factory function
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param factory - A factory function that creates the service instance
   * @returns The service collection for method chaining
   */
  addScoped<T>(serviceType: ServiceIdentifier<T>, factory: ServiceFactory<T>): IServiceCollection;

  /**
   * Registers a transient service with the collection
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param implementationType - The implementation class
   * @returns The service collection for method chaining
   */
  addTransient<T>(
    serviceType: ServiceIdentifier<T>,
    implementationType: Constructor<T>,
  ): IServiceCollection;

  /**
   * Registers a transient service with a factory function
   *
   * @template T - The type of the service
   * @param serviceType - The service identifier
   * @param factory - A factory function that creates the service instance
   * @returns The service collection for method chaining
   */
  addTransient<T>(
    serviceType: ServiceIdentifier<T>,
    factory: ServiceFactory<T>,
  ): IServiceCollection;

  /**
   * Builds a service provider from the registered services
   *
   * @returns A new service provider instance
   */
  build(): IServiceProvider;
}

/**
 * Interface for a provider that can resolve services by their service identifier
 */
export interface IServiceProvider {
  /**
   * Gets a service instance by its service identifier
   *
   * @template T - The type of the service to resolve
   * @param serviceType - The service identifier
   * @returns The resolved service instance
   */
  getService<T>(serviceType: ServiceIdentifier<T>): T;

  /**
   * Creates a new scope for scoped services
   *
   * @returns A new service scope
   */
  createScope(): IServiceScope;

  /**
   * Disposes the service provider and clears any scoped service instances
   */
  dispose(): void;
}

/**
 * Interface for a scope that provides access to scoped services
 */
export interface IServiceScope {
  /**
   * The service provider for this scope
   */
  serviceProvider: IServiceProvider;

  /**
   * Disposes the scope and clears any scoped service instances
   */
  dispose(): void;
}
