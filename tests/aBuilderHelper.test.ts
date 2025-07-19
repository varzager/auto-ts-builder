import { aBuilderHelper } from '../dist/aBuilder';

describe('aBuilderHelper', () => {
    it('should support an interface a simple interface', () => {
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

        const aPersonBuilder = aBuilderHelper<Person>()(
            {
                name: 'John',
                age: 30,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    zip: '12345',
                },
            },
            (builder) => ({
                withName: (name: string) => builder.withName(name),
                withFullName: (firstName: string, lastName: string) => builder.withName(`${firstName} ${lastName}`),
                withAge: (age: number) => builder.withAge(age + 1),
                withStreet: (street: string) => builder.address.withStreet(street),
                address: {
                    withCity: (city: string) => builder.address.withCity(city),
                    city: {
                        withName: (name: string) => builder.address.withCity(name),
                    },
                },
            }),
        );

        const person: Person = aPersonBuilder
            .withName('roy')
            .withAge(35)
            .withFullName('rona', 'sharpe')
            .address.withCity('Othertown')
            .address.city.withName('elseWhere')
            .withFullName('rona', 'sharpy')
            .build();

        expect(person).toEqual({
            name: 'rona sharpy',
            age: 36,
            address: {
                street: '123 Main St',
                city: 'elseWhere',
                zip: '12345',
            },
        });
    });
});
