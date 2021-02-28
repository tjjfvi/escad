import { Id } from "../src"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require("../package.json").version;

describe("Id.create", () => {
  test("@escad-core-0-test0", () => {
    expect(Id.create(__filename, "@escad/core", "Test", "test0", "0")).toMatchSnapshot();
  })
  test("Throws on duplicate", () => {
    expect(() => Id.create(__filename, "@escad/core", "Test", "test0", "0")).toThrowErrorMatchingSnapshot();
  })
  test("Throws on incorrect package name", () => {
    expect(() => Id.create(__filename, "@escad/incorrect", "Test", "test0", "0")).toThrowErrorMatchingSnapshot();
  })
  test("Throws on incorrect package version", () => {
    expect(() => Id.create(__filename, "@escad/core", "Test", "test0", "vIncorrect")).toThrowErrorMatchingSnapshot();
  })
  test("Succeeds on correct package version", () => {
    expect(Id.create(__filename, "@escad/core", "Test", "test0", version)).toMatchObject({
      version,
    })
  })
})

describe("Id.isId", () => {
  const id = Id.create(__filename, "@escad/core", "Test", "test2", "0");
  test("Matches an id", () => {
    expect(Id.isId(id)).toBe(true);
  })
  test("Matches a shallow copy", () => {
    expect(Id.isId({ ...id })).toBe(true);
  })
})

describe("Id.equal", () => {
  const a = Id.create(__filename, "@escad/core", "Test", "test3-a", "0")
  const b = Id.create(__filename, "@escad/core", "Test", "test3-b", "0")
  test("Matches equal ids", () => {
    expect(Id.equal(a, a)).toBe(true);
  });
  test("Matches shallow copy", () => {
    expect(Id.equal(a, { ...a })).toBe(true);
  });
  test("Doesn't match unequal ids", () => {
    expect(Id.equal(a, b)).toBe(false);
  });
})
