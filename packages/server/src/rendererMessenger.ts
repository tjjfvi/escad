
import { createMessenger } from "@escad/messages"
import { ServerRendererMessenger } from "@escad/protocol"
import { Connection } from "@escad/messages";

export const createServerRendererMessenger = (
  connection: Connection<unknown>,
  artifactsDir: string,
): ServerRendererMessenger => {
  const messenger: ServerRendererMessenger = createMessenger({
    async getArtifactsDir(){
      return artifactsDir;
    }
  }, connection)
  return messenger;
}
