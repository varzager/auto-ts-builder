import { pathgen } from 'object-path-generator';
type HasCapitalFirst<S extends string> = S extends `${infer First}${infer _Rest}` ? First extends Uppercase<First> ? First extends Lowercase<First> ? false : true : false : false;
type HasUnderscoreCapital<S extends string> = S extends `_${infer First}${infer Rest}` ? HasCapitalFirst<First extends '' ? Rest : First> : false;
type ObjectPropKeys<T> = {
    [K in keyof T]: NonNullable<T[K]> extends object ? K : never;
}[keyof T];
type Builder<T, shouldReturnBuild = true> = {
    [K in keyof T as HasCapitalFirst<string & K> extends false ? HasUnderscoreCapital<string & K> extends false ? `with${Capitalize<string & K>}` : never : never]-?: (value: T[K]) => Builder<T, shouldReturnBuild>;
} & {
    [K in keyof T as HasCapitalFirst<string & K> extends true ? `with_${string & K}` : never]-?: (value: T[K]) => Builder<T, shouldReturnBuild>;
} & {
    [K in keyof T as HasUnderscoreCapital<string & K> extends true ? `with_${string & K}` : never]-?: (value: T[K]) => Builder<T, shouldReturnBuild>;
} & {
    [K in ObjectPropKeys<T>]-?: NestedBuilder<T, NonNullable<T[K]>, shouldReturnBuild>;
} & (shouldReturnBuild extends true ? {
    build(): T;
} : object);
type NestedBuilder<T, U, shouldReturnBuild = true> = {
    [P in keyof U as HasCapitalFirst<string & P> extends false ? HasUnderscoreCapital<string & P> extends false ? `with${Capitalize<string & P>}` : never : never]: (value: U[P]) => Builder<T, shouldReturnBuild>;
} & {
    [P in keyof U as HasCapitalFirst<string & P> extends true ? `with_${string & P}` : never]: (value: U[P]) => Builder<T, shouldReturnBuild>;
} & {
    [P in keyof U as HasUnderscoreCapital<string & P> extends true ? `with__${string & P}` : never]: (value: U[P]) => Builder<T, shouldReturnBuild>;
} & {
    [P in ObjectPropKeys<U>]-?: NestedBuilder<T, NonNullable<U[P]>>;
};
type BaseBuilderReturnType<T> = ReturnType<typeof pathgen<Builder<T>>>;
type BaseBuilderReturnTypeWithNoBuild<T> = ReturnType<typeof pathgen<Builder<T, false>>>;
type HelpersConfigType = HelpersConfig | ((...args: any[]) => any);
interface HelpersConfig {
    [K: string]: HelpersConfigType;
}
type NoBuild<A> = 'build' extends keyof A ? {
    error: "You cannot override the 'build' method in helper functions";
} : A;
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
export declare const aBuilder: <T extends object>() => <H extends HelpersConfig>(defaultObj: T, 
/**
 * Helper functions to extend the builder functionality
 * @param builder - Builder instance with all methods except build()
 * @returns Object with helper methods
 * @remarks Helper methods ignore their return values and always return the builder for chaining
 */
helpers?: (builder: BaseBuilderReturnTypeWithNoBuild<T>) => NoBuild<H>) => WithChainedMethods<H & BaseBuilderReturnType<T>>;
type WithChainedMethods<H, RootHelper = H> = {
    [K in keyof H]: H[K] extends (...args: infer Args) => any ? K extends `build${string}` ? H[K] : (...args: Args) => WithChainedMethods<RootHelper> : WithChainedMethods<H[K], RootHelper>;
};
export declare const aBuilderHelper: <T extends object>() => <H extends HelpersConfig>(defaultObj: T, 
/**
 * Helper functions to extend the builder functionality
 * @param builder - Builder instance with all methods except "build()"
 * @returns Object with helper methods
 * @remarks Helper methods ignore their return values and always return the builder for chaining
 */
helpers?: (builder: BaseBuilderReturnTypeWithNoBuild<T>) => NoBuild<H>) => WithChainedMethods<H & {
    build: () => T;
}>;
export {};
