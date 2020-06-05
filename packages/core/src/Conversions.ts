
import { Product, ProductType, FinishedProduct } from "./Product";
import { StrictLeaf } from "./Leaf";
import { Work } from "./Work";
import { Id } from "./Id";
import { Sha } from "./hash";
import { Elementish } from "./Element";

export interface Conversion<A extends Product<A>, B extends Product<B>> {
  (value: StrictLeaf<A>): StrictLeaf<B>,
  isComposition?: boolean,
}

type Values<T> = T[keyof T];

export type CompiledConversions<C = ConversionsObj> =
  C extends Conversion<any, any> ?
  C :
  Values<{
    [K in keyof C]: CompiledConversions<C[K]>
  }>

type ExtractProduct<T> = T;

export type ConvertibleFrom<T extends Product<T>, E = never> = ExtractProduct<
  T | {
    0: ConvertibleFrom<ExtractProduct<Exclude<DirectConvertibleFrom<T>, T | E>>, T | E>,
  }[T extends any ? 0 : never]
>

export type ConvertibleTo<T extends Product<T>, E = never> = ExtractProduct<
  T | {
    0: ConvertibleTo<ExtractProduct<Exclude<DirectConvertibleTo<T>, T | E>>, T | E>,
  }[T extends any ? 0 : never]
>

export type DirectConvertibleFrom<T extends Product<T>> =
  Extract<CompiledConversions, Conversion<T, any>> extends Conversion<T, infer O> ? Extract<O, Product<O>> : never;

export type DirectConvertibleTo<T extends Product<T>> =
  Extract<CompiledConversions, Conversion<any, T>> extends Conversion<infer O, T> ? Extract<O, Product<O>> : never;

declare global {
  namespace escad {
    interface ConversionsObj { }
  }
}

export type ConversionsObj = escad.ConversionsObj;

export class ConversionRegistry {

    private fromTo = new Map<ProductType, Map<ProductType, Conversion<any, any>>>();
    private toFrom = new Map<ProductType, Map<ProductType, Conversion<any, any>>>();

    register<A extends Product<A>, B extends DirectConvertibleFrom<A>>(
      a: ProductType<A>, b: ProductType<B>, conversion: Conversion<A, B>,
      overwrite = false,
    ){
      if(!overwrite && this.has(a, b)) {
        let oldConversion = this.get(a, b);
        if(!oldConversion?.isComposition)
          throw new Error(`Conversion from ${a.id} to ${b.id} is already registered`);
      }

      this.set(a, b, conversion);

      for(let z of this.getAllTo(a))
        this.setComposition(z, a, b);

      for(let c of this.getAllFrom(a))
        this.setComposition(a, b, c);
    }

    private setComposition<A extends Product<A>, B extends Product<B>, C extends Product<C>>(
      a: ProductType<A>, b: ProductType<B>, c: ProductType<C>
    ){
      if(this.has(a, c) || a.id === c.id)
        return;
      const ab = this.get(a, b);
      const bc = this.get(b, c);
      if(!ab || !bc)
        return;
      let ac: Conversion<A, C> = v => bc(ab(v))
      ac.isComposition = true;
      this.set(a, c, ac);
    }

    private set<A extends Product<A>, B extends Product<B>>(
      a: ProductType<A>, b: ProductType<B>, conversion: Conversion<A, B>
    ){
      const toSub = this.fromTo.get(a) ?? new Map<ProductType, Conversion<any, any>>();
      const fromSub = this.toFrom.get(b) ?? new Map<ProductType, Conversion<any, any>>();
      this.fromTo.set(a, toSub);
      this.toFrom.set(b, fromSub);
      toSub.set(b, conversion);
      fromSub.set(a, conversion);
    }

    has<A extends Product<A>, B extends Product<B>>(
      a: ProductType<A>,
      b: ProductType<B>,
    ){
      return this.fromTo.get(a)?.has(b) ?? false;
    }

    get<A extends Product<A>, B extends Product<B>>(
      a: ProductType<A>,
      b: ProductType<B>,
    ): Conversion<A, B> | undefined{
      return this.fromTo.get(a)?.get(b);
    }

    private getAllTo<P extends Product<P>>(p: ProductType<P>): Iterable<ProductType>{
      return this.toFrom.get(p)?.keys() ?? [];
    }

    private getAllFrom<P extends Product<P>>(p: ProductType<P>): Iterable<ProductType>{
      return this.fromTo.get(p)?.keys() ?? [];
    }

    convertProduct<A extends Product<A>, B extends ConvertibleTo<A> & Product<B>>(
      a: ProductType<A>,
      b: FinishedProduct<B>,
    ): StrictLeaf<A>{
      if(a === b.type)
        return b;
      let conversion = this.get(b.type, a);
      if(!conversion)
        throw new Error(`Could not find conversion from ${a.id} to ${b.type.id}`)
      return conversion(b);
    }

    convertLeaf<A extends Product<A>, B extends ConvertibleTo<A> & Product<B>>(
      a: ProductType<A>,
      b: StrictLeaf<B>,
    ): StrictLeaf<A>{
      if(b instanceof Product)
        return this.convertProduct(a, b);
      return new ConversionWork(a, b);
    }

    convertElementish<A extends Product<A>, B extends ConvertibleTo<A> & Product<B>>(
      a: ProductType<A>,
      b: Elementish<B>,
    ): Elementish<A>{
      return b;
    }

}

export class ConversionWork<T extends Product<T>> extends Work<ConversionWork<T>, T, [ConvertibleTo<T>]> {

  type = ConversionWork;

  static id = new Id("ConversionWork", __filename);

  constructor(public productType: ProductType<T>, child: StrictLeaf<ConvertibleTo<T>>){
    super([child as any]);
    this.freeze();
  }

  clone([child]: [StrictLeaf<ConvertibleTo<T>>]){
    return new ConversionWork(this.productType, child);
  }

  serialize(){
    return this.productType.id.sha.buffer;
  }

  static deserialize<T extends Product<T>>([child]: [any], buffer: Buffer): ConversionWork<T>{
    const id = Id.get(new Sha(buffer));
    if(!id)
      throw new Error("Could not find id referenced in ConversionWork");
    return new ConversionWork(Product.Registry.get(id), child) as any;
  }

  async execute([child]: [FinishedProduct<ConvertibleTo<T>>]){
    return await Product.ConversionRegistry.convertProduct(this.productType, child).process();
  }

}
