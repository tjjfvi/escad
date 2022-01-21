import { Id } from "../mod.ts";

describe("Id.create", () => {
  test("@escad/core/Test/test0", () => {
    expect(Id.create(import.meta.url, "@escad/core", "Test", "test0"))
      .toMatchSnapshot();
  });
  test("Throws on duplicate", () => {
    expect(() => Id.create(import.meta.url, "@escad/core", "Test", "test0"))
      .toThrowErrorMatchingSnapshot();
  });
  test("Throws on incorrect package name", () => {
    expect(() =>
      Id.create(import.meta.url, "@escad/incorrect", "Test", "test0")
    ).toThrowErrorMatchingSnapshot();
  });
});
