import { useEffect, useState } from "react"

export const usePromise = <T>(func: () => Promise<T>, deps: readonly unknown[]) => {
  const [value, setValue] = useState<T>()
  useEffect(() => {
    setValue(undefined)
    func().then(setValue)
  }, deps)
  return value
}
