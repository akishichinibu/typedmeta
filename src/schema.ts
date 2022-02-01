import { Callable, StringKeyof, PickNotCallable, PickCallable } from '@akishichinibu/typedutilities';

export type GetSchema<TTarget, TSchema extends SchemaDeclaration<TTarget>> = PickNotCallable<TSchema>;

export type GetSchemaKeys<TTarget, TSchema extends SchemaDeclaration<TTarget>> = StringKeyof<
  GetSchema<TTarget, TSchema>
>;

export type GetPropertySchema<TTarget, TSchema extends SchemaDeclaration<TTarget>> = GetPropertySchemaImpl<
  TTarget,
  TSchema
>;

type GetPropertySchemaImpl<TTarget, TSchema extends SchemaDeclaration<TTarget>, TMembers = PickCallable<TSchema>> = {
  [TKey in StringKeyof<TMembers>]: TMembers[TKey] extends Callable ? ReturnType<TMembers[TKey]> : never;
};

export type GetPropertySchemaKeys<TTarget, TSchema extends SchemaDeclaration<TTarget>> = StringKeyof<
  GetPropertySchema<TTarget, TSchema>
>;

/**
 * Calculates the square root of a number.
 *
 */
export abstract class SchemaDeclaration<TTarget> {}

export class PropertySchemaDeclaration<TTarget, TSchema> {}
