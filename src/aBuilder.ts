import { pathgen } from 'object-path-generator';
import { set, get } from 'lodash';

// Utility types for property name pattern detection
type HasCapitalFirst<S extends string> = S extends `${infer First}${infer _Rest}`
    ? First extends Uppercase<First>
        ? First extends Lowercase<First>
            ? false
            : true
        : false
    : false;

type HasUnderscoreCapital<S extends string> = S extends `_${infer First}${infer Rest}`
    ? HasCapitalFirst<First extends '' ? Rest : First>
    : false;

// Extract only object type properties, including optional ones
type ObjectPropKeys<T> = {
    [K in keyof T]: NonNullable<T[K]> extends object ? K : never;
}[keyof T];

// builder with `build()`
type Builder<T, shouldReturnBuild = true> = {
    // Regular properties: withName() pattern
    [K in keyof T as HasCapitalFirst<string & K> extends false
        ? HasUnderscoreCapital<string & K> extends false
            ? `with${Capitalize<string & K>}`
            : never
        : never]-?: (value: T[K]) => Builder<T, shouldReturnBuild>;
} & {
    // PascalCase properties: with_Name() pattern
    [K in keyof T as HasCapitalFirst<string & K> extends true ? `with_${string & K}` : never]-?: (
        value: T[K],
    ) => Builder<T, shouldReturnBuild>;
} & {
    // _UnderScore properties: with_UnderScore() for top-level, with__UnderScore() for nested
    [K in keyof T as HasUnderscoreCapital<string & K> extends true ? `with_${string & K}` : never]-?: (
        value: T[K],
    ) => Builder<T, shouldReturnBuild>;
} & {
    // Add access to nested properties - all objects are treated as required for navigation
    [K in ObjectPropKeys<T>]-?: NestedBuilder<T, NonNullable<T[K]>, shouldReturnBuild>;
} & (shouldReturnBuild extends true ? { build(): T } : object);

type NestedBuilder<T, U, shouldReturnBuild = true> = {
    // Regular properties: withName() pattern
    [P in keyof U as HasCapitalFirst<string & P> extends false
        ? HasUnderscoreCapital<string & P> extends false
            ? `with${Capitalize<string & P>}`
            : never
        : never]: (value: U[P]) => Builder<T, shouldReturnBuild>;
} & {
    // PascalCase properties: with_Name() pattern
    [P in keyof U as HasCapitalFirst<string & P> extends true ? `with_${string & P}` : never]: (
        value: U[P],
    ) => Builder<T, shouldReturnBuild>;
} & {
    // _UnderScore properties: with__UnderScore() pattern
    [P in keyof U as HasUnderscoreCapital<string & P> extends true ? `with__${string & P}` : never]: (
        value: U[P],
    ) => Builder<T, shouldReturnBuild>;
} & {
    // Add access to nested properties - same approach as above
    [P in ObjectPropKeys<U>]-?: NestedBuilder<T, NonNullable<U[P]>>;
};

type BaseBuilderReturnType<T> = ReturnType<typeof pathgen<Builder<T>>>;

type BaseBuilderReturnTypeWithNoBuild<T> = ReturnType<typeof pathgen<Builder<T, false>>>;

type HelpersConfigType = HelpersConfig | ((...args: any[]) => any);
interface HelpersConfig {
    [K: string]: HelpersConfigType;
}

type NoBuild<A> = 'build' extends keyof A ? { error: "You cannot override the 'build' method in helper functions" } : A;

const aMasterBuilder = <T extends object>({
    finalObj,
    builderHelpers = {},
}: {
    finalObj: T;
    builderHelpers?: HelpersConfig;
}) =>
    pathgen<Builder<T>>('', (path, ...args) => {
        const nestedProp = path.split('.').pop() as string;

        if (get(builderHelpers, path)) {
            (get(builderHelpers, path) as (...args: any[]) => any)(...args);
            return aMasterBuilder<T>({ finalObj, builderHelpers });
        }

        if (nestedProp === 'build') {
            return finalObj;
        }

        // Handle all "with" patterns
        if (nestedProp.startsWith('with')) {
            const parts = path.split('.');
            const lastPart = parts[parts.length - 1];

            // Extract the property name based on the method pattern
            let propName: string;
            if (lastPart.startsWith('with_')) {
                // Handle with_Name or with_UnderScore pattern
                propName = lastPart.substring(5); // Remove "with_"
            } else {
                // Handle withName pattern
                propName = lastPart.charAt(4).toLowerCase() + lastPart.slice(5);
            }

            parts[parts.length - 1] = propName;
            set(finalObj, parts.join('.'), args[0]);
            return aMasterBuilder<T>({ finalObj, builderHelpers });
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
export const aBuilder =
    <T extends object>() =>
    <H extends HelpersConfig>(
        defaultObj: T,
        /**
         * Helper functions to extend the builder functionality
         * @param builder - Builder instance with all methods except build()
         * @returns Object with helper methods
         * @remarks Helper methods ignore their return values and always return the builder for chaining
         */
        helpers?: (builder: BaseBuilderReturnTypeWithNoBuild<T>) => NoBuild<H>,
    ) => {
        const builderHelpers =
            helpers?.(aMasterBuilder<T>({ finalObj: defaultObj }) as BaseBuilderReturnTypeWithNoBuild<T>) ?? {};
        const masterBuilder = aMasterBuilder<T>({ finalObj: defaultObj, builderHelpers });

        return masterBuilder as WithChainedMethods<H & BaseBuilderReturnType<T>>;
        // return masterBuilder as RecursiveReturnTypeOverride<H, BaseBuilderReturnType<T> & H> & BaseBuilderReturnType<T>;
    };

// This type helps us create a builder with all methods returning the final builder type for proper chaining
type WithChainedMethods<H, RootHelper = H> = {
    [K in keyof H]: H[K] extends (...args: infer Args) => any
        ? K extends `build${string}`
            ? H[K]
            : (...args: Args) => WithChainedMethods<RootHelper>
        : WithChainedMethods<H[K], RootHelper>;
};

export const aBuilderHelper =
    <T extends object>() =>
    <H extends HelpersConfig>(
        defaultObj: T,
        /**
         * Helper functions to extend the builder functionality
         * @param builder - Builder instance with all methods except "build()"
         * @returns Object with helper methods
         * @remarks Helper methods ignore their return values and always return the builder for chaining
         */
        helpers?: (builder: BaseBuilderReturnTypeWithNoBuild<T>) => NoBuild<H>,
    ) => {
        const builderHelpers =
            helpers?.(aMasterBuilder<T>({ finalObj: defaultObj }) as BaseBuilderReturnTypeWithNoBuild<T>) ?? {};
        const masterBuilder = aMasterBuilder<T>({ finalObj: defaultObj, builderHelpers });

        // Cast to a type where all methods return the full builder type for chaining
        return masterBuilder as WithChainedMethods<H & { build: () => T }>;
    };
