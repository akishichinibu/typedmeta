import { Constructor } from '@akishichinibu/typedutilities';
import { SchemaDeclaration } from './schema';

export interface MetadataManagerProps {
  prefix?: string;
  delimeter?: string;
}

export abstract class AbstractMetadataManager<TTarget extends Object, TSchema extends SchemaDeclaration<TTarget>> {
  private readonly delimeter: string;
  private readonly prefix: string;
  protected readonly schemaInstance: TSchema;

  protected constructor(
    protected readonly Target: Constructor<TTarget>,
    protected readonly Schema: Constructor<TSchema>,
    protected readonly props: MetadataManagerProps,
  ) {
    this.delimeter = props.delimeter ?? '::';
    this.prefix = props.prefix ?? '';
    this.schemaInstance = new Schema();
  }

  get self_() {
    return this.Target;
  }

  get constructor_() {
    return this.Target.constructor;
  }

  get prototype_() {
    return Object.getPrototypeOf(this.Target);
  }

  get schema() {
    return this.schemaInstance;
  }

  protected getPrototypeChain(Until: any) {
    let cur: any = this.self_;
    const p = [];

    while (cur !== Object.getPrototypeOf(Until)) {
      p.push(cur);
      cur = Object.getPrototypeOf(cur);
    }

    return p.reverse();
  }

  private getKey(key: string) {
    return `${this.prefix}${this.delimeter}${key}`;
  }

  reverseKey(key: string) {
    return key.slice(this.prefix.length + this.delimeter.length);
  }

  protected getMetadata<TReturn>(key: string): TReturn {
    const k = this.getKey(key);
    const r = Reflect.getOwnMetadata(k, this.self_);
    return r as TReturn;
  }

  protected setMetadata<TReturn>(key: string, value: TReturn): TReturn {
    const k = this.getKey(key);
    Reflect.defineMetadata(k, value, this.self_);
    return value;
  }

  protected getPropertyMetadata<TReturn>(propertyKey: string, key: string): TReturn {
    const k = this.getKey(key);
    const r = Reflect.getOwnMetadata(k, this.self_, propertyKey);
    return r as TReturn;
  }

  protected setPropertyMetadata<TValue>(propertyKey: string, key: string, value: TValue): TValue {
    const k = this.getKey(key);
    Reflect.defineMetadata(k, value, this.self_, propertyKey);
    return value;
  }

  protected getOwnMetadataKeys() {
    const keys = Reflect.getOwnMetadataKeys(this.self_) as string[];
    return keys.filter((k) => k.startsWith(this.getKey('')));
  }

  getAllSelfMetadata(): Array<[string, any]> {
    return this.getOwnMetadataKeys()
      .map((k) => this.reverseKey(k))
      .map((rk) => [rk, this.getMetadata(rk)]);
  }
}
