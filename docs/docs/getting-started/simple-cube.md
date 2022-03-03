---
sidebar_position: 0
---

# A Simple Cube

Here is an example of a simple `escad` model:

```ts
// First, we import escad's core api.
import { escad } from "https://escad.dev/core/mod.ts"
// Then, we import and register the `3d` library.
import "https://escad.dev/3d/register.ts"

// We now export a function that will be called by escad to generate the output.
export default () => {
  // For now, we just render a simple cube.
  // `cube` is available on `escad` because we registered the `3d` library.
  return escad.cube({ size: 3 })
}
```

You can see the result of this model [on the playground](https://escad.run/#840568d7).
