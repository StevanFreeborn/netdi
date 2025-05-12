import { describe, expect, it } from 'vitest';
import { createServiceIdentifier, ServiceCollection } from '../src';

describe('ServiceCollection', () => {
  it('should add a singleton service', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addSingleton(serviceIdentifier, TestService);
    
    const provider = collection.build();
    const serviceInstance1 = provider.getService(serviceIdentifier);
    const serviceInstance2 = provider.getService(serviceIdentifier);
    
    expect(serviceInstance1).toBe(serviceInstance2);
  });

  it('should add a scoped service', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addScoped(serviceIdentifier, TestService);
    
    const provider = collection.build();
    const scope1 = provider.createScope();
    const scope2 = provider.createScope();
    
    const serviceInstance1 = scope1.serviceProvider.getService(serviceIdentifier);
    const serviceInstance2 = scope2.serviceProvider.getService(serviceIdentifier);
    
    expect(serviceInstance1).not.toBe(serviceInstance2);
  });

  it('should add a transient service', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addTransient(serviceIdentifier, TestService);
    
    const provider = collection.build();
    
    const serviceInstance1 = provider.getService(serviceIdentifier);
    const serviceInstance2 = provider.getService(serviceIdentifier);
    
    expect(serviceInstance1).not.toBe(serviceInstance2);
  });

  it('should add a single service with a factory', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addSingleton(serviceIdentifier, () => new TestService());
    
    const provider = collection.build();
    const serviceInstance1 = provider.getService(serviceIdentifier);
    const serviceInstance2 = provider.getService(serviceIdentifier);
    
    expect(serviceInstance1).toBe(serviceInstance2);
  });

  it('should add a scoped service with a factory', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addScoped(serviceIdentifier, () => new TestService());
    
    const provider = collection.build();
    const scope1 = provider.createScope();
    const scope2 = provider.createScope();
    
    const serviceInstance1 = scope1.serviceProvider.getService(serviceIdentifier);
    const serviceInstance2 = scope2.serviceProvider.getService(serviceIdentifier);
    
    expect(serviceInstance1).not.toBe(serviceInstance2);
  });


  it('should add a transient service with a factory', () => {
    class TestService {}
    const serviceIdentifier = createServiceIdentifier();
    
    const collection = new ServiceCollection();
    collection.addTransient(serviceIdentifier, () => new TestService());
    
    const provider = collection.build();
    
    const serviceInstance1 = provider.getService(serviceIdentifier);
    const serviceInstance2 = provider.getService(serviceIdentifier);
    
    expect(serviceInstance1).not.toBe(serviceInstance2);
  });
});
