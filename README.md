# TypedMeta

A fully type-safe metadata schema framework, to add type annotation on the typescript meta data. 

Example:
```typescript

class TestClass {
  id!: string;
}

type TestClassPropertySchema = {
  id: {
    id1!: string;
    id2!: boolean;
  };
  aPropertyDontExisted: {};
};

class TestClassSchema extends IBaseSchema<TestClass, TestClassPropertySchema> {
  name!: string;
  age: number = 20;
  optionField?: string = undefined;
  isValid: boolean = true;
}


const m = MetadataManager.fromConstructor(TestClass, TestClassSchema);

const r1 = m.getSelfMetadata('name'); // will be string, an exception will be throwed if it doesn't exist
const r2 = m.getSelfMetadata('age'); // will be number, if it doesn't exist, the 20 will be returned as a default value
const r3 = m.getSelfMetadata('optionField'); // will be string or undefined 
const r4 = m.setSelfPropertyMetadata("id", "id1"); // will be string

```
