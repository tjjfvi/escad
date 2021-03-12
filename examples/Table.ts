import { Component, ConvertibleElement, Realm } from "../packages/core/dist"
import builtinChainables, { Mesh } from "../packages/builtins/dist"

const escad = Realm.create(() => ({
  ...builtinChainables,
  beam,
  bracket,
}))

type BeamOrientation = "xy" | "yx" | "yz" | "zy" | "xz" | "zx"

type BracketOrientation =
  | "xy" | "xY" | "XY" | "Xy" | "xz" | "xZ" | "Xz" | "XZ" | "yz" | "yZ" | "Yz" | "YZ"
  | "yx" | "Yx" | "YX" | "yX" | "zx" | "Zx" | "zX" | "ZX" | "zy" | "Zy" | "zY" | "ZY"

type XYZ = [number, number, number]

const beam =
  Component.create("beam", (orientation: BeamOrientation, length: number, xyz: XYZ): ConvertibleElement<Mesh> => {
    let [x, y, z] = "xyz".split("").map(n => orientation[0] === n ? length : orientation[1] === n ? 3.5 : 1.5)
    return escad.cube({ x, y, z }).translate(...xyz)
  })

const bracket =
  Component.create("bracket", (orientation: BracketOrientation, xyz: XYZ): ConvertibleElement<Mesh> => {
    const obj: Record<BracketOrientation, XYZ> = {
      "xy": [0, 0, 0],
      "xY": [0, 0, 90],
      "XY": [0, 0, 180],
      "Xy": [0, 0, 270],
      "xz": [90, 0, 0],
      "xZ": [-90, 0, 0],
      "Xz": [-90, 0, 180],
      "XZ": [90, 0, 180],
      "yz": [0, -90, 0],
      "yZ": [0, 90, 0],
      "Yz": [0, 90, 180],
      "YZ": [0, -90, 180],

      "yx": [0, 0, 0],
      "Yx": [0, 0, 90],
      "YX": [0, 0, 180],
      "yX": [0, 0, 270],
      "zx": [90, 0, 0],
      "Zx": [-90, 0, 0],
      "zX": [-90, 0, 180],
      "ZX": [90, 0, 180],
      "zy": [0, -90, 0],
      "Zy": [0, 90, 0],
      "zY": [0, 90, 180],
      "ZY": [0, -90, 180],
    }
    const rot = obj[orientation]
    return escad.union(
      escad.cube({ size: [1, .1, 1], center: [false, true, true] }).translateX(-.05),
      escad.cube({ size: [.1, 1, 1], center: [true, false, true] }).translateY(-.05),
    ).translate([.05, .05, 0]).rotate(rot).translate(...xyz)
  })

export default () => {
  const legs =
    [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ].map(([x, y]) =>
      beam("zx", 36, [x * (36 / 2 - 3.5 / 2), y * (36 / 2 - 1.5 / 2), 0]),
    )

  const front = escad
    .beam("yx", 33, [0, 0, 36 / 2 - 8 - 1.5 / 2])
    .beam("yz", 33, [1, 0, 36 / 2 - 3.5 / 2])

    .bracket("Zy", [0, -36 / 2 + 1.5, 36 / 2 - 3.5])
    .bracket("ZY", [0, 36 / 2 - 1.5, 36 / 2 - 3.5])
    .bracket("zy", [0, -36 / 2 + 1.5, 36 / 2 - 8])
    .bracket("zY", [0, 36 / 2 - 1.5, 36 / 2 - 8])

    .bracket("Zy", [0, -36 / 2 + 1.5, 36 / 2 - 8 - 1.5])
    .bracket("ZY", [0, 36 / 2 - 1.5, 36 / 2 - 8 - 1.5])

    .beam("yx", 33, [0, 0, -36 / 2 + 10 + 1.5 / 2])
    .bracket("Zy", [0, -36 / 2 + 1.5, -36 / 2 + 10])
    .bracket("ZY", [0, 36 / 2 - 1.5, -36 / 2 + 10])

    .bracket("ZY", [0, -36 / 2, -36 / 2 + 10])
    .bracket("Zy", [0, 36 / 2, -36 / 2 + 10])

    .bracket("zY", [0, -36 / 2, -36 / 2 + 10 + 3.5])
    .bracket("zy", [0, 36 / 2, -36 / 2 + 10 + 3.5])

    .bracket("zy", [0, -36 / 2 + 1.5, -36 / 2 + 10 + 3.5 + 1.5])
    .bracket("zY", [0, 36 / 2 - 1.5, -36 / 2 + 10 + 3.5 + 1.5])

    .bracket("zy", [0, -36 / 2 + 1.5 * 2, -36 / 2 + 10 + 1.5])
    .bracket("zY", [0, 36 / 2 - 1.5 * 2, -36 / 2 + 10 + 1.5])

    .bracket("ZY", [0, -36 / 2, 36 / 2 - 1.5])
    .bracket("Zy", [0, 36 / 2, 36 / 2 - 1.5])

    .beam("yz", 36, [1 + 1.5, 0, -36 / 2 + 10 + 3.5 / 2])
    .beam("yx", 36, [3.5, 0, 36 / 2 - 1.5 / 2])

    .tX(36 / 2 - 3.5 / 2)

  const left = escad
    .beam("xz", 29, [0, 0, 36 / 2 - 3.5 / 2])

    .bracket("Zx", [-36 / 2 + 3.5, 0, 36 / 2 - 3.5])
    .bracket("ZX", [36 / 2 - 3.5, 0, 36 / 2 - 3.5])

    .beam("xy", 29, [0, -1, -36 / 2 + 10 + 1.5 / 2])
    .bracket("Zx", [-36 / 2 + 3.5, 0, -36 / 2 + 10])
    .bracket("ZX", [36 / 2 - 3.5, 0, -36 / 2 + 10])

    .bracket("ZX", [-36 / 2, 0, -36 / 2 + 10])
    .bracket("Zx", [36 / 2, 0, -36 / 2 + 10])

    .bracket("zX", [-36 / 2, 0, -36 / 2 + 10 + 3.5])
    .bracket("zx", [36 / 2, 0, -36 / 2 + 10 + 3.5])

    .bracket("zx", [-36 / 2 + 1.5 * 2, 0, -36 / 2 + 10 + 1.5])
    .bracket("zX", [36 / 2 - 1.5 * 2, 0, -36 / 2 + 10 + 1.5])

    .bracket("ZX", [-36 / 2, 0, 36 / 2 - 1.5])
    .bracket("Zx", [36 / 2, 0, 36 / 2 - 1.5])

    .beam("xz", 36, [0, 1.5, -36 / 2 + 10 + 3.5 / 2])
    .beam("xz", 36, [0, -1.5, -36 / 2 + 10 + 3.5])
    .beam("xy", 43, [0, 3.5 - 1, 36 / 2 - 1.5 / 2])

    .tY(36 / 2 - 1.5 / 2)

  const verts = escad([
    [0, 90, 180, -90].map(a =>
      escad
        .bracket("XY", [36 / 2 - 1.5, 36 / 2 - 1.5, 36 / 2 - 3.5 / 2])
        .bracket("XY", [36 / 2 - 3.5, 36 / 2 - 3.5, -36 / 2 + 10 + 1.5 / 2])
        .bracket("xy", [36 / 2, 36 / 2, -36 / 2 + 10 + 3.5 / 2])
        .rotateZ(a),
    ),
  ])

  return escad.meld({
    legs,
    front,
    back: front.scale(-1, 1, 1),
    left,
    right: left.scale(1, -1, 1),
    verts,
  })

}
