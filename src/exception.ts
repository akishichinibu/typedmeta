export class MetadataNotFoundError extends Error {
  constructor(target: any, key: string) {
    super(`Can't found metadata [${key}] in [${target.name ?? target}]`);
  }
}

export class PropertyMetadataNotFoundError extends Error {
  constructor(target: any, property: string, key: string) {
    super(`Can't found property metadata [${key}] in [${target.name ?? target}] for [${property}]`);
  }
}
