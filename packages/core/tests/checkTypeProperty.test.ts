import { checkTypeProperty } from "../dist"

const checkTypePropertyTest = checkTypeProperty("test");

test("Matches valid", () => {
  expect(checkTypePropertyTest({ type: "test" })).toBe(true)
})

test("Doesn't match non-object", () => {
  expect(checkTypePropertyTest(5)).toBe(false)
  expect(checkTypePropertyTest("string")).toBe(false)
  expect(checkTypePropertyTest(() => {})).toBe(false)
})

test("Doesn't match null", () => {
  expect(checkTypePropertyTest(null)).toBe(false)
})

test("Doesn't match missing `type` property", () => {
  expect(checkTypePropertyTest({})).toBe(false)
  expect(checkTypePropertyTest({ type: undefined })).toBe(false)
})

test("Doesn't match wrong `type` property", () => {
  expect(checkTypePropertyTest({ type: "wrong" })).toBe(false)
})
