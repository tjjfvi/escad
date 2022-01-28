import React from "../../react.ts";
import { tsee } from "../../tsee.ts";
import { MultiSet } from "./MultiSet.ts";
import { Callable } from "./Callable.ts";
import { use_ } from "./use_.ts";

type _R = Readable<unknown>;

let cur: _R | null;

export interface Readable<T> {
  (): T;
}

class EE extends tsee.EventEmitter<{
  update: () => void;
}> {}

type Obs<T> = {
  readonly [K in keyof T]: Readable<T[K]>;
};

export class Readable<T> extends Callable<typeof EE>(tsee.EventEmitter) {
  value!: T;
  alive = true;
  symb!: symbol;

  private func: () => T;
  private deps = new Set<_R>();
  private dependents = new Set<_R>();

  constructor(func: () => T) {
    super();
    this.func = func;
    Readable.update(this);
  }

  private addDep(readable: _R) {
    this.deps.add(readable);
    readable.addDependent(this);
  }

  private clearDeps() {
    for (let dep of this.deps) {
      dep.removeDependent(this);
    }
    this.deps.clear();
  }

  private addDependent(readable: _R) {
    this.dependents.add(readable);
  }

  private removeDependent(readable: _R) {
    this.dependents.delete(readable);
  }

  private update(tbu = new MultiSet<_R>(), uip: ReadonlySet<_R> = new Set()) {
    if (!this.alive) {
      throw new Error("Called .update on dead Readable");
    }

    if (uip.has(this)) {
      console.warn("Circular dependency; using old value");
      return {
        readable: this,
        register: () => void 0,
        update: () => void 0,
      };
    }

    let uip2 = new Set(uip);
    uip2.add(this);

    let { dependents } = this;

    let subs = new Set(function* () {
      for (let dependent of new Set(dependents)) {
        yield dependent.update(tbu, uip2);
      }
    }());

    return {
      readable: this,
      register: () => {
        tbu.add(this);

        if (tbu.has(this) === 1) {
          for (let sub of subs) {
            sub.register();
          }
        }
      },
      update: () => {
        this.clearDeps();
        let lastCur = cur;
        cur = this;
        this.value = this.func();
        this.symb = Symbol();
        cur = lastCur;
        this.emit("update");

        for (let sub of new Set(subs)) {
          tbu.remove(sub.readable);
          if (!tbu.has(sub.readable)) {
            sub.update();
          }
        }
      },
    };
  }

  static update(r: _R) {
    let obj = r.update();
    obj.register();
    obj.update();
  }

  get = () => {
    if (!this.alive) {
      throw new Error("Called .get on dead Readable");
    }
    if (cur) {
      cur.addDep(this);
    }
    return this.value;
  };

  inn(f: ((v: NonNullable<T>) => unknown)) {
    if (!this.alive) {
      throw new Error("Called .inn on dead Readable");
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (this.value) f(this.value!);
    return this;
  }

  tap(f: ((v: T) => unknown)) {
    if (!this.alive) {
      throw new Error("Called .tap on dead Readable");
    }
    f(this.value);
    return this;
  }

  use() {
    const [, setState] = React.useState({});
    const lastSymb = React.useRef(this.symb);
    lastSymb.current = this.symb;

    const handler = () => {
      if (lastSymb.current !== this.symb) {
        setTimeout(() => setState({}), 0);
      }
    };

    React.useEffect(() => {
      this.on("update", handler);
      return () => void this.removeListener("update", handler);
    }, []);

    return this;
  }

  kill() {
    this.clearDeps();
    this.alive = false;
    // @ts-ignore
    delete this.value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  __f(...a: any[]): any {
    a;
    return this.get();
  }

  private _obs?: Obs<T>;

  get obs() {
    return this._obs = this._obs || new Proxy({}, {
      // @ts-ignore
      get: (t, k) => k in t ? t[k] : t[k] = new Readable(() => this.get()?.[k]),
    }) as unknown as Obs<T>;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setCur(r: Readable<any>) {
    r.clearDeps();
    let oldCur = cur;
    cur = r;
    return () => {
      cur = oldCur;
    };
  }
}

export function readable<T>(func: () => T) {
  return new Readable(func);
}

export const useReadable = use_(readable);

export type R<T> = Readable<T>;
