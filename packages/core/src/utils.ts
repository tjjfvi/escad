
type Values<T extends {}, K extends keyof T = keyof T> = T[K];

type Tuplize<T extends {}[]> = Pick<T, Exclude<keyof T, Extract<keyof {}[], string> | number>>;

type _OneOf<T extends {}> = { [L in Values<{ [K in keyof T]: keyof T[K] }>]?: Extract<Values<T>, Record<L, unknown>>[L] };

// type _OneOf<T extends {}> = Values<{
//   [K in keyof T]: T[K] & {
//     [M in Values<{ [L in keyof Omit<T, K>]: keyof T[L] }>]?: undefined
//   }
// }>;

export type OneOf<T extends {}[]> = _OneOf<Tuplize<T>>;

// export type OneOf<T extends {}[]> = T[number];
