
import meshChainables from "@escad/mesh";
import csgChainables from "@escad/csg";
import solidsChainables from "@escad/solids";
import transformChainables from "@escad/transform";

const chainables: (
  & typeof meshChainables
  & typeof csgChainables
  & typeof solidsChainables
  & typeof transformChainables
) = {
  ...meshChainables,
  ...csgChainables,
  ...solidsChainables,
  ...transformChainables,
}

export default chainables;
