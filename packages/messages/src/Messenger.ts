
export type MessengerShape = Partial<Record<string, (...args: any[]) => Promise<unknown> | AsyncIterable<unknown>>>
export type MessengerImpl<F extends MessengerShape, T extends MessengerShape> = F & ThisType<Messenger<F, T>>
export type Messenger<F extends MessengerShape, T extends MessengerShape> = F & { req: T, destroy: () => void }
