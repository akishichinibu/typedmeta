import { SchemaDeclaration } from 'src/schema';

export class BaseClass {
  id!: string;
  valid!: boolean;
}

export class MyBaseClassMetaSchema<TClass extends BaseClass = BaseClass> extends SchemaDeclaration<TClass> {
  fields: Set<string> = new Set();

  get now() {
    return new Date();
  }

  // @Throw()
  metaKey1(): string {
    return '';
  }

  metaKey2(): number {
    return 2;
  }

  metaKey3(): boolean {
    return true;
  }
}

export class Class1 extends BaseClass {
  name!: string;
  age!: number;
}

export class Class1MetaSchema extends MyBaseClassMetaSchema<Class1> {
  parentMetaString!: string;
  parentMetaStringHasDefaultValue: string = 'hello';
  parentMetaStringMayNotExist?: string = undefined;

  parentMetaNumber!: number;
  parentMetaBoolean!: boolean;

  attributeName() {
    return '';
  }
}
