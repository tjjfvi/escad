import { ProductType, Product, FinishedProduct } from "./Product";
import { Conversion, DirectConvertibleFrom, ConvertibleTo } from "./Conversions";
import { StrictLeaf } from "./Leaf";
import { Elementish } from "./Element";
import { ConversionWork } from "./ConversionWork";

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
