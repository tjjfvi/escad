---
sidebar_position: 3
---

# Enough Cubes Already

Let's change it up from simple boxes. Here's a simple tree model:

```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
// highlight-start
  // By putting these constants in variables, we can easily reuse them.
  // Later, if we want to tweak the model, we only have to update it one place.
  const trunkRadius = 2
  const trunkHeight = 16
  const leavesRadius = 6
  const leavesStretchFactor = 1.5

  // Here, we save parts of the model in variables, to make it clearer what's happening.
  const trunk = escad
    .cylinder({ radius: trunkRadius, height: trunkHeight })
    .shiftZ(1)       // we use `trunkHeight` here ^

  const leaves = escad
    .sphere({ radius: leavesRadius })
    .scaleZ(leavesStretchFactor)
    .translateZ(trunkHeight)
    // and also here ^

  // `union` (from the `3d` library) adds two meshes together.
  // You could also write it as `trunk.add(leaves)`, but this is a little clearer.
  return escad.union(trunk, leaves)
// highlight-end
}
```