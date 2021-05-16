
import { ProductType, Product } from "./Product"
import { ConvertibleTo, ConversionImpl, ConversionImplish } from "./Conversions"
import { MultiHashMap } from "./MultiHashMap"
import { Hash } from "./Hash"
import { artifactManager, ArtifactManager } from "./ArtifactManager"
import { ArtifactStore } from "./ArtifactStore"
import { Id } from "./Id"
import { HashMap } from "./HashMap"
import { TupleProduct, TupleProductType } from "./TupleProduct"
import { ArrayProduct, ArrayProductType } from "./ArrayProduct"
import { UnknownProduct, UnknownProductType } from "./UnknownProduct"
import { MarkedProduct, MarkedProductType } from "./MarkedProduct"
import { HashProduct, HashProductType } from "./HashProduct"

type ConversionPath = ConversionImpl<any, any>[]

export class ConversionRegistry {

  constructor(public artifactManager: ArtifactManager){
    this.artifactManager.artifactStores.push(this.artifactStore)
  }

  static readonly artifactStoreId = Id.create(__filename, "@escad/core", "ArtifactStore", "ConversionRegistry", "0")
  readonly artifactStore: ArtifactStore = {
    lookupRef: async ([id, toType, product]) => {
      if(!Id.isId(id) || !Id.equal(id, ConversionRegistry.artifactStoreId)) return null
      if(!Product.isProduct(product)) return null
      return this.convertProduct(toType as ProductType, product)
    },
  }

  readonly excludeStores: ReadonlySet<ArtifactStore> = new Set([this.artifactStore])

  private readonly registered = new Set<ConversionImpl<any, any>>()
  private initialComposed = new MultiHashMap<[ProductType, ProductType], ConversionPath>()
  private composed = new HashMap<[ProductType, ProductType], ConversionPath | null>()

  register<F extends Product, T extends Product>(
    conversion: ConversionImplish<F, T>,
  ): void{
    this.initialComposed.clear()
    this.composed.clear()
    this.registered.add({
      ...conversion,
      fromType: ProductType.fromProductTypeish(conversion.fromType),
      toType: ProductType.fromProductTypeish(conversion.toType),
    })
  }

  async has(a: ProductType, b: ProductType){
    return !!(await this.compose(a, b))
  }

  listAll(): Iterable<ConversionImpl<any, any>>{
    return this.registered.values()
  }

  private async initialCompose(fromType: ProductType){
    const initialComposed = this.initialComposed ??= new MultiHashMap()

    const process = async (type: ProductType, prior: ConversionPath, check?: Promise<boolean>) => {
      if(!(await check ?? true)) return

      if(prior.some(c => Hash.equal(c.fromType, type)))
        return

      initialComposed.add([fromType, type], prior)

      const promises = []

      for(const conversion of this.registered)
        promises.push(process(
          conversion.toType,
          [...prior, conversion],
          this.maybeImplicitlyConvertibleTo(type, conversion.fromType),
        ))

      await Promise.all(promises)
    }

    await process(fromType, [])
  }

  private async compose(
    fromType: ProductType,
    toType: ProductType,
  ){
    if(this.composed.has([fromType, toType]))
      return this.composed.get([fromType, toType]) ?? null

    if(!this.initialComposed.hasAny([fromType, toType]))
      await this.initialCompose(fromType)

    let bestPath = await this.finishPath(fromType, [], toType)
    for(const initialPath of this.initialComposed.getAll([fromType, toType])) {
      const path = await this.finishPath(fromType, initialPath, toType)
      if(!bestPath || path && this.weight(path) <= this.weight(bestPath))
        bestPath = path
    }

    this.composed.set([fromType, toType], bestPath)

    return bestPath
  }

  private async maybeImplicitlyConvertibleTo(a: ProductType, b: ProductType): Promise<boolean>{
    return !!(await this.finishPath(a, [], b, async () => true))
  }

  private async finishPath(
    fromType: ProductType,
    initialPath: ConversionPath | null,
    toType: ProductType,
    has: ConversionRegistry["has"] = this.has.bind(this),
  ){
    if(!initialPath)
      return null

    let path = [this.noopConversion(fromType), ...initialPath, this.noopConversion(toType)]

    for(let i = 1; i < path.length; i++) {
      const fromType = path[i - 1].toType
      const toType = path[i].fromType

      if(Hash.equal(fromType, toType))
        continue

      const part = await this._finishPathSegment(fromType, toType, has)
      if(!part) return null

      const id = Hash.create([part.fromType, part.toType])

      path.splice(i, 0, { ...part, id })
      i--
    }

    return path.slice(1, -1)
  }

