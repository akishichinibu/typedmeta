import { printTable } from 'console-table-printer';
import 'reflect-metadata';
import { AbstractMetadataManager, MetadataManagerProps } from './base';
import { MetadataNotFoundError, PropertyMetadataNotFoundError } from './exception';
import { GetPropertySchema, SchemaDeclaration, GetSchemaKeys, GetSchema, GetPropertySchemaKeys } from './schema';
import { Constructor, IfIterable, IfTrueOrNerver, StringKeyof } from '@akishichinibu/typedutilities';
import { mergeIterable } from './utilities';

type MergeInheritStrategy = 'merge';

type ReducerInheritStrategy<TValue> = (previousValue: [any, TValue | undefined], currentValue: [any, TValue]) => TValue;

type InheritStrategy<
  TTarget extends Object,
  TSchema extends SchemaDeclaration<TTarget>,
  TKey extends GetSchemaKeys<TTarget, TSchema>,
  TValue = GetSchema<TTarget, TSchema>[TKey],
> = IfTrueOrNerver<IfIterable<TValue>, MergeInheritStrategy> | ReducerInheritStrategy<TValue>;

type PropertyInheritStrategy<
  TTarget extends Object,
  TSchema extends SchemaDeclaration<TTarget>,
  TKey extends StringKeyof<GetPropertySchema<TTarget, TSchema>>,
  TValue = GetPropertySchema<TTarget, TSchema>[TKey],
> = IfTrueOrNerver<IfIterable<TValue>, MergeInheritStrategy> | ReducerInheritStrategy<TValue>;

interface GetSelfMetadataProps<
  TTarget extends Object,
  TSchema extends SchemaDeclaration<TTarget>,
  TKey extends GetSchemaKeys<TTarget, TSchema>,
> {
  inheritUntil?: any;
  inherit?: InheritStrategy<TTarget, TSchema, TKey>;
}

interface GetSelfPropertyMetadataProps<
  TTarget extends Object,
  TSchema extends SchemaDeclaration<TTarget>,
  TKey extends GetPropertySchemaKeys<TTarget, TSchema>,
> {
  inheritUntil?: any;
  inherit?: PropertyInheritStrategy<TTarget, TSchema, TKey>;
}

export class MetadataManager<
  TTarget extends Object,
  TSchema extends SchemaDeclaration<TTarget>,
> extends AbstractMetadataManager<TTarget, TSchema> {
  protected static cache: Map<Object, any> = new Map();

  static fromConstructor<TTarget extends Object, TSchema extends SchemaDeclaration<TTarget>>(
    Target: Constructor<TTarget>,
    Schema: Constructor<TSchema>,
    props?: MetadataManagerProps,
  ) {
    type InstanceType = MetadataManager<TTarget, TSchema>;

    if (!this.cache.has(Target)) {
      const inst = new this<TTarget, TSchema>(Target, Schema, props ?? {});
      this.cache.set(Target, inst);
    }

    return this.cache.get(Target)! as InstanceType;
  }

  static fromPrototype<TTarget extends Object, TSchema extends SchemaDeclaration<TTarget>>(
    proto: any,
    Schema: Constructor<TSchema>,
    props?: MetadataManagerProps,
  ) {
    return this.fromConstructor<TTarget, TSchema>(proto.constructor, Schema, props);
  }

  static fromInstance<TTarget extends Object, TSchema extends SchemaDeclaration<TTarget>>(
    instance: TTarget,
    Schema: Constructor<TSchema>,
    props?: MetadataManagerProps,
  ) {
    return this.fromConstructor<TTarget, TSchema>((instance as any).constructor, Schema, props);
  }

  getSelfMetadata<TKey extends GetSchemaKeys<TTarget, TSchema>>(
    key: TKey,
    props?: GetSelfMetadataProps<TTarget, TSchema, TKey>,
  ): GetSchema<TTarget, TSchema>[TKey] {
    type TReturnValue = GetSchema<TTarget, TSchema>[TKey];
    let currentValue = this.getMetadata<TReturnValue>(key);

    if (props?.inherit !== undefined) {
      const prototypes = this.getPrototypeChain(props?.inheritUntil ?? Object);

      const datas: Array<[any, TReturnValue]> = prototypes
        // skip the current constructor
        .slice(0, -1)
        .map((p) => {
          const m = MetadataManager.fromConstructor<TTarget, TSchema>(p, this.Schema, this.props);
          const v = m.getSelfMetadata<TKey>(key, { ...props, inherit: undefined, inheritUntil: undefined });
          return [p, v];
        });

      switch (props.inherit) {
        case 'merge': {
          currentValue = mergeIterable(currentValue, ...datas.map(([_, v]) => v));
          break;
        }
        default: {
          let f = props.inherit as ReducerInheritStrategy<TReturnValue>;
          let proto: any = this.self_;
          datas.forEach(([p, v]) => (currentValue = f([proto, currentValue], [p, v])));
        }
      }
    }

    if (currentValue !== undefined) {
      return currentValue;
    }

    if (key in this.schema) {
      return this.schema[key];
    }

    throw new MetadataNotFoundError(this.self_, key);
  }

  setSelfMetadata<TKey extends GetSchemaKeys<TTarget, TSchema>>(key: TKey, value: GetSchema<TTarget, TSchema>[TKey]) {
    this.setMetadata(key, value);
    return this;
  }

  getSelfPropertyMetadata<TProperty extends StringKeyof<TTarget>, TKey extends GetPropertySchemaKeys<TTarget, TSchema>>(
    property: TProperty | string,
    key: TKey,
    props?: GetSelfPropertyMetadataProps<TTarget, TSchema, TKey>,
  ): GetPropertySchema<TTarget, TSchema>[TKey] {
    type TReturnValue = GetPropertySchema<TTarget, TSchema>[TKey];
    let currentValue = this.getPropertyMetadata<TReturnValue>(property, key);

    if (props?.inherit !== undefined) {
      const prototypes = this.getPrototypeChain(props?.inheritUntil ?? Object);

      const datas: Array<[any, TReturnValue]> = prototypes.slice(0, -1).map((p) => {
        const m = MetadataManager.fromConstructor<TTarget, TSchema>(p, this.Schema, this.props);
        const v = m.getPropertyMetadata<TReturnValue>(property, key);
        return [p, v];
      });

      switch (props.inherit) {
        case 'merge': {
          currentValue = mergeIterable(currentValue, ...datas.map(([_, v]) => v));
          break;
        }
        default: {
          let f = props.inherit as ReducerInheritStrategy<TReturnValue>;
          let proto: any = this.self_;
          datas.forEach(([p, v]) => (currentValue = f([proto, currentValue], [p, v])));
        }
      }
    }

    if (currentValue !== undefined) {
      return currentValue;
    }

    try {
      currentValue = (this.schema[key] as any)();
    } catch (error) {
      throw new Error('');
      throw new PropertyMetadataNotFoundError(this.self_, property, key);
    }

    return currentValue;
  }

  setSelfPropertyMetadata<TProperty extends StringKeyof<TTarget>, TKey extends GetPropertySchemaKeys<TTarget, TSchema>>(
    property: TProperty | string,
    key: TKey,
    value: GetPropertySchema<TTarget, TSchema>[TKey],
  ) {
    this.setPropertyMetadata(property, key, value);
    return this;
  }

  show() {
    console.log(`Metadata: [${this.self_.name || this.self_}]`);
    const data = this.getAllSelfMetadata().map(([key, value]) => ({ key, value }));
    printTable(data);
  }
}
