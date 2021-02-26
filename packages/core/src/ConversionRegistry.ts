
import { ProductType, Product } from "./Product";
import { ConvertibleTo, ConversionImpl } from "./Conversions";
import { MultiHashMap } from "./MultiHashMap";
import { hash } from "./hash";
import { artifactManager, ArtifactManager } from "./ArtifactManager";
import { ArtifactStore } from "./ArtifactStore";
import { Id } from "./Id";
import { depthFirst } from "./depthFirst";
import { HashMap } from "./HashMap";
import { TupleProduct, TupleProductType } from "./TupleProduct";
import { ArrayProduct, ArrayProductType } from "./ArrayProduct";
import { UnknownProduct, UnknownProductType } from "./UnknownProduct";

type ConversionPath = ConversionImpl<any, any>[]

export class ConversionRegistry {

  constructor(public artifactManager: ArtifactManager){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  static readonly artifactStoreId = Id.create(__filename, "@escad/core", "0", "ConversionRegistryArifactStore");
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, toType, product]) => {
      if(!Id.isId(id) || !Id.equal(id, ConversionRegistry.artifactStoreId)) return null;
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
  ): void{
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
        if(this.maybeImplicitlyConvertibleTo(type, conversion.fromType))
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

    let bestPath = this.finishPath(fromType, [], toType);
    for(const initialPath of this.initialComposed.getAll([fromType, toType])) {
      const path = this.finishPath(fromType, initialPath, toType);
      if(!bestPath || path && this.weight(path) <= this.weight(bestPath))
        bestPath = path;
    }

    this.composed.set([fromType, toType], bestPath)

    return bestPath;
  }

  private maybeImplicitlyConvertibleTo(a: ProductType, b: ProductType): boolean{
    return hash(a) === hash(b) || (
      TupleProductType.isTupleProductType(a) &&
      TupleProductType.isTupleProductType(b) &&
      a.elementTypes.length === b.elementTypes.length
    ) || (
      TupleProductType.isTupleProductType(a) &&
      ArrayProductType.isArrayProductType(b)
    ) || (
      UnknownProductType.isUnknownProductType(b)
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

      if(UnknownProductType.isUnknownProductType(toType)) {
        path.splice(i, 0, {
          fromType,
          toType,
          convert: async (product: Product) =>
            UnknownProduct.create(product),
          weight: 0,
        })
        i++
        continue;
      }

      if(TupleProductType.isTupleProductType(fromType) && ArrayProductType.isArrayProductType(toType)) {
        path.splice(i, 0, {
          fromType: TupleProductType.create(Array(fromType.elementTypes.length).fill(toType.elementType)),
          toType,
          convert: async (product: TupleProduct) =>
            ArrayProduct.create(product.children),
          weight: 0,
        })
        i--;
        continue;
      }

      if(
        !(TupleProductType.isTupleProductType(fromType)) ||
        !(TupleProductType.isTupleProductType(toType)) ||
        fromType.elementTypes.length !== toType.elementTypes.length
      )
        return null

      if(!fromType.elementTypes.every((f, i) => this.has(f, toType.elementTypes[i])))
        return null;

      path.splice(i, 0, {
        fromType,
        toType,
        convert: async (product: TupleProduct<any[]>) =>
          TupleProduct.create(await Promise.all(product.children.map((p, i) =>
            this.convertProduct(toType.elementTypes[i], p)
          ))),
        weight: fromType.elementTypes.map((f, i) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this.weight(this.composed!.get([f, toType.elementTypes[i]])!)
        ).reduce((a, b) => a + b)
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

  async convertProduct<T extends Product, F extends ConvertibleTo<T>>(
    toType: ProductType<T>,
    from: F,
  ): Promise<T>{
    const fromType = Product.getProductType(from);

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
          [ConversionRegistry.artifactStoreId, toType, currentProduct],
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
        await this.artifactManager.storeRef([ConversionRegistry.artifactStoreId, toType, fromProduct], currentProduct);
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
