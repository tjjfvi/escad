
export async function* zipAsyncIterables<A, B>(a: AsyncIterable<A>, b: AsyncIterable<B>){
  const iterators: [AsyncIterator<A>, AsyncIterator<B>] = [a[Symbol.asyncIterator](), b[Symbol.asyncIterator]()];
  const curValues: [A?, B?] = [undefined, undefined];
  const curPromises: [Promise<void>?, Promise<void>?] = [undefined, undefined];
  const done: [boolean, boolean] = [false, false];
  while(!done[0] || !done[1]) {
    if(!done[0])
      curPromises[0] ??= iterators[0].next().then(result => {
        if(result.done) done[0] = true;
        else curValues[0] = result.value;
        curPromises[0] = undefined;
      })
    if(!done[1])
      curPromises[1] ??= iterators[1].next().then(result => {
        if(result.done) done[1] = true;
        else curValues[1] = result.value;
        curPromises[1] = undefined;
      })
    await Promise.race(curPromises.filter(x => x));
    yield curValues;
  }
}
