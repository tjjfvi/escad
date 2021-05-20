import { BufferInfo } from "./BufferInfo"

export type Serialization = Generator<Uint8Array, void, void>
export type Deserialization<T> = Generator<void, T, Uint8Array>

type SerializationContext = {
  chunkSize: number,
  chunk: BufferInfo,
  offset: number,
}

type DeserializationContext = {
  chunks: BufferInfo[],
  totalLength: number,
  offset: number,
}

export class Serializer<T> {

  private static serializationContext?: SerializationContext
  private static deserializationContext?: DeserializationContext

  s: (value: T) => Serialization
  d: () => Deserialization<T>

  constructor({ s, d }: { s: (value: T) => Serialization, d: () => Deserialization<T> }){
    this.s = s
    this.d = d
  }

  *serialize(value: T, { chunkSize = 2 ** 16 }: { chunkSize?: number } = {}): Generator<Uint8Array, void, void>{
    const context: SerializationContext = {
      chunkSize,
      chunk: BufferInfo.create(new Uint8Array(chunkSize)),
      offset: 0,
    }

    const oldContext = Serializer.serializationContext
    Serializer.serializationContext = context
    const iterator = this.s(value)
    Serializer.serializationContext = oldContext

    while(true) {
      const oldContext = Serializer.serializationContext
      Serializer.serializationContext = context
      const result = iterator.next()
      Serializer.serializationContext = oldContext
      if(!result.done) yield result.value
      else break
    }

    yield Serializer._finishSerializeChunk(context)
  }

  static *write(length: number, fn: (buffer: BufferInfo) => void): Serialization{
    const context = Serializer.serializationContext
    if(!context)
      throw new Error("Serializer.write iterator cannot be called outside of Serializer#serialize")
    if(context.offset + length <= context.chunk.buffer.byteLength) {
      context.chunk.offset = context.offset
      context.offset += length
      fn(context.chunk)
      return
    }
    yield this._finishSerializeChunk(context)
    context.offset = length
    context.chunk = BufferInfo.create(new Uint8Array(Math.max(context.chunkSize, length)), 0)
    fn(context.chunk)
  }

  private static _finishSerializeChunk(context: SerializationContext){
    return new Uint8Array(context.chunk.buffer.buffer, context.chunk.buffer.byteOffset, context.offset)
  }

  *deserialize(): Generator<void, T, Uint8Array | undefined>{
    const context: DeserializationContext = {
      chunks: [],
      totalLength: 0,
      offset: 0,
    }

    const oldContext = Serializer.deserializationContext
    Serializer.deserializationContext = context
    const iterator = this.d()
    let result = iterator.next()
    Serializer.deserializationContext = oldContext

    while(!result.done) {
      const nextValue = yield undefined
      if(!nextValue)
        throw new Error("Unexpected end of input")
      const oldContext = Serializer.deserializationContext
      Serializer.deserializationContext = context
      result = iterator.next(nextValue)
      Serializer.deserializationContext = oldContext
    }

    if(context.totalLength > context.offset || !!(yield undefined))
      throw new Error("Unexpected extraneous data")

    return result.value
  }

  static *read<T>(length: number, fn: (buffer: BufferInfo) => T): Deserialization<T>{
    const context = Serializer.deserializationContext
    if(!context)
      throw new Error("Serializer.read iterator cannot be called outside of Serializer#deserialize")
    while(context.totalLength - context.offset < length) {
      const chunk = yield undefined
      context.chunks.push(BufferInfo.create(chunk))
      context.totalLength += chunk.length
    }
    if(length <= context.chunks[0].buffer.byteLength - context.offset) {
      context.chunks[0].offset = context.offset
      context.offset += length
      return fn(context.chunks[0])
    }
    let buffer = new Uint8Array(length)
    for(let chunkInd = 0, filledLength = 0; true; chunkInd++) {
      const chunk = context.chunks[chunkInd]
      const fullChunkLength = chunk.buffer.byteLength
      if(fullChunkLength <= context.offset) {
        context.offset -= fullChunkLength
        context.totalLength -= fullChunkLength
        continue
      }
      const chunkBuffer = new Uint8Array(
        chunk.buffer.buffer,
        chunk.buffer.byteOffset + context.offset,
        Math.min(fullChunkLength - context.offset, length - filledLength),
      )
      buffer.set(chunkBuffer, filledLength)
      filledLength += chunkBuffer.length
      if(filledLength >= length) {
        context.chunks.splice(0, chunkInd)
        context.offset += chunkBuffer.byteLength
        return fn(BufferInfo.create(buffer))
      }
      context.offset = 0
      context.totalLength -= fullChunkLength
    }
  }

  deserializeStream(stream: Iterable<Uint8Array>){
    const writable = this.deserialize()

    let nextValue = undefined
    let result = writable.next()
    let streamIterator = stream[Symbol.iterator]()

    while(!result.done) {
      const streamResult = streamIterator.next()
      nextValue = streamResult.done ? undefined : streamResult.value
      result = writable.next(nextValue)
    }

    return result.value
  }

  // istanbul ignore next: Same logic as above
  async deserializeAsyncStream(stream: AsyncIterable<Uint8Array>){
    const writable = this.deserialize()

    let nextValue = undefined
    let result = writable.next()
    let streamIterator = stream[Symbol.asyncIterator]()

    while(!result.done) {
      const streamResult = await streamIterator.next()
      nextValue = streamResult.done ? undefined : streamResult.value
      result = writable.next(nextValue)
    }

    return result.value
  }

}

