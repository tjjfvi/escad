---
sidebar_position: 2
---

# Something More

```ts
import { escad } from "https://escad.dev/core/mod.ts"
import "https://escad.dev/3d/register.ts"

export default () => {
// highlight-start
  return escad
    // Start with a cube of size 1.
    .cube({ size: 1 })
    // Subtract a cube of size 0.9; now the cube is hollow.
    .sub(escad.cube({ size: 0.9 }))
    // Subtract one corner of the cube.
    .sub(escad.cube({ size: 1 }).shift(1, 1, 1))
// highlight-end
}
```

Does this look familiar?
