---
sidebar_position: 5
---

# Parameters

Last page, we saw how we could edit the constants in our model to make different
sizes of trees.

However, we had to manually edit the code, which isn't very friendly.

To this end, `escad` supports defining parameters for your model, which can
then be set in the client.

```ts
// highlight-start
// We need to import a few new functions.
import { escad, parametrize, numberParam, booleanParam } from "https://escad.dev/core/mod.ts"
// highlight-end
import "https://escad.dev/3d/register.ts"

// highlight-start
// Now, we define what parameters our model takes.
const paramDef = {
  trunkRadius: numberParam({ defaultValue: 2 }),
  trunkHeight: numberParam({ defaultValue: 16 }),
  leavesRadius: numberParam({ defaultValue: 6 }),
  stretchLeaves: booleanParam({ defaultValue: true }),
}
// highlight-end

// highlight-start
// `parameterize` attaches `paramDef` to your function, so escad knows what parameters it expects.
// (If you're using TypeScript, it also implicitly types `params` based on `paramDef`.)
export default parametrize(paramDef, (params) => {
  // `params` will be an object containing the parameters, as specified by `paramDef`.
  // We'll destructure them so we can use them like we did the constants from before.
  const { trunkRadius, trunkHeight, leavesRadius, stretchLeaves } = params
// highlight-end

// highlight-start
  const leavesStretchFactor = stretchLeaves ? 1.5 : 1
// highlight-end

  const trunk = escad
    .cylinder({ radius: trunkRadius, height: trunkHeight })
    .shiftZ(1)

  const leaves = escad
    .sphere({ radius: leavesRadius })
    .scaleZ(leavesStretchFactor)
    .translateZ(trunkHeight)

  return escad.union({ trunk, leaves })
})
```

You should see a new 'Parameters' panel appear. If you open it, you can tweak
the parameters we just defined. Try making the tree taller by setting 'Trunk
Height' to 20. You should see the model automatically update based on our new
parameters.
