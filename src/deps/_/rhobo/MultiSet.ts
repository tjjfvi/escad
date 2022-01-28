export class MultiSet<T> {
  private map = new Map<T, number>();

  add(v: T) {
    this.map.set(v, (this.map.get(v) ?? 0) + 1);
    return this;
  }

  remove(v: T) {
    this.map.set(v, (this.map.get(v) || 1) - 1);
    return this;
  }

  has(v: T): number {
    return this.map.get(v) ?? 0;
  }
}
