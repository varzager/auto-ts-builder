import { pathgen } from 'object-path-generator';
import { set, get } from 'lodash';
const aMasterBuilder = ({ finalObj, builderHelpers = {}, }) => pathgen('', (path, ...args) => {
    const nestedProp = path.split('.').pop();
    if (get(builderHelpers, path)) {
        get(builderHelpers, path)(...args);
        return aMasterBuilder({ finalObj, builderHelpers });
    }
    if (nestedProp === 'build') {
        return finalObj;
    }
    // Handle all "with" patterns
    if (nestedProp.startsWith('with')) {
        const parts = path.split('.');
        const lastPart = parts[parts.length - 1];
        // Extract the property name based on the method pattern
        let propName;
        if (lastPart.startsWith('with_')) {
            // Handle with_Name or with_UnderScore pattern
            propName = lastPart.substring(5); // Remove "with_"
        }
        else {
            // Handle withName pattern
            propName = lastPart.charAt(4).toLowerCase() + lastPart.slice(5);
        }
        parts[parts.length - 1] = propName;
        set(finalObj, parts.join('.'), args[0]);
        return aMasterBuilder({ finalObj, builderHelpers });
    }
    return undefined;
});
/**
 * Builder factory function that creates a builder with type-safe helper methods
 * The generic type H captures the exact types of the helper methods
 *
 * @example
 * const personBuilder = aBuilder<Person>(
 *   { name: 'John', age: 30 },
 *   (builder) => ({
 *     withPersonName: (name: string) => builder.withName(name) // This will be type-checked!
 *   })
 * );
 */
export const aBuilder = () => (defaultObj, 
/**
 * Helper functions to extend the builder functionality
 * @param builder - Builder instance with all methods except build()
 * @returns Object with helper methods
 * @remarks Helper methods ignore their return values and always return the builder for chaining
 */
helpers) => {
    const builderHelpers = helpers?.(aMasterBuilder({ finalObj: defaultObj })) ?? {};
    const masterBuilder = aMasterBuilder({ finalObj: defaultObj, builderHelpers });
    return masterBuilder;
    // return masterBuilder as RecursiveReturnTypeOverride<H, BaseBuilderReturnType<T> & H> & BaseBuilderReturnType<T>;
};
export const aBuilderHelper = () => (defaultObj, 
/**
 * Helper functions to extend the builder functionality
 * @param builder - Builder instance with all methods except "build()"
 * @returns Object with helper methods
 * @remarks Helper methods ignore their return values and always return the builder for chaining
 */
helpers) => {
    const builderHelpers = helpers?.(aMasterBuilder({ finalObj: defaultObj })) ?? {};
    const masterBuilder = aMasterBuilder({ finalObj: defaultObj, builderHelpers });
    // Cast to a type where all methods return the full builder type for chaining
    return masterBuilder;
};
