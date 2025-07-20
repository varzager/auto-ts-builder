# auto-ts-builder

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/varzager/auto-ts-builder/blob/main/LICENSE) 
[![npm version](https://img.shields.io/npm/v/auto-ts-builder.svg?style=flat)](https://www.npmjs.com/package/auto-ts-builder)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/auto-ts-builder?style=flat-square])](https://travis-ci.org/varzager/auto-ts-builder)
[![downloads](https://img.shields.io/npm/dt/auto-ts-builder.svg?style=flat-square)](http://www.npmtrends.com/auto-ts-builder)

`auto-ts-builder` is a powerful TypeScript utility library for creating fully type-safe builders that follow the builder pattern. It provides an elegant API for constructing complex objects with clear, chainable methods and deep property navigation.

---

## Features
- **Type-safe Builder Pattern**: Create builders with full TypeScript type checking and autocompletion.
- **Intuitive Method Chaining**: Fluent interface with seamless method chaining for a clean API.
- **Deep Object Navigation**: Navigate through nested objects with property access syntax.
- **Smart Naming Conventions**: Automatically adapts to various naming styles (camelCase, PascalCase, etc.).
- **Custom Helper Methods**: Extend builders with custom helper methods for enhanced functionality.
- **Zero Dependencies**: Minimal footprint with only lodash as a dependency.

---

## Installation
Install the library via npm or yarn:

```bash
# Using npm
npm install auto-ts-builder

# Using yarn
yarn add auto-ts-builder
```

---

## Usage

### Basic Example

```typescript
import { aBuilder } from 'auto-ts-builder';

interface Person {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
    zip: string;
  };
}

// Create a builder with default values
const personBuilder = aBuilder<Person>()({ 
  name: 'John', 
  age: 30, 
  address: {
    street: '123 Main St',
    city: 'Anytown',
    zip: '12345'
  }
});

// Use the builder to create a modified object
const person = personBuilder
  .withName('Jane')
  .withAge(25)
  .address.withStreet('456 Elm St')
  .build();

console.log(person);
/* Output:
{
  name: 'Jane',
  age: 25,
  address: {
    street: '456 Elm St',
    city: 'Anytown',
    zip: '12345'
  }
}
*/
```

### Using Custom Helper Methods

```typescript
import { aBuilderHelper } from 'auto-ts-builder';

interface Person {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
    zip: string;
  };
}

// Create a builder with default values and custom helpers
const personBuilder = aBuilderHelper<Person>()(
  {
    name: 'John',
    age: 30,
    address: {
      street: '123 Main St',
      city: 'Anytown',
      zip: '12345'
    }
  },
  (builder) => ({
    withFullName: (firstName: string, lastName: string) => 
      builder.withName(`${firstName} ${lastName}`),
    withAgeIncrement: (increment: number = 1) => 
      builder.withAge(builder.build().age + increment),
    address: {
      withFullAddress: (street: string, city: string, zip: string) => {
        builder.address.withStreet(street);
        builder.address.withCity(city);
        builder.address.withZip(zip);
      }
    }
  })
);

// Use the builder with custom helpers
const person = personBuilder
  .withFullName('Jane', 'Doe')
  .withAgeIncrement(2)
  .address.withFullAddress('789 Oak St', 'New City', '67890')
  .build();

console.log(person);
/* Output:
{
  name: 'Jane Doe',
  age: 32,
  address: {
    street: '789 Oak St',
    city: 'New City',
    zip: '67890'
  }
}
*/
```

### Working with Nested Builders

```typescript
import { aBuilder } from 'auto-ts-builder';

interface Address {
  street: string;
  city: string;
  zip: string;
}

interface Person {
  name: string;
  age: number;
  address: Address;
}

// Create separate builders
const addressBuilder = aBuilder<Address>()({
  street: '123 Main St',
  city: 'Anytown',
  zip: '12345'
});

const personBuilder = aBuilder<Person>()({
  name: 'John',
  age: 30,
  address: addressBuilder.build()
});

// Modify both builders
addressBuilder.withStreet('456 Elm St').withCity('New City');
personBuilder.withName('Jane').withAge(25).withAddress(addressBuilder.build());

console.log(personBuilder.build());
/* Output:
{
  name: 'Jane',
  age: 25,
  address: {
    street: '456 Elm St',
    city: 'New City',
    zip: '12345'
  }
}
*/
```

---

## API

### `aBuilder<T>()`

Creates a builder factory for objects of type `T` - can be extended with helpers. helpers with same name will override the default builder methods. 

#### Generic Types

- **`T`**: The type of object to build, typically an interface or type.

#### Returns

A function that takes the default object and returns a builder with methods for each property:

- For each property `prop` in `T`, generates a `withProp` method.
- For nested objects, provides property access to nested builders.
- Includes a `build()` method to create the final object.

### `aBuilderHelper<T>()`

Creates a builder factory which exports only the helper methods.
the internal implementation will only be accessible inside the helpers function.

#### Generic Types

- **`T`**: The type of object to build.

#### Returns

A function that takes:
1. The default object of type `T`.
2. An optional function that receives a builder and returns an object with custom helpers.

-----

#### `Helpers` Function Behavior

```typescript
helpers?: (builder: Builder) => ({...});
```

- **Important**: All helper functions ignore their own return values and always return the root builder for chaining
- The `builder` parameter provided to the helper function:
  - Contains only internal builder methods (not other helper methods)

#### Example Helper Function Usage

```typescript
// Example of proxying an existing method with enhanced functionality
withName: (firstName, lastName) => builder.withName(`${firstName} ${lastName}`),

// Example of a helper that uses multiple internal methods
withAddress: (street, city, zip) => {
  builder.address.withStreet(street);
  builder.address.withCity(city);
  builder.address.withZip(zip);
  // No need to return anything - always returns the root builder
},

// Example of nested helpers
address: {
  withPrimary: (address) => builder.address.withType('primary').withValue(address)
}
```

The result is a builder with all standard methods plus the custom helpers.

---

## Type-Safe Builder Pattern

The library automatically generates appropriate builder methods based on property names:

- **Regular properties**: `withName` for a `name` property
- **PascalCase properties**: `with_Name` for a `Name` property
- **Underscore properties**: `with_UnderScore` for `_UnderScore` properties

All methods maintain proper typing for complete type safety.

---

## Why Use `auto-ts-builder`?

- **Type Safety**: Full TypeScript support ensures your builders are type-safe.
- **Clean API**: The builder pattern provides a clean, fluent interface for object construction.
- **Flexibility**: Easily extend with custom helpers for domain-specific building logic.
- **Immutability**: Each builder operation creates a new state, maintaining immutability.
- **Readability**: Makes code more readable and maintainable with clear intentions.

---

## License

MIT © [Guy Warzager](https://github.com/varzager)

---

## Limitations

### Discriminated Unions

Discriminated unions have partial support in auto-ts-builder:

- ✅ Supported: Using discriminated unions as fields or nested properties
  ```typescript
  // This works fine
  const aMyTypeBuilder = aBuilder<{ discriminated: MyType }>()({...})
  ```

- ❌ Not supported: Using a discriminated union as the root type
  ```typescript
  // This won't work properly
  const aMyTypeBuilder = aBuilder<
    { type: 'row'; row: { row: number; error: string } } |
    { type: 'global'; global: { error: string } }
  >()({...})
  ```

- Not supported: Partial nested property access for discriminated unions
  ```typescript
  ❌ // This won't work
  aMyTypeBuilder.discriminated.withType('row').withRow({
      row: 2,
      error: 'error',
  })

  ✅ // This will work
  aMyTypeBuilder.withDiscriminated({
                type: 'row',
                row: {
                    row: 2,
                    error: 'error',
                },
            });
  ```

**Workaround**: Use separate builders for each type in your discriminated union.

---

## Contribution

Contributions, issues, and feature requests are welcome!
