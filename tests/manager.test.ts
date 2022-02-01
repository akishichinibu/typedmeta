import { MetadataManager, BaseSchema } from '../index';
import { IfEquals, Test } from '@akishichinibu/typedutilities';
import { BaseClass, MyBaseClassMetaSchema, Class1, Class1MetaSchema } from './test.schema';
import { GetPropertySchema } from 'src/schema';

it('test metadata get/set', () => {
  const m = MetadataManager.fromConstructor(Class1, Class1MetaSchema);

  m.setSelfMetadata('now', new Date());

  m.setSelfMetadata('parentMetaBoolean', false);
  const r1 = m.getSelfMetadata('parentMetaBoolean');
  const _1: Test<typeof r1, boolean> = true;
  expect(r1).toEqual(false);

  m.setSelfMetadata('parentMetaNumber', 114514);
  const r2 = m.getSelfMetadata('parentMetaNumber');
  const _2: Test<typeof r2, number> = true;
  expect(r2).toEqual(114514);

  expect(() => m.getSelfMetadata('parentMetaString')).toThrowError();

  m.setSelfMetadata('parentMetaString', 'happy');
  const r3 = m.getSelfMetadata('parentMetaString');
  const _3: IfEquals<typeof r3, string, true> = true;
  expect(r3).toEqual('happy');

  const r4 = m.getSelfMetadata('parentMetaStringMayNotExist');
  const _4: IfEquals<typeof r4, string | undefined, true> = true;
  expect(r4).toBeUndefined();

  const r5 = m.getSelfMetadata('parentMetaStringHasDefaultValue');
  const _5: IfEquals<typeof r5, string, true> = true;
  expect(r5).toEqual('hello');

  m.show();
});

it('test property metadata get/set', () => {
  const m = MetadataManager.fromConstructor(Class1, Class1MetaSchema);

  m.setSelfPropertyMetadata('name', 'metaKey1', 'hello');
  m.setSelfPropertyMetadata('name', 'metaKey2', 3);
  m.setSelfPropertyMetadata('name', 'metaKey3', true);

  const r1 = m.getSelfPropertyMetadata('name', 'metaKey1');
  const _1: Test<typeof r1, string> = true;
  expect(r1).toEqual('hello');

  m.show();
});

it('test inheritence', () => {
  const pm = MetadataManager.fromConstructor<BaseClass, MyBaseClassMetaSchema>(BaseClass, MyBaseClassMetaSchema);
  const m = MetadataManager.fromConstructor(Class1, Class1MetaSchema);

  pm.setSelfMetadata('fields', pm.getSelfMetadata('fields').add('0'));
  const r1 = pm.getSelfMetadata('fields');
  expect(Array.from(r1).sort()).toStrictEqual(['0']);
  const _1: IfEquals<typeof r1, Set<string>, true> = true;

  m.setSelfMetadata('fields', m.getSelfMetadata('fields').add('x').add('y'));
  const r2 = m.getSelfMetadata('fields');
  expect(Array.from(r2).sort()).toStrictEqual(['x', 'y']);

  const r = m.getSelfMetadata('fields', { inherit: 'merge', inheritUntil: BaseClass });
  expect(Array.from(r).sort()).toStrictEqual(['0', 'x', 'y']);
});

it('from prototype', () => {
  const m = MetadataManager.fromPrototype(Class1.prototype, Class1MetaSchema);
});
