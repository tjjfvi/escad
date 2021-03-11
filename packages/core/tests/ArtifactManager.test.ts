
import { ArtifactManager, ArtifactStore, Hash, Id } from "../src";

const createArtifactStoreMock = (name: string, output: unknown[], returnValues: unknown[]): ArtifactStore => ({
  lookupRaw: async hash => {
    output.push([name, "lookupRaw", hash])
    return returnValues.pop() ?? null
  },
  lookupRef: async loc => {
    output.push([name, "lookupRef", loc])
    return returnValues.pop() ?? null
  },
  storeRaw: async (hash, buffer) => {
    output.push([name, "storeRaw", hash, buffer.toString("base64")])
  },
  storeRef: async (loc, hash) => {
    output.push([name, "storeRef", loc, hash])
  },
})

test("", async () => {
  const artifactManager = new ArtifactManager();
  const output = [] as unknown[]
  const store0 = createArtifactStoreMock("store0", output, []);
  const store1 = createArtifactStoreMock("store1", output, [
    Buffer.from(JSON.stringify({ test0: true })),
    Buffer.from(Hash.create({ test1: true }), "hex"),
    { test2: true },
    { test3: true },
  ]);
  const excludeStores = new Set([store1]);
  artifactManager.artifactStores.push({}, store0, store1);
  const artifacts = [
    { isTestArtifact: true },
    Buffer.from(Hash.create("test"), "hex"),
    Id.create(__filename, "@escad/core", "Test", "ArtifactTest", "0"),
  ];
  for(const artifact of artifacts) {
    await artifactManager.lookupRaw(Hash.create(artifact));
    await artifactManager.lookupRaw(Hash.create(artifact), excludeStores);
    await artifactManager.storeRaw(artifact);
    await artifactManager.storeRaw(Promise.resolve(artifact), excludeStores);
  }
  await artifactManager.lookupRef(artifacts);
  await artifactManager.lookupRef(artifacts, excludeStores);
  await artifactManager.storeRef(artifacts, artifacts[0]);
  await artifactManager.storeRef([], artifacts[1], excludeStores);
  expect(output).toMatchSnapshot();
})
