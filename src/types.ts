export type ServiceLifetime = 'singleton' | 'scoped' | 'transient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T> = new (...args: any[]) => T;

export type ServiceIdentifier<T = unknown> = symbol & { __brand: T };

export type ServiceFactory<T> = (provider: IServiceProvider) => T;

export type ServiceDescriptor<T = unknown> = {
  serviceType: ServiceIdentifier<T>;
  implementationType: Constructor<T>;
  lifetime: ServiceLifetime;
  factory?: ServiceFactory<T>;
};

export function createServiceIdentifier<T>(): ServiceIdentifier<T> {
  return Symbol() as ServiceIdentifier<T>;
}

export interface IServiceCollection {
  addSingleton<T>(serviceType: ServiceIdentifier<T>, implementationType: Constructor<T>): IServiceCollection;
  addSingleton<T>(serviceType: ServiceIdentifier<T>, factory: ServiceFactory<T>): IServiceCollection;
  addScoped<T>(serviceType: ServiceIdentifier<T>, implementationType: Constructor<T>): IServiceCollection;
  addScoped<T>(serviceType: ServiceIdentifier<T>, factory: ServiceFactory<T>): IServiceCollection;
  addTransient<T>(serviceType: ServiceIdentifier<T>, implementationType: Constructor<T>): IServiceCollection;
  addTransient<T>(serviceType: ServiceIdentifier<T>, factory: ServiceFactory<T>): IServiceCollection;
  build(): IServiceProvider;
}

export interface IServiceProvider {
  getService<T>(serviceType: ServiceIdentifier<T>): T;
  createScope(): IServiceScope;
  dispose(): void;
}

export interface IServiceScope {
  serviceProvider: IServiceProvider;
  dispose(): void;
}
