import { aBuilder } from '../src/aBuilder';

describe('aBuilder', () => {
    it('should support an interface a simple interface', () => {
        interface A {
            name: string;
            age: number;
            address: {
                street: string;
                city: string;
                zip: string;
            };
        }

        const builder = aBuilder<A>()({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        expect(builder.build()).toEqual({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });
    });

    it('should support builder overrides', () => {
        interface A {
            name: string;
            age: number;
            address: {
                street: string;
                city: string;
                zip: string;
            };
        }

        const builder = aBuilder<A>()({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        builder
            .withName('Jane')
            .withAge(25)
            .withAddress({
                street: '456 Elm St',
                city: 'Othertown',
                zip: '67890',
            })
            .address.withStreet('459 Elm St');

        expect(builder.build()).toEqual({
            name: 'Jane',
            age: 25,
            address: {
                street: '459 Elm St',
                city: 'Othertown',
                zip: '67890',
            },
        });
    });

    it('should support builder with partial overrides', () => {
        interface A {
            name: string;
            age: number;
            address: {
                street: string;
                city: string;
                zip: string;
            };
        }

        const builder = aBuilder<A>()({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        builder.withName('Jane').withAge(25).address.withStreet('459 Elm St');

        expect(builder.build()).toEqual({
            name: 'Jane',
            age: 25,
            address: {
                street: '459 Elm St',
                city: 'Anytown',
                zip: '12345',
            },
        });
    });

    it('should support builder with nested builder', () => {
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

        const aPersonBuilder = aBuilder<Person>()({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        const anAddressBuilder = aBuilder<Address>()({
            street: '123 Main St',
            city: 'Anytown',
            zip: '12345',
        });

        anAddressBuilder.withStreet('459 Elm St');

        expect(anAddressBuilder.build()).toEqual({
            street: '459 Elm St',
            city: 'Anytown',
            zip: '12345',
        });

        aPersonBuilder.withName('Jane').withAge(25).withAddress(anAddressBuilder.build());

        expect(aPersonBuilder.build()).toEqual({
            name: 'Jane',
            age: 25,
            address: {
                street: '459 Elm St',
                city: 'Anytown',
                zip: '12345',
            },
        });
    });

    it('should support builder with nested builder that has "build" chained (nothing is obvious!)', () => {
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

        const aPersonBuilder = aBuilder<Person>()({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        const basePerson: Person = aPersonBuilder.build();

        expect(basePerson).toEqual({
            name: 'John',
            age: 30,
            address: {
                street: '123 Main St',
                city: 'Anytown',
                zip: '12345',
            },
        });

        const person: Person = aPersonBuilder.withName('Jane').withAge(25).address.withCity('ElseWhere').build();

        expect(person).toEqual({
            name: 'Jane',
            age: 25,
            address: {
                street: '123 Main St',
                city: 'ElseWhere',
                zip: '12345',
            },
        });
    });

    it('should support builder with Enum', () => {
        enum Species {
            Human = 'human',
            Alien = 'alien',
        }

        interface Person {
            name: string;
            gender: 'male' | 'female';
            species: Species;
            age: number;
        }

        const aPersonBuilder = aBuilder<Person>()({
            name: 'John',
            gender: 'male',
            species: Species.Human,
            age: 30,
        });

        aPersonBuilder.withGender('female').withSpecies(Species.Alien).withName('Jane').withAge(25);

        expect(aPersonBuilder.build()).toEqual({
            name: 'Jane',
            gender: 'female',
            species: Species.Alien,
            age: 25,
        });
    });

    it('should support builder with weird field names', () => {
        interface Person {
            name: string;
            Age: number;
            '1Only': number;
            $id: number;
            'space name': string;
            _UnderScore: number;
            'kebab-case': string;
            class: string;
            function: string;
            return: boolean;
            '🔑': string; // Emoji key
            ñáme: string; // Non-ASCII characters
        }

        const aPersonBuilder = aBuilder<Person>()({
            name: 'John',
            Age: 30,
            '1Only': 1,
            $id: 1,
            'space name': 'space name',
            _UnderScore: 25,
            'kebab-case': 'kebab case',
            class: 'class',
            function: 'function',
            return: true,
            '🔑': 'key',
            ñáme: 'name',
        });

        aPersonBuilder
            .withName('Jane')
            .with1Only(2)
            .with$id(2)
            .with_Age(25)
            .with__UnderScore(25)
            ['with🔑']('key')
            .withÑáme('name')
            ['withSpace name']('space name')
            ['withKebab-case']('kebab case')
            .withClass('class')
            .withFunction('function')
            .withReturn(true);

        expect(aPersonBuilder.build()).toEqual({
            name: 'Jane',
            Age: 25,
            '1Only': 2,
            $id: 2,
            'space name': 'space name',
            _UnderScore: 25,
            'kebab-case': 'kebab case',
            class: 'class',
            function: 'function',
            return: true,
            '🔑': 'key',
            ñáme: 'name',
        });
    });

    it('should support builder with multiple nested levels', () => {
        // Define nested interfaces - each in a separate interface declaration
        interface Address {
            street: string;
            number: number;
            postalInfo: {
                zip: string;
                country: string;
            };
        }

        interface Job {
            title: string;
            company: string;
            workAddress: Address;
            department: {
                name: string;
                floor: number;
                location: {
                    building: string;
                    section: string;
                };
            };
        }

        interface Person {
            name: string;
            age: number;
            work: Job;
            contact: {
                email: string;
                phone: string;
            };
        }

        // Create builder with initial values
        const personBuilder = aBuilder<Person>()({
            name: 'John Doe',
            age: 30,
            work: {
                title: 'Engineer',
                company: 'Tech Inc',
                workAddress: {
                    street: 'Main St',
                    number: 100,
                    postalInfo: {
                        zip: '12345',
                        country: 'USA',
                    },
                },
                department: {
                    name: 'Development',
                    floor: 3,
                    location: {
                        building: 'Building A',
                        section: 'North',
                    },
                },
            },
            contact: {
                email: 'john.doe@example.com',
                phone: '123-456-7890',
            },
        });

        // Pattern 1: Direct property override using withX method at top level
        personBuilder.withName('Jane Doe').withAge(32);

        // Pattern 2: Direct nested object override
        personBuilder.withWork({
            title: 'Senior Engineer',
            company: 'Tech Inc',
            workAddress: {
                street: 'Main St',
                number: 100,
                postalInfo: {
                    zip: '12345',
                    country: 'USA',
                },
            },
            department: {
                name: 'R&D',
                floor: 4,
                location: {
                    building: 'Building A',
                    section: 'East',
                },
            },
        });

        // Pattern 3: Nested property access with withX methods
        personBuilder.work.withTitle('Lead Engineer');
        personBuilder.work.workAddress.withStreet('Innovation Ave');
        personBuilder.work.workAddress.postalInfo.withZip('54321');

        // Pattern 4: Deep nesting across different interfaces
        // Fix: separate the chaining to avoid type errors
        const locationBuilder = personBuilder.work.department.location;
        locationBuilder.withBuilding('Building B');
        locationBuilder.withSection('West');

        // Pattern 5: Mixed approach - accessing nested and then setting with withX
        personBuilder.work.withDepartment({
            name: 'Advanced R&D',
            floor: 5,
            location: {
                building: 'Building C',
                section: 'South',
            },
        });

        // Pattern 6: Directly accessing deep nested property
        personBuilder.contact.withEmail('jane.doe@example.com');

        expect(personBuilder.build()).toEqual({
            name: 'Jane Doe',
            age: 32,
            work: {
                title: 'Lead Engineer',
                company: 'Tech Inc',
                workAddress: {
                    street: 'Innovation Ave',
                    number: 100,
                    postalInfo: {
                        zip: '54321',
                        country: 'USA',
                    },
                },
                department: {
                    name: 'Advanced R&D',
                    floor: 5,
                    location: {
                        building: 'Building C',
                        section: 'South',
                    },
                },
            },
            contact: {
                email: 'jane.doe@example.com',
                phone: '123-456-7890',
            },
        });
    });

    it('should support another nested builder scenario', () => {
        // Define nested interfaces - each in a separate interface declaration
        interface Address {
            street: string;
            number: number;
            postalInfo: {
                zip: string;
                country: string;
            };
        }

        interface Job {
            title: string;
            company: string;
            workAddress: Address;
            department: {
                name: string;
                floor: number;
                location: {
                    building: string;
                    section: string;
                };
            };
        }

        interface Person {
            name: string;
            age: number;
            work: Job;
            contact: {
                email: string;
                phone: string;
            };
        }

        // Create builder with initial values
        const personBuilder = aBuilder<Person>()({
            name: 'John Doe',
            age: 30,
            work: {
                title: 'Engineer',
                company: 'Tech Inc',
                workAddress: {
                    street: 'Main St',
                    number: 100,
                    postalInfo: {
                        zip: '12345',
                        country: 'USA',
                    },
                },
                department: {
                    name: 'Development',
                    floor: 3,
                    location: {
                        building: 'Building A',
                        section: 'North',
                    },
                },
            },
            contact: {
                email: 'john.doe@example.com',
                phone: '123-456-7890',
            },
        });

        personBuilder
            .withName('Jane Doe')
            .withAge(32)
            .withWork({
                title: 'Senior Engineer',
                company: 'Tech Inc',
                workAddress: {
                    street: 'Main St',
                    number: 100,
                    postalInfo: {
                        zip: '12345',
                        country: 'USA',
                    },
                },
                department: {
                    name: 'R&D',
                    floor: 4,
                    location: {
                        building: 'Building A',
                        section: 'East',
                    },
                },
            })
            .work.withTitle('Lead Engineer')
            .work.workAddress.withStreet('Innovation Ave')
            .work.workAddress.postalInfo.withZip('54321')
            .work.department.location.withBuilding('Building B')
            .work.department.location.withSection('West')
            .work.withDepartment({
                name: 'Advanced R&D',
                floor: 5,
                location: {
                    building: 'Building C',
                    section: 'South',
                },
            })
            .contact.withEmail('jane.doe@example.com');

        expect(personBuilder.build()).toEqual({
            name: 'Jane Doe',
            age: 32,
            work: {
                title: 'Lead Engineer',
                company: 'Tech Inc',
                workAddress: {
                    street: 'Innovation Ave',
                    number: 100,
                    postalInfo: {
                        zip: '54321',
                        country: 'USA',
                    },
                },
                department: {
                    name: 'Advanced R&D',
                    floor: 5,
                    location: {
                        building: 'Building C',
                        section: 'South',
                    },
                },
            },
            contact: {
                email: 'jane.doe@example.com',
                phone: '123-456-7890',
            },
        });
    });

    describe('discriminated union', () => {
        it('should support discriminated union', () => {
            type MyType =
                | { type: 'row'; row: { row: number; error: string } }
                | { type: 'global'; global: { error: string } };

            const aMyTypeBuilder = aBuilder<{ discriminated: MyType }>()({
                discriminated: {
                    type: 'global',
                    global: {
                        error: 'error',
                    },
                },
            });

            aMyTypeBuilder.withDiscriminated({
                type: 'row',
                row: {
                    row: 2,
                    error: 'error',
                },
            });

            expect(aMyTypeBuilder.build()).toEqual({
                discriminated: {
                    type: 'row',
                    row: {
                        row: 2,
                        error: 'error',
                    },
                },
            });
        });
    });

    describe('helpers', () => {
        it('should support builder with helpers', () => {
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

            const aPersonBuilder = aBuilder<Person>()(
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
                    withStreet: (street: string) => builder.address.withStreet(street),
                }),
            );

            aPersonBuilder.withName('Jane').withAge(25).address.withStreet('451 Elm St');

            aPersonBuilder.withStreet('459 Elm St');

            expect(aPersonBuilder.build()).toEqual({
                name: 'Jane',
                age: 25,
                address: {
                    street: '459 Elm St',
                    city: 'Anytown',
                    zip: '12345',
                },
            });
        });

        it("should override builder's native behavior with helpers", () => {
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

            const aPersonBuilder = aBuilder<Person>()(
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
                    withPersonName: (name: string) => builder.withName(name),
                }),
            );

            aPersonBuilder.withPersonName('wonda');

            expect(aPersonBuilder.build()).toEqual({
                name: 'wonda',
                age: 30,
                address: {
                    street: '123 Main St',
                    city: 'Anytown',
                    zip: '12345',
                },
            });
        });

        it("should override builder's native behavior with complex helpers - nested & override root builder's behavior", () => {
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

            const aPersonBuilder = aBuilder<Person>()(
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
                    withFullName: (firstName: string, lastName: string) => builder.withName(`${firstName} ${lastName}`),
                    withAgeAndName: (age: number, firstName: string, lastName: string) =>
                        aPersonBuilder.withFullName(firstName, lastName).withAge(age),
                    withAge: (age: number) => builder.withAge(age + 1),
                    street: {
                        withStreet: (street: string) => builder.address.withStreet(street.trim()),
                    },
                    innerThingy: {
                        child: {
                            grandson: () => '',
                        },
                    },
                }),
            );

            aPersonBuilder
                .withFullName('rona', 'sharpe')
                .withAgeAndName(32, 'roni', 'sharpe')
                .withAge(35)
                .street.withStreet('   459 Elm St   ')
                .innerThingy.child.grandson();

            expect(aPersonBuilder.build()).toEqual({
                name: 'roni sharpe',
                age: 36,
                address: {
                    street: '459 Elm St',
                    city: 'Anytown',
                    zip: '12345',
                },
            });
        });
    });
});
