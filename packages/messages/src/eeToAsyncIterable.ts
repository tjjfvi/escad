
export async function* eeToAsyncIterable<E, T>(
  ee: { once: (event: E, cb: (value: T) => void) => void },
  event: E
){
  while(true)
    yield await new Promise<T>(res => ee.once(event, res));
}
