
export function dedupeAsyncIterable<T>(iterableFn: () => AsyncIterable<T>){
  let iterator: AsyncIterator<T> | undefined
  let curPromise: Promise<IteratorResult<T>> | undefined
  const dedupedIterable = {
    [Symbol.asyncIterator]: () => ({
      next: () => {
        iterator ??= iterableFn()[Symbol.asyncIterator]()
        curPromise ??= iterator.next().finally(() => curPromise = undefined)
        return curPromise
      },
    }),
  }
  const fn = async function*(){
    for await (const value of dedupedIterable)
      yield value
  }
  fn[Symbol.asyncIterator] = fn
  return fn
}
