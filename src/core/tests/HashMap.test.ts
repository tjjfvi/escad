
import { HashMap } from "../src"

test("HashMap", () => {
  const map = new HashMap()
  expect(map.has({ a: 1 })).toBe(false)
  expect(map.get({ a: 1 })).toBe(undefined)
  map.set({ a: 1 }, 5)
  expect(map.has({ a: 1 })).toBe(true)
  expect(map.get({ a: 1 })).toBe(5)
  map.clear()
  expect(map.has({ a: 1 })).toBe(false)
  expect(map.get({ a: 1 })).toBe(undefined)
  map.set({ a: 1 }, "x")
  map.set({ a: 1 }, "x")
  map.set({ b: 1 }, "42")
  expect(map.get({ a: 1 })).toBe("x")
  expect(map.get({ b: 1 })).toBe("42")
  expect(map.size).toBe(2)
  expect([...map.values()]).toEqual(["x", "42"])
  map.delete({ b: 1 })
  expect(map.get({ b: 1 })).toBe(undefined)
  expect(map.size).toBe(1)
})
