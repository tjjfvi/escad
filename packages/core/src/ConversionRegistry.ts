
import { ProductType, getProductType, Product } from "./Product";
import { ConvertibleTo, ConversionImpl } from "./Conversions";
import { MultiHashMap } from "./MultiHashMap";
import { hash } from "./hash";
import { artifactManager, ArtifactManager } from "./ArtifactManager";
import { ArtifactStore } from "./ArtifactStore";
import { Id } from "./Id";
import { depthFirst } from "./depthFirst";
import { HashMap } from "./HashMap";
import { TupleProduct } from "./TupleProduct";
// import { formatConversion, log } from "./logging";

type ConversionPath = ConversionImpl<any, any>[]

export class ConversionRegistry {

  constructor(public artifactManager: ArtifactManager){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  readonly artifactStoreId = Id.create(__filename, "@escad/core", "0", "ConversionRegistryArifactStore");
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, toType, product]) => {
      if(!Id.isId(id) || !Id.equal(id, this.artifactStoreId)) return null;
      if(!Product.isProduct(product)) return null;
      return this.convertProduct(toType as ProductType, product);
    }
  }

  readonly excludeStores: ReadonlySet<ArtifactStore> = new Set([this.artifactStore]);

  private readonly registered = new Set<ConversionImpl<any, any>>();
  private initialComposed = new MultiHashMap<[ProductType, ProductType], ConversionPath>();
  private composed = new HashMap<[ProductType, ProductType], ConversionPath | null>();

  register<F extends Product, T extends Product>(
    conversion: ConversionImpl<F, T>,
  ): void {
    this.initialComposed.clear();
    this.composed.clear();
    this.registered.add(conversion)
  }

  has(a: ProductType, b: ProductType): boolean{
    return !!this.compose(a, b);
  }

  listAll(): Iterable<ConversionImpl<any, any>>{
    return this.registered.values();
  }

  private initialCompose(fromType: ProductType){
    const initialComposed = this.initialComposed ??= new MultiHashMap();

    depthFirst([{
      type: fromType,
      prior: [] as ConversionPath,
    }], function*({ type, prior }){
      if(prior.some(c => hash(c.fromType) === hash(type)))
        return;

      initialComposed.add([fromType, type], prior);

      for(const conversion of this.registered)
        if(this.similar(type, conversion.fromType))
          yield {
            prior: [...prior, conversion],
            type: conversion.toType,
          };
    }, this)
  }

  private compose(
    fromType: ProductType,
    toType: ProductType,
  ){
    if(this.composed.has([fromType, toType]))
      return this.composed.get([fromType, toType]) ?? null

    if(!this.initialComposed.hasAny([fromType, toType]))
      this.initialCompose(fromType);

    let bestPath: ConversionPath | null = null;
    for(const initialPath of this.initialComposed.getAll([fromType, toType])) {
      const path = this.finishPath(fromType, initialPath, toType);
      if(!bestPath || path && this.weight(path) <= this.weight(bestPath))
        bestPath = path;
    }

    this.composed.set([fromType, toType], bestPath)

    return bestPath;
  }

  private similar(a: ProductType, b: ProductType): boolean{
    return hash(a) === hash(b) || (
      a instanceof Array &&
      b instanceof Array &&
      a.length === b.length
    );
  }

  private finishPath(fromType: ProductType, initialPath: ConversionPath | null, toType: ProductType){
    if(!initialPath)
      return initialPath;

    let path = [this.noopConversion(fromType), ...initialPath, this.noopConversion(toType)]

    for(let i = 1; i < path.length; i++) {
      const fromType = path[i - 1].toType;
      const toType = path[i].fromType;

      if(hash(fromType) === hash(toType))
        continue;

      if(
        !(fromType instanceof Array) ||
        !(toType instanceof Array) ||
        fromType.length !== toType.length
      )
        throw new Error("Internal bug in escad; unhandled similar condition")

      if(!fromType.every((f, i) => this.has(f, toType[i])))
        return null;

      path.splice(i, 0, {
        fromType,
        toType,
        convert: async (product: TupleProduct<any[]>) =>
          TupleProduct.create(await Promise.all(product.children.map((p, i) => this.convertProduct(toType[i], p)))),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        weight: fromType.map((f, i) => this.weight(this.composed!.get([f, toType[i]])!)).reduce((a, b) => a + b)
      })
      i++
    }

    return path.slice(1, -1);
  }

  private noopConversion(type: ProductType): ConversionImpl<any, any>{
    return {
      fromType: type,
      toType: type,
      convert: x => x,
      weight: 0,
    };
  }

  private weight(path: ConversionPath){
    return path.reduce((a, b) => a + b.weight, 0)
  }

  async convertProduct<T extends Product, F extends ConvertibleTo<T> & Product>(
    toType: ProductType<T>,
    from: F,
  ): Promise<T>{
    const fromType = getProductType(from);

    this.compose(fromType, toType);
    const conversions = this.composed.get([fromType, toType]);

    // log.productType(fromType);
    // log.productType(toType);
    // console.log(conversions?.map(formatConversion), conversions?.length);

    if(!conversions)
      throw new Error(`Could not find path to convert product type ${hash(fromType)} to ${hash(toType)}`);

    let prevProducts: (Product | null)[] = [from];
    let currentProduct: Product = from;

    main: for(let i = 0; i < conversions.length; i++) {
      for(let j = conversions.length - 1; j >= i; j--) {
        const { toType } = conversions[j]
        const result = await this.artifactManager.lookupRef(
          [this.artifactStoreId, toType, currentProduct],
          this.excludeStores
        );
        if(!result || !Product.isProduct(result)) continue;
        currentProduct = result;
        prevProducts.push(...Array(j - i + 1).fill(null));
        i = j;
        continue main;
      }
      currentProduct = await conversions[i].convert(currentProduct);
      prevProducts.push(currentProduct);
      for(let k = 0; k < i; k++) {
        const { toType } = conversions[i];
        const fromProduct = prevProducts[k];
        if(!fromProduct) continue;
        await this.artifactManager.storeRef([this.artifactStoreId, toType, fromProduct], currentProduct);
      }
    }

    return currentProduct as T;
  }

  // convertElementish<A extends Product, B extends ConvertibleTo<A> & Product>(
  //   a: ProductType<A>,
  //   b: Elementish<B>,
  // ): Elementish<A>{
  //   return b;
  // }

}

export const conversionRegistry = new ConversionRegistry(artifactManager);
