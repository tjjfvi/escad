import { ScopedId } from "./Id.ts";
import {
  ContextStack,
  contextStack as defaultContextStack,
} from "./ContextStack.ts";

export class Context<T> {
  constructor(
    public id: ScopedId<"Context">,
    public defaultValue: T,
    public contextStack: ContextStack = defaultContextStack,
  ) {}

  get(): T {
    return this.contextStack.get(this.id) as T ?? this.defaultValue;
  }

  set(value: T) {
    this.contextStack.set(this.id, value);
  }

  wrap<U>(value: T, fn: () => U): U {
    return this.contextStack.wrap(() => {
      this.set(value);
      return fn();
    });
  }
}
