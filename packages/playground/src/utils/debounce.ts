
export const debounce = (fn: () => void, amount: number) => {
  let timer: number | null = null;
  return () => {
    if(timer) clearTimeout(timer)
    timer = setTimeout(fn, amount) as any as number
  }
}
