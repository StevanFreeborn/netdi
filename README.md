# netdi

A dependency injection container for [TypeScript](https://www.typescriptlang.org/) projects that is inspired by the [.NET](https://dotnet.microsoft.com/en-us/) DI container. It is designed to be simple, lightweight, and easy to use.

[![pull_request](https://github.com/StevanFreeborn/netdi/actions/workflows/pull_request.yaml/badge.svg)](https://github.com/StevanFreeborn/netdi/actions/workflows/pull_request.yaml)
[![codecov](https://codecov.io/gh/StevanFreeborn/netdi/graph/badge.svg?token=nJqAIPyWYh)](https://codecov.io/gh/StevanFreeborn/netdi)
[![publish](https://github.com/StevanFreeborn/netdi/actions/workflows/publish.yaml/badge.svg)](https://github.com/StevanFreeborn/netdi/actions/workflows/publish.yaml)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![NPM License](https://img.shields.io/npm/l/%40stevanfreeborn%2Fnetdi)
![NPM Version](https://img.shields.io/npm/v/%40stevanfreeborn%2Fnetdi)
![NPM Downloads](https://img.shields.io/npm/dt/%40stevanfreeborn%2Fnetdi)

## Features

- ✅ .NET-style service registration with different lifetimes (singleton, scoped, transient)
- ✅ Constructor injection with decorators
- ✅ Type-safe dependency resolution
- ✅ Factory method support for complex instantiation scenarios
- ✅ Scoped service lifetimes for per-request contexts

## Installation

```bash
# npm
npm install @stevanfreeborn/netdi

# yarn
yarn add @stevanfreeborn/netdi

# pnpm
pnpm add @stevanfreeborn/netdi
```

## Requirements

- Node.js >= 18.0.0
- TypeScript with decorators and reflection metadata enabled

Add the following to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Basic Usage

Here's a simple example of how to use netdi:

```typescript
import { 
  ServiceCollection, 
  createServiceIdentifier, 
  injectable, 
  inject 
} from '@stevanfreeborn/netdi';

// Define interfaces
interface IGreeter {
  greet(name: string): string;
}

interface IGreetingService {
  createGreeting(name: string): string;
}

// Create service identifiers
const greeterIdentifier = createServiceIdentifier<IGreeter>();
const greetingServiceIdentifier = createServiceIdentifier<IGreetingService>();

// Implement services
@injectable()
class GreetingService implements IGreetingService {
  createGreeting(name: string): string {
    return `Hello, ${name}!`;
  }
}

@injectable()
class Greeter implements IGreeter {
  constructor(
    @inject(greetingServiceIdentifier) private greetingService: IGreetingService
  ) {}

  greet(name: string): string {
    return this.greetingService.createGreeting(name);
  }
}

// Set up dependency injection
const services = new ServiceCollection();

// Register services
services.addSingleton(greetingServiceIdentifier, GreetingService);
services.addScoped(greeterIdentifier, Greeter);

// Build service provider
const serviceProvider = services.build();

// Resolve and use a service
const greeter = serviceProvider.getService(greeterIdentifier);
console.log(greeter.greet('World')); // Outputs: Hello, World!
```

## Service Lifetimes

netdi supports three service lifetimes:

### Singleton

Singleton services are created once and shared by all consumers.

```typescript
services.addSingleton(serviceIdentifier, Implementation);
```

### Scoped

Scoped services are created once per scope. This is useful for services that should be shared within a request but not across requests.

```typescript
services.addScoped(serviceIdentifier, Implementation);

// Create a scope
const scope = serviceProvider.createScope();
const scopedService = scope.serviceProvider.getService(serviceIdentifier);

// When done with the scope
scope.dispose();
```

### Transient

Transient services are created each time they are requested.

```typescript
services.addTransient(serviceIdentifier, Implementation);
```

## Factory Registration

For complex service instantiation, you can use factory methods:

```typescript
services.addSingleton(serviceIdentifier, (provider) => {
  // Use the provider to get dependencies
  const dependency = provider.getService(dependencyIdentifier);
  
  // Create and configure your service instance
  const instance = new MyService(dependency);
  instance.configure();
  
  return instance;
});
```

## Creating Service Identifiers

Service identifiers help maintain type safety and prevent service conflicts:

```typescript
// Create an identifier for a specific interface
const userServiceIdentifier = createServiceIdentifier<IUserService>();

// Then use it for registration and resolution
services.addSingleton(userServiceIdentifier, UserService);
const userService = serviceProvider.getService(userServiceIdentifier);
```

## Decorators

### @injectable()

Marks a class as injectable, allowing the container to create instances with dependencies:

```typescript
@injectable()
class MyService {
  constructor() {}
}
```

### @inject()

Specifies a dependency for a parameter:

```typescript
class MyService {
  constructor(
    @inject(loggerIdentifier) private logger: ILogger,
    @inject(configIdentifier) private config: IConfig
  ) {}
}
```

## Advanced Topics

### Service Disposal

Both service providers and scopes implement a `dispose()` method:

```typescript
// Dispose the root provider
serviceProvider.dispose();

// Dispose a scope
const scope = serviceProvider.createScope();
// ... use scope
scope.dispose();
```

### Type Safety

netdi is designed to be fully type-safe. The `getService()` method returns the exact type associated with the service identifier:

```typescript
// TypeScript knows this is an IUserService
const userService = serviceProvider.getService(userServiceIdentifier);
```

## License

MIT © [Stevan Freeborn](https://github.com/StevanFreeborn)
