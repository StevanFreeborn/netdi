import { describe, expect, it } from 'vitest';
import { injectable, ServiceProvider } from '../src';
import { createServiceIdentifier, ServiceLifetime } from '../src/types';
import { randomUUID } from 'crypto';
import { inject } from '../src';

describe('ServiceProvider', () => {
  it('should throw an error when service is not registered', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(new Map());

    expect(() => {
      serviceProvider.getService(serviceIdentifier);
    }).toThrowError();
  });

  it('should resolve singleton service', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'singleton',
          },
        ],
      ]),
    );

    const service1 = serviceProvider.getService(serviceIdentifier);
    const service2 = serviceProvider.getService(serviceIdentifier);

    expect(service1).toBe(service2);
  });

  it('should resolve singleton service using factory', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'singleton',
            factory: () => new Object(),
          },
        ],
      ]),
    );

    const service1 = serviceProvider.getService(serviceIdentifier);
    const service2 = serviceProvider.getService(serviceIdentifier);

    expect(service1).toBe(service2);
  });

  it('should resolve scoped service', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const scope1 = serviceProvider.createScope();
    const scope2 = serviceProvider.createScope();

    const service1 = scope1.serviceProvider.getService(serviceIdentifier);
    const service2 = scope2.serviceProvider.getService(serviceIdentifier);

    expect(service1).not.toBe(service2);
  });

  it('should resolve scoped service using factory', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'scoped',
            factory: () => new Object(),
          },
        ],
      ]),
    );

    const scope1 = serviceProvider.createScope();
    const scope2 = serviceProvider.createScope();

    const service1 = scope1.serviceProvider.getService(serviceIdentifier);
    const service2 = scope2.serviceProvider.getService(serviceIdentifier);

    expect(service1).not.toBe(service2);
  });

  it('should resolve transient service', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'transient',
          },
        ],
      ]),
    );

    const service1 = serviceProvider.getService(serviceIdentifier);
    const service2 = serviceProvider.getService(serviceIdentifier);

    expect(service1).not.toBe(service2);
  });

  it('should resolve transient service using factory', () => {
    type IService = object;
    const serviceIdentifier = createServiceIdentifier<IService>();
    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'transient',
            factory: () => new Object(),
          },
        ],
      ]),
    );

    const service1 = serviceProvider.getService(serviceIdentifier);
    const service2 = serviceProvider.getService(serviceIdentifier);

    expect(service1).not.toBe(service2);
  });

  it('should resolve same singleton instance across scopes', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'singleton',
          },
        ],
      ]),
    );

    const scope1 = serviceProvider.createScope();
    const scope2 = serviceProvider.createScope();

    const service1 = scope1.serviceProvider.getService(serviceIdentifier);
    const service2 = scope2.serviceProvider.getService(serviceIdentifier);

    expect(service1.id).toBe(service2.id);
  });

  it('should resolve solve injected dependencies', () => {
    interface IUserRepository {
      getUser(): string;
    }

    @injectable()
    class UserRepository implements IUserRepository {
      getUser(): string {
        return 'John Doe';
      }
    }

    const userRepositoryIdentifier = createServiceIdentifier<IUserRepository>();

    interface IUserService {
      getUser(): string;
    }

    class UserService implements IUserService {
      private userRepository: IUserRepository;

      constructor(@inject(userRepositoryIdentifier) userRepository: IUserRepository) {
        this.userRepository = userRepository;
      }

      getUser(): string {
        return this.userRepository.getUser();
      }
    }

    const userServiceIdentifier = createServiceIdentifier<IUserService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          userRepositoryIdentifier,
          {
            serviceType: userRepositoryIdentifier,
            implementationType: UserRepository,
            lifetime: 'singleton',
          },
        ],
        [
          userServiceIdentifier,
          {
            serviceType: userServiceIdentifier,
            implementationType: UserService,
            lifetime: 'singleton',
          },
        ],
      ]),
    );

    const userService = serviceProvider.getService(userServiceIdentifier);

    const user = userService.getUser();

    expect(user).toBe('John Doe');
  });

  it('should throw an error when service has invalid lifetime', () => {
    type IService = object;

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Object,
            lifetime: 'invalid' as ServiceLifetime,
          },
        ],
      ]),
    );

    expect(() => {
      serviceProvider.getService(serviceIdentifier);
    }).toThrowError();
  });

  it('should resolve same scoped instance in the same scope', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const scope = serviceProvider.createScope();

    const service1 = scope.serviceProvider.getService(serviceIdentifier);
    const service2 = scope.serviceProvider.getService(serviceIdentifier);

    expect(service1).toBe(service2);
  });

  it('should clear the scoped instances on dispose from provider', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const initialService = serviceProvider.getService(serviceIdentifier);

    serviceProvider.dispose();

    const newService = serviceProvider.getService(serviceIdentifier);

    expect(initialService).not.toBe(newService);
  });

  it('should clear the scoped instances on dispose from a scope', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const scope = serviceProvider.createScope();

    const initialService = scope.serviceProvider.getService(serviceIdentifier);

    scope.dispose();

    const newService = scope.serviceProvider.getService(serviceIdentifier);

    expect(initialService).not.toBe(newService);
  });

  it('should not clear the scoped instances on dispose from a scope when the provider is disposed', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const scope = serviceProvider.createScope();

    const initialService = scope.serviceProvider.getService(serviceIdentifier);

    serviceProvider.dispose();

    const newService = scope.serviceProvider.getService(serviceIdentifier);

    expect(initialService).toBe(newService);
  });

  it('should not clear the scoped instances on dispose from another scope when one scope is disposed', () => {
    type IService = {
      id: string;
    };

    class Service implements IService {
      id: string;

      constructor() {
        this.id = randomUUID();
      }
    }

    const serviceIdentifier = createServiceIdentifier<IService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          serviceIdentifier,
          {
            serviceType: serviceIdentifier,
            implementationType: Service,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    const scope1 = serviceProvider.createScope();
    const scope2 = serviceProvider.createScope();

    const initialService1 = scope1.serviceProvider.getService(serviceIdentifier);
    const initialService2 = scope2.serviceProvider.getService(serviceIdentifier);

    scope1.dispose();

    const newService1 = scope1.serviceProvider.getService(serviceIdentifier);
    const newService2 = scope2.serviceProvider.getService(serviceIdentifier);

    expect(initialService1).not.toBe(newService1);
    expect(initialService2).toBe(newService2);
  });

  it('should throw error when dependency is not registered', () => {
    interface IUserRepository {
      getUser(): string;
    }

    class UserService {
      private userRepository: IUserRepository;

      constructor(@inject('IUserRepository') userRepository: IUserRepository) {
        this.userRepository = userRepository;
      }

      getUser(): string {
        return this.userRepository.getUser();
      }
    }

    const userServiceIdentifier = createServiceIdentifier<UserService>();

    const serviceProvider = new ServiceProvider(
      new Map([
        [
          userServiceIdentifier,
          {
            serviceType: userServiceIdentifier,
            implementationType: UserService,
            lifetime: 'scoped',
          },
        ],
      ]),
    );

    expect(() => {
      serviceProvider.getService(userServiceIdentifier);
    }).toThrowError();
  });
});
