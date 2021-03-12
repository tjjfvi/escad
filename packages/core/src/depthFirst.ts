
interface LinkedList<T> {
  value: T,
  next?: LinkedList<T>,
}

export class Stack<T> {

  private list: LinkedList<T> | undefined;

  constructor(values: Iterable<T>){
    for(const value of values)
      this.push(value)
  }

  push(value: T){
    this.list = { value, next: this.list }
    return this
  }

  pop(){
    const value = this.list?.value
    this.list = this.list?.next
    return value
  }

  *[Symbol.iterator](){
    while(this.list) {
      const value = this.list.value
      this.list = this.list.next
      yield value
    }
  }

}

export function depthFirst<T, This = undefined>(
  roots: Iterable<T>,
  children: (this: This, value: T) => Iterable<T>,
  thisVal: This = undefined as never,
){
  const stack = new Stack(roots)
  for(const node of stack)
    for(const child of children.call(thisVal, node))
      stack.push(child)
}
