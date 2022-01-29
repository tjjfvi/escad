import { _format, assertEquals, AssertionError } from "./assert.ts";
import { dirname, fromFileUrl } from "../deps/path.ts";

const writeSnapshots = !!+(Deno.env.get("WRITE_SNAPSHOTS") || "0");

export async function snapshot(
  testUrl: string,
  name: string,
  value: unknown,
) {
  const actual = Deno.inspect(value, {
    depth: Infinity,
    sorted: true,
    trailingComma: true,
    compact: false,
    iterableLimit: Infinity,
  });
  const path = getSnapshotPath(testUrl, name);
  const expected = await fetch(path).then((r) => r.ok ? r.text() : null).catch(
    () => null,
  );
  if (writeSnapshots && path.startsWith("file://") && actual !== expected) {
    await Deno.mkdir(dirname(fromFileUrl(path)), { recursive: true });
    await Deno.writeTextFile(fromFileUrl(path), actual);
    console.log(` (updated ${name || "snapshot"})`);
  } else if (expected === null) {
    throw new AssertionError("Missing snapshot file " + path);
  } else {
    assertEquals(actual, expected);
  }
}

export function getSnapshotPath(testUrl: string, name: string) {
  return new URL(
    `./snapshots/${testUrl.split("/").slice(-1)[0]}${
      name ? `/${name.replace(/[^\w\/$]+/g, "-")}.snap` : ".snap"
    }`,
    testUrl,
  ).toString();
}
