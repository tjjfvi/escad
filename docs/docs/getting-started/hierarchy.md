---
sidebar_position: 4
---

# Hierarchy

Right now, our model doesn't have any labels, so if you open up the 'Hierarchy'
panel, you won't see anything. Let's fix that!

```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
  const trunkRadius = 2
  const trunkHeight = 16
  const leavesRadius = 6
  const leavesStretchFactor = 1.5

  const trunk = escad
    .cylinder({ radius: trunkRadius, height: trunkHeight })
    .shiftZ(1)

  const leaves = escad
    .sphere({ radius: leavesRadius })
    .scaleZ(leavesStretchFactor)
    .translateZ(trunkHeight)

// highlight-start
  // Before, we had `return escad.union(trunk, leaves)`.
  // We can label these elements by wrapping them in an object.
  return escad.union({ trunk, leaves })
// highlight-end
}
```

Try looking at the hierarchy now. You should see an object `{ trunk, leaves }`.
Click the arrow on the left to expand it. Now, click on `leaves`, then `trunk`.
As you click on the labels, it will show you the corresponding parts of the model.

With `trunk` selected, change `trunkHeight = 16` to `trunkHeight = 20`. When it
updates, you should see a taller trunk (but still no leaves). If you click on
the top line (`{`), you'll see the whole tree.

Now, change from the 'Outline' view to the 'Detailed' view with the dropdown at
the top. In 'Detailed' view, you can see each operation applied to make the
model.

Expand `leaves`. You should see two operations, `tZ(16)` (short for
`translateZ`) and `sZ(1.5)` (short for `scaleZ`), applied to a `sphere`. Click
on `sphere` (you'll see it at the origin), then `sZ` (now it's stretched), then
`tZ` (it's raised up).

For complex models, the hierarchy is a powerful tool to examine how the
model is constructed.
