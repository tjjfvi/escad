import {
  $wrappedValue,
  ArtifactManager,
  ArtifactStore,
  Hash,
  WrappedValue,
} from "../core/mod.ts";
import { Sha256 } from "../deps/sha256.ts";
import { ClientServerMessenger } from "../server/protocol/server-client.ts";

const lookupRawRetryTimer = 500;

// TODO: wrapRendering
export class ServerArtifactStore implements ArtifactStore {
  constructor(
    private clientServerMessenger: ClientServerMessenger,
    private hashToUrl: (hash: Hash<unknown>) => string,
  ) {}

  async lookupRaw(hash: Hash<unknown>): Promise<WrappedValue<unknown> | null> {
    console.log("lookupRaw", hash);
    const stream = fetchStream(this.hashToUrl(hash));
    const hasher = new Sha256();
    const wrappedStream = (async function* () {
      for await (const part of stream) {
        hasher.update(part);
        yield part;
      }
    })();
    const result = $wrappedValue.deserializeAsync(wrappedStream);
    return result.catch(async () => {
      for await (const {} of wrappedStream); // Finish hashing the stream
      if (hasher.hex() === hash) return null; // The decoding was broken
      await new Promise((r) => setTimeout(r, lookupRawRetryTimer));
      return this.lookupRaw(hash); // Try again
    });
  }

  async lookupRef(loc: readonly unknown[], artifactManager: ArtifactManager) {
    console.log("lookupRef", loc);
    const locHash = await Promise.all(
      loc.map((x) => artifactManager.storeRaw(x)),
    );
    const hash = await this.clientServerMessenger.lookupRef(locHash);
    return this.lookupRaw(hash);
  }
}

async function* fetchStream(input: RequestInfo, init?: RequestInit) {
  const response = await fetch(input, init);
  if (!response.ok) throw new Error(`${response.status}`);
  if (!response.body) throw new Error("Missing body");
  const reader = response.body.getReader();
  while (true) {
    const result = await reader.read();
    if (result.value) yield result.value;
    if (result.done) return;
  }
}
