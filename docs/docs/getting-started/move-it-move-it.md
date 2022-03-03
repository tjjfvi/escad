---
sidebar_position: 1
---

# Move It, Move It

```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
// highlight-start
  return escad
    // We'll start with the cube from before.
    .cube({ size: 3 })
    // Then, we'll translate it vertically to make it rest on the XY plane.
    .translate(0, 0, 1.5)
    // Next, we'll rotate it 45 degrees around the Z (vertical) axis.
    .rotate(0, 0, 45)
// highlight-end
}
```

Because we often deal with one axis at a time, the `3d` library includes
shorthands:

```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
  return escad
    // We'll start with the cube from before.
    .cube({ size: 3 })
    // Then, we'll translate it vertically to make it rest on the XY plane.
// highlight-next-line
    .translateZ(1.5)
    // Next, we'll rotate it 45 degrees around the Z (vertical) axis.
// highlight-next-line
    .rotateZ(45)
}
```

Also, we often want to translate things by half their size; to that end,
the `3d` library includes a method `shift`:


```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
  return escad
    // We'll start with the cube from before.
    .cube({ size: 3 })
    // Then, we'll translate it vertically to make it rest on the XY plane.
// highlight-next-line
    .shiftZ(1)
    // Next, we'll rotate it 45 degrees around the Z (vertical) axis.
    .rotateZ(45)
}
```
