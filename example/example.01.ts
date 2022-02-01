import { SchemaDeclaration } from "../src/schema";
import { PickCallable } from "@akishichinibu/typedutilities";
import { MetadataManager } from "src/manager";

class TestClass {
  id!: string;
  name: string = "boy";
  phone?: string = undefined;
}


class TestClassSchema extends SchemaDeclaration<TestClass> {

  name!: string;

  age: number = 20;

  optionField?: string = undefined;

  isValid: boolean = true;

  key1() {
    return "unknown";
  }

  key2() {
    return "unknown";
  }

}

const m = MetadataManager.fromConstructor(TestClass, TestClassSchema);

m.setSelfMetadata('name', "test");
console.log(m.getSelfMetadata('name')); // will be string, an exception will be throwed if it doesn't exist

m.setSelfMetadata("age", 5);
const r2 = m.getSelfMetadata('age'); // will be number, if it doesn't exist, the 20 will be returned as a default value

const r3 = m.getSelfMetadata('optionField'); // will be string or undefined 

m.setSelfMetadata("isValid", false);

const r4 = m.getSelfPropertyMetadata("id", "key1"); // will be string

console.log(r4);

try {
  m.getSelfPropertyMetadata("id", "key2");
} catch (e) {
  console.log("throw here");
}

m.show();
