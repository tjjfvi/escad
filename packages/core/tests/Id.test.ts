import { Id } from "../src"

describe("Id.create", () => {
  test("@escad/core/Test/test0", () => {
    expect(Id.create(__filename, "@escad/core", "Test", "test0")).toMatchSnapshot()
  })
  test("Throws on duplicate", () => {
    expect(() => Id.create(__filename, "@escad/core", "Test", "test0")).toThrowErrorMatchingSnapshot()
  })
  test("Throws on incorrect package name", () => {
    expect(() => Id.create(__filename, "@escad/incorrect", "Test", "test0")).toThrowErrorMatchingSnapshot()
  })
})

describe("Id.isId", () => {
  const id = Id.create(__filename, "@escad/core", "Test", "test2")
  test("Matches an id", () => {
    expect(Id.isId(id)).toBe(true)
  })
  test("Matches a shallow copy", () => {
    expect(Id.isId({ ...id })).toBe(true)
  })
})

describe("Id.equal", () => {
  const a = Id.create(__filename, "@escad/core", "Test", "test3-a")
  const b = Id.create(__filename, "@escad/core", "Test", "test3-b")
  test("Matches equal ids", () => {
    expect(Id.equal(a, a)).toBe(true)
  })
  test("Matches shallow copy", () => {
    expect(Id.equal(a, { ...a })).toBe(true)
  })
  test("Doesn't match unequal ids", () => {
    expect(Id.equal(a, b)).toBe(false)
  })
})
