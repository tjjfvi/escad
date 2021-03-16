
import { useFromProm } from "rhobo"

export const usePromise = <T>(prom: () => Promise<T>): T | null => useFromProm.use(prom).value
