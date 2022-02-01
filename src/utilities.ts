import { Constructor } from '@akishichinibu/typedutilities';

export function isIterable<T>(obj: any): obj is Iterable<T> {
  return obj === null ? false : typeof obj[Symbol.iterator] === 'function';
}

export function mergeIterable<T extends any>(...objs: Array<T>) {
  console.log(objs);
  const buffer: T[] = [];

  for (const obj of objs) {
    if (isIterable<T>(obj)) {
      for (const r of obj) {
        buffer.push(r);
      }
    } else {
      throw new Error(`Unable to merge ${objs} whose elements are not iterable`);
    }
  }

  const constructor: Constructor<T> = Object.getPrototypeOf(objs[0]).constructor;
  return new constructor(buffer);
}