  private async _finishPathSegment(
    fromType: ProductType,
    toType: ProductType,
    has: ConversionRegistry["has"],
  ): Promise<Omit<ConversionImpl<any, any>, "id"> | null>{
    if(HashProductType.isHashProductType(fromType)) {
      const toType2 = await this.artifactManager.lookupRaw(fromType.productType)
      if(!toType2) throw new Error("Could not resolve HashProductType")
      return {
        fromType,
        toType: toType2,
        convert: async ({ hash }: HashProduct) => {
          const product = await this.artifactManager.lookupRaw(hash)
          if(!product || !Product.isProduct(product, toType))
            throw new Error("Could not resolve HashProduct")
          return product
        },
        weight: 0,
      }
    }

    if(HashProductType.isHashProductType(toType)) {
      const fromType2 = await this.artifactManager.lookupRaw(toType.productType)
      if(!fromType2) throw new Error("Could not resolve HashProductType")
      return {
        fromType: fromType2,
        toType,
        convert: async (product: Product) =>
          await HashProduct.fromProduct(product, this.artifactManager),
        weight: 0,
      }
    }

    if(UnknownProductType.isUnknownProductType(toType))
      return {
        fromType,
        toType,
        convert: async (product: Product) =>
          UnknownProduct.create(product),
        weight: 0,
      }

    if(
      MarkedProductType.isMarkedProductType(fromType)
      && MarkedProductType.isMarkedProductType(toType)
      && Id.equal(fromType.marker, toType.marker)
      && await has(fromType.child, toType.child)
    )
      return {
        fromType,
        toType,
        convert: async (product: MarkedProduct) =>
          MarkedProduct.create(product.marker, await this.convertProduct(toType.child, product.child)),
        weight: this.weight(this.composed?.get([fromType.child, toType.child])),
      }

    if(
      TupleProductType.isTupleProductType(fromType)
      && ArrayProductType.isArrayProductType(toType)
    )
      return {
        fromType: TupleProductType.create(Array(fromType.elementTypes.length).fill(toType.elementType)),
        toType,
        convert: async (product: TupleProduct) =>
          ArrayProduct.create(product.children),
        weight: 0,
      }

    if(
      ArrayProductType.isArrayProductType(fromType)
      && ArrayProductType.isArrayProductType(toType)
      && await has(fromType.elementType, toType.elementType)
    )
      return {
        fromType,
        toType,
        convert: async (product: ArrayProduct) =>
          ArrayProduct.create(await Promise.all(product.children.map(p =>
            this.convertProduct(toType.elementType, p),
          ))),
        weight: this.weight(this.composed?.get([fromType.elementType, toType.elementType])),
      }

    if(
      TupleProductType.isTupleProductType(fromType)
      && TupleProductType.isTupleProductType(toType)
      && fromType.elementTypes.length === toType.elementTypes.length
      && (await Promise.all(fromType.elementTypes.map((f, i) => has(f, toType.elementTypes[i])))).every(x => x)
    )
      return {
        fromType,
        toType,
        convert: async (product: TupleProduct<any[]>) =>
          TupleProduct.create(await Promise.all(product.children.map((p, i) =>
            this.convertProduct(toType.elementTypes[i], p),
          ))),
        weight: fromType.elementTypes.map((f, i) =>
          this.weight(this.composed?.get([f, toType.elementTypes[i]])),
        ).reduce((a, b) => a + b),
      }

    return null
  }

  private noopConversion(type: ProductType): ConversionImpl<any, any>{
    return {
      fromType: type,
      toType: type,
      convert: x => x,
      weight: 0,
      id: Hash.create([type, type]),
    }
  }

  private weight(path: ConversionPath | null | undefined){
    return path?.reduce((a, b) => a + b.weight, 0) ?? Infinity
  }

  async convertProduct<T extends Product, F extends ConvertibleTo<T>>(
    toType: ProductType<T>,
    from: F,
  ): Promise<T>{
    const fromType = Product.getProductType(from)

    await this.compose(fromType, toType)
    const conversions = this.composed.get([fromType, toType])

    // log.productType(fromType);
    // log.productType(toType);
    // console.log(conversions?.map(formatConversion), conversions?.length);

    if(!conversions)
      throw new Error(`Could not find path to convert product type ${Hash.create(fromType)} to ${Hash.create(toType)}`)

    let prevProducts: (Product | null)[] = [from]
    let currentProduct: Product = from

    main: for(let i = 0; i < conversions.length; i++) {
      for(let j = conversions.length - 1; j >= i; j--) {
        const { toType } = conversions[j]
        const result = await this.artifactManager.lookupRef(
          [ConversionRegistry.artifactStoreId, toType, currentProduct],
          this.excludeStores,
        )
        if(!result || !Product.isProduct(result)) continue
        currentProduct = result
        prevProducts.push(...Array(j - i + 1).fill(null))
        i = j
        continue main
      }
      currentProduct = await conversions[i].convert(currentProduct)
      prevProducts.push(currentProduct)
      for(let k = 0; k < i; k++) {
        const { toType } = conversions[i]
        const fromProduct = prevProducts[k]
        if(!fromProduct) continue
        await this.artifactManager.storeRef([ConversionRegistry.artifactStoreId, toType, fromProduct], currentProduct)
      }
    }

    return currentProduct as T
  }

}

export const conversionRegistry = new ConversionRegistry(artifactManager)
