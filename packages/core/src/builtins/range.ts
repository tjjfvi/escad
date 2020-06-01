
export function range(max: number): number[]
export function range(min: number, max: number): number[]
export function range(min: number, interval: number, max: number): number[]
export function range(...args: [number] | [number, number] | [number, number, number]): number[] {
  let [min, interval, max] =
    args.length === 1 ?
      [0, 1, args[0]] :
      args.length === 2 ?
        [args[0], 1, args[1]] :
        args
  return [...Array(Math.ceil((max - min) / interval))].map((_, i) => i * interval + min);
};
