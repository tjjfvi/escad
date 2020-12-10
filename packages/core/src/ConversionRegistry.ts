import { ProductType, getProductType, Product } from "./Product";
import { ConvertibleTo, ConversionImpl } from "./Conversions";
import { Hex } from "./hex";
import { MultiMap } from "./MultiMap";
import { hash } from "./hash";
import { DeepMap } from "./DeepMap";
import { CompoundProduct } from "./CompoundProduct";
import { artifactManager, ArtifactManager } from "./ArtifactManager";
import { ArtifactStore } from "./ArtifactStore";
import { Id } from "./Id";
// import { formatConversion, log } from "./logging";

export namespace ConversionRegistry {
  export interface Task {
    fromType: ProductType,
    type: ProductType,
    prior: ConversionImpl<any, any>[],
    deepIndex: number,
  }
}

export class ConversionRegistry {

  constructor(public artifactManager: ArtifactManager){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  readonly artifactStoreId = Id.create("ConversionRegistryArtifactStore", __filename);
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, toType, product]) => {
      if(id !== this.artifactStoreId) return null;
      if(!Product.isProduct(product)) return null;
      return this.convertProduct(toType as ProductType, product);
    }
  }

  readonly excludeStores: ReadonlySet<ArtifactStore> = new Set([this.artifactStore]);

  private readonly registered = new MultiMap<Hex, ConversionImpl<any, any>>();
  private composed: DeepMap<Hex, Hex, ConversionImpl<any, any>[]> | null = null;

  register<F extends Product, T extends Product>(
    conversion: ConversionImpl<F, T>,
  ): void {
    if(this.composed !== null)
      console.warn("ConversionRegistry.register called late")
    this.composed = null;
    this.registered.add(hash(conversion.fromType), conversion)
  }

  has<A extends Product, B extends Product>(
    a: ProductType<A>,
    b: ProductType<B>,
  ): boolean{
    if(!this.composed?.hasAny(hash(a)))
      this.composed = this.compose<A>(a);

    return this.composed.has(hash(a), hash(b));
  }

  *list<F extends Product>(
    fromType: ProductType<F>,
  ): Iterable<ProductType>{
    if(!this.composed?.hasAny(hash(fromType)))
      this.composed = this.compose<F>(fromType);

    for(const conversionChain of this.composed.getAll(hash(fromType)).values())
      yield conversionChain[conversionChain.length - 1].toType as any;
  }

  listAll(): Iterable<ConversionImpl<any, any>>{
    return this.registered.values();
  }

  private compose<F extends Product>(
    fromType: ProductType<F>,
  ): DeepMap<Hex, Hex, ConversionImpl<any, any>[]>{
    type Task = ConversionRegistry.Task;

    if(!this.composed)
      this.composed = new DeepMap();

    const done = new Set<Hex>();
    const todo: Task[] = [{
      fromType,
      type: fromType,
      prior: [],
      deepIndex: 0,
    }];

    let task: Task | null;
    while((task = todo.shift() ?? null)) {
      // log.conversionRegistryTask(task);
      const { fromType, type, prior, deepIndex } = task;
      const typeHash = hash(type);
      const taskId = hash([fromType, type]);

      if(type instanceof Array && deepIndex < type.length) {
        const subtype = type[deepIndex];

        if(!this.composed.hasAny(hash(subtype))) {
          todo.unshift(task);
          todo.unshift({
            fromType: subtype,
            type: subtype,
            prior: [],
            deepIndex: 0,
          });
          continue;
        }

        for(const [, conversions] of this.composed.getAll(hash(subtype))) {
          // console.log("Found:", conversions.map(formatConversion));
          const toType = type.map((x, i) => i === deepIndex ? conversions[conversions.length - 1]?.toType ?? x : x);
          todo.unshift({
            fromType,
            prior: [...prior, ...conversions.map((c, j, a) => ({
              fromType: type.map((x, i) => i === deepIndex ? a[j - 1]?.toType ?? x : x),
              toType: type.map((x, i) => i === deepIndex ? c.toType : x),
              convert: async (product: CompoundProduct<readonly Product[]>) =>
                CompoundProduct.create(await Promise.all(product.children.map((x, i) =>
                  i === deepIndex ? c.convert(x) : x))
                ),
            }))],
            type: toType,
            deepIndex: deepIndex + 1,
          });
        }
      }

      if(done.has(taskId))
        continue;

      if(this.composed.hasAny(typeHash))
        if(hash(fromType) !== typeHash)
          for(const conversions of this.composed.getAll(typeHash).values())
            todo.unshift({
              fromType,
              prior: [...prior, ...conversions],
              type: conversions[conversions.length - 1]?.toType ?? type,
              deepIndex: 0,
            });
        else;
      else
        for(const conversion of this.registered.getAll(typeHash))
          todo.unshift({
            fromType,
            prior: [...prior, conversion],
            type: conversion.toType,
            deepIndex: 0,
          });

      if(!prior.length)
        this.composed.set(hash(fromType), typeHash, prior);

      for(let index = 0; index < prior.length; index++) {
        const fromHash = hash(prior[index].fromType);
        const existing = this.composed.get(fromHash, typeHash);
        const conversions = prior.slice(index);
        if(existing?.length ?? Infinity > conversions.length)
          this.composed.set(fromHash, typeHash, conversions)
      }

      done.add(taskId);
    }

    return this.composed;
  }

  async convertProduct<T extends Product, F extends ConvertibleTo<T> & Product>(
    toType: ProductType<T>,
    from: F,
  ): Promise<T>{
    const fromType = getProductType(from);

    if(!this.composed?.hasAny(hash(fromType)))
      this.composed = this.compose<F>(fromType);

    const conversions = this.composed.get(hash(fromType), hash(toType));

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
