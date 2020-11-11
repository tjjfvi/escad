import { ProductType, getProductType, Product } from "./Product";
import { Conversion, ConvertibleTo, ConversionImpl } from "./Conversions";
import { Elementish } from "./Element";
import { Hex } from "./hex";
import { MultiMap } from "./MultiMap";
import { hash } from "./hash";
import { DeepMap } from "./DeepMap";

export class ConversionRegistry {

  private registered = new MultiMap<Hex, ConversionImpl<any, any>>();
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

  private compose<F extends Product>(
    fromType: ProductType<F>,
  ): DeepMap<Hex, Hex, ConversionImpl<any, any>[]>{
    interface Task {
      fromType: ProductType,
      type: ProductType,
      prior: ConversionImpl<any, any>[],
      deepIndex: number,
    }

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
      const { fromType, type, prior, deepIndex } = task;
      const typeHash = hash(type);
      const taskId = hash([fromType, type]);

      if(done.has(taskId))
        continue;

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

        for(const conversion of this.registered.getAll(hash(subtype)))
          todo.unshift({
            fromType,
            prior: [...prior, conversion],
            type: conversion.toType,
            deepIndex: 0,
          });
      }

      for(let index = -1; index < prior.length; index++)
        this.composed.set(hash(prior[index]?.fromType ?? fromType), typeHash, prior)

      if(this.composed.hasAny(typeHash))
        if(hash(fromType) !== typeHash)
          for(const conversions of this.composed.getAll(typeHash).values())
            todo.unshift({
              fromType,
              prior: [...prior, ...conversions],
              type: conversions[conversions.length - 1].toType,
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

      done.add(taskId);
    }

    return this.composed;
  }

  get<A extends Product, B extends Product>(
    a: ProductType<A>,
    b: ProductType<B>,
  ): Conversion<A, B> | undefined{
    a; b;
    // to do
    return null as any;
  }

  async convertProduct<T extends Product, F extends ConvertibleTo<T> & Product>(
    toType: ProductType<T>,
    from: F,
  ): Promise<T>{
    const fromType = getProductType(from);

    if(!this.composed?.hasAny(hash(fromType)))
      this.composed = this.compose<F>(fromType);

    const conversions = this.composed.get(hash(toType), hash(getProductType(from)));

    if(!conversions)
      throw new Error(`Could not find path to convert product type ${hash(fromType)} to ${hash(toType)}`);

    let currentProduct: Product = from;
    for(const conversion of conversions)
      currentProduct = await conversion.convert(currentProduct);

    return currentProduct as T;
  }

  convertElementish<A extends Product, B extends ConvertibleTo<A> & Product>(
    a: ProductType<A>,
    b: Elementish<B>,
  ): Elementish<A>{
    return b;
  }

}
