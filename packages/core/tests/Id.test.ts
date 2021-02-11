import { Id } from "../src"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const version = require("../package.json").version;

describe("Id.create", () => {
  test("@escad-core-0-test0", () => {
    expect(Id.create(__filename, "@escad/core", "0", "test0")).toMatchSnapshot();
  })
  test("Throws on duplicate", () => {
    expect(() => Id.create(__filename, "@escad/core", "0", "test0")).toThrowErrorMatchingSnapshot();
  })
  test("Throws on incorrect package name", () => {
    expect(() => Id.create(__filename, "@escad/incorrect", "0", "test0")).toThrowErrorMatchingSnapshot();
  })
  test("Throws on incorrect package version", () => {
    expect(() => Id.create(__filename, "@escad/core", "vIncorrect", "test0")).toThrowErrorMatchingSnapshot();
  })
  test("Succeeds on correct package version", () => {
    expect(Id.create(__filename, "@escad/core", version, "test0")).toMatchObject({
      version,
    })
  })
})

describe("Id.get", () => {
  test("Gets an id", () => {
    const id = Id.create(__filename, "@escad/core", "0", "test1");
    expect(Id.get(id)).toBe(id);
    expect(Id.get(id.full)).toBe(id);
  });
  test("Returns undefined for missing", () => {
    expect(Id.get("@escad-core-0-missingno")).toBe(undefined);
  });
})

describe("Id.isId", () => {
  const id = Id.create(__filename, "@escad/core", "0", "test2");
  test("Matches an id", () => {
    expect(Id.isId(id)).toBe(true);
  })
  test("Matches a shallow copy", () => {
    expect(Id.isId({ ...id })).toBe(true);
  })
})

describe("Id.equal", () => {
  const a = Id.create(__filename, "@escad/core", "0", "test3-a")
  const b = Id.create(__filename, "@escad/core", "0", "test3-b")
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
