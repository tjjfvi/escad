
import { Work, Element, Hierarchy, Id } from ".";
import { Mesh } from "./Mesh";
import { Face } from "./Face";
import { Vector3 } from "./Vector3";
import { diff } from "./csg";
import { OneOf } from "../utils";

const tau = Math.PI * 2;

type CylWorkArgs = [number, number, number, number, [number, number], [number, number], boolean];

class CylWork extends Work<CylWork, Mesh, []> {
  type = CylWork;

  static id = new Id("CylWork", __filename);

  constructor(public args: CylWorkArgs) {
    super([]);
    this.freeze();
  }

  _serialize() {
    return Buffer.from(JSON.stringify(this.args));
  }

  static _deserialize(children: [], buf: Buffer) {
    return new CylWork(JSON.parse(buf.toString("utf8")));
  }

  async execute() {
    let [r1, r2, height, sides, o1, o2, c] = this.args;

    let bh = c ? -height / 2 : 0;
    let th = bh + height;

    let c1 = [o1[0], o1[1], bh] as const;
    let c2 = [o2[0], o2[1], th] as const;

    return new Mesh([...Array(sides)].flatMap((_, i) => {
      let p1 = [Math.cos(i / sides * tau), Math.sin(i / sides * tau)] as const;
      let p2 = [Math.cos((i + 1) / sides * tau), Math.sin((i + 1) / sides * tau)] as const;
      let p11 = [p1[0] * r1 + o1[0], p1[1] * r1 + o1[1], bh] as const;
      let p12 = [p1[0] * r2 + o2[0], p1[1] * r2 + o2[1], th] as const;
      let p21 = [p2[0] * r1 + o1[0], p2[1] * r1 + o1[1], bh] as const;
      let p22 = [p2[0] * r2 + o2[0], p2[1] * r2 + o2[1], th] as const;
      return [
        [p21, p11, c1],
        [c2, p12, p22],
        [p12, p11, p22],
        [p22, p11, p21],
      ];
    }).map(f => new Face(f.map(v => new Vector3(...v)))));
  }

}

Work.Registry.register(CylWork);

type Pair<T> = T | [T, T];
type XY<T> = [T, T] | { x: T, y: T };

type CylArgs =
  & OneOf<[
    { r: Pair<number> },
    { rs: Pair<number> },
    { r1: number, r2: number },
  ]>
  & OneOf<[
    { l: number },
    { length: number },
    { h: number },
    { height: number },
  ]>
  & OneOf<[
    {},
    { offsets: Pair<XY<number>> },
    { os: Pair<XY<number>> },
    { offset1: XY<number>, offset2: XY<number> },
    { o1: XY<number>, o2: XY<number> },
  ]>
  & OneOf<[
    {},
    { center: boolean },
    { c: boolean },
  ]>
  & OneOf<[
    {},
    { unionDiff: boolean },
    { ud: boolean },
  ]>
  // & OneOf<[
  //   {},
  //   (
  & OneOf<[
    { t: Pair<number> },
    { ts: Pair<number> },
    { t1: number, t2: number },
    { i: number },
    { is: Pair<number> },
    { i1: number, i2: number },
  ]>
  & OneOf<[
    {},
    { iOffsets: Pair<XY<number>> },
    { ios: Pair<XY<number>> },
    { iOffset1: XY<number>, iOffset2: XY<number> },
    { io1: XY<number>, io2: XY<number> },
  ]>
  //   ),
  // ]>
  & { sides?: number }

export const cyl = (args: CylArgs) => {
  const rsP: Pair<number> =
    ("r" in args ? args.r : null) ??
    ("rs" in args ? args.rs : null) ??
    ("r1" in args ? [args.r1 ?? 1, args.r2 ?? 1] : null) ??
    1
  const rs = typeof rsP === "number" ? [rsP, rsP] : rsP;

  const tsP: Pair<number> | null =
    ("t" in args ? args.t : null) ??
    ("ts" in args ? args.ts : null) ??
    ("t1" in args ? [args.t1 ?? 1, args.t2 ?? 1] : null)
  const ts = typeof tsP === "number" ? [tsP, tsP] : tsP;


  const isP: Pair<number> | null =
    ("i" in args ? args.i : null) ??
    ("is" in args ? args.is : null) ??
    ("i1" in args ? [args.i1 ?? 1, args.i2 ?? 1] : null) ??
    (ts ? [rs[0] - ts[0], rs[1] - ts[1]] : null) ??
    null
  const is: [number, number] | null = typeof isP === "number" ? [isP, isP] : isP;

  const center =
    ("center" in args ? args.center : null) ??
    ("c" in args ? args.c : null) ??
    true
  const unionDiff =
    ("unionDiff" in args ? args.unionDiff : null) ??
    ("ud" in args ? args.ud : null) ??
    false
  const height =
    ("height" in args ? args.height : null) ??
    ("length" in args ? args.length : null) ??
    ("l" in args ? args.l : null) ??
    ("h" in args ? args.h : null) ??
    1
  const sides = args.sides ?? 20;

  const osPXY: Pair<XY<number>> =
    ("offsets" in args ? args.offsets : null) ??
    ("os" in args ? args.os : null) ??
    [
      (
        ("offset2" in args ? args.offset2 : null) ??
        ("o2" in args ? args.o2 : null) ??
        [0, 0]
      ),
      (
        ("offset1" in args ? args.offset1 : null) ??
        ("o1" in args ? args.o1 : null) ??
        [0, 0]
      ),
    ];

  // @ts-ignore
  const osXYs: [XY<number>, XY<number>] =
    osPXY instanceof Array ?
      typeof osPXY[0] === "number" ?
        [osPXY, osPXY] :
        osPXY as [XY<number>, XY<number>] :
      [osPXY, osPXY]

  const iosPXY: Pair<XY<number>> =
    ("iOffsets" in args ? args.iOffsets : null) ??
    ("ios" in args ? args.ios : null) ??
    [
      (
        ("iOffset1" in args ? args.iOffset1 : null) ??
        ("io1" in args ? args.io1 : null) ??
        osXYs[0]
      ),
      (
        ("iOffset2" in args ? args.iOffset2 : null) ??
        ("io2" in args ? args.io2 : null) ??
        osXYs[1]
      ),
    ];

  // @ts-ignore
  const iosXYs: [XY<number>, XY<number>] =
    iosPXY instanceof Array ?
      typeof iosPXY[0] === "number" ?
        [iosPXY, iosPXY] :
        iosPXY as [XY<number>, XY<number>] :
      [iosPXY, iosPXY]

  const [o1, o2] = osXYs.map((xy): [number, number] => xy instanceof Array ? xy : [xy.x, xy.y]);
  const [io1, io2] = iosXYs.map((xy): [number, number] => xy instanceof Array ? xy : [xy.x, xy.y]);

  let oc = new CylWork([rs[0], rs[1], height, sides, o1, o2, center]);
  if (!is)
    return new Element(oc)
  let ic = new CylWork([is[0], is[1], height, sides, io1, io2, center]);
  return new Element(unionDiff ? [oc, ic] : diff(oc, ic));
}

export const cylinder = cyl;
export const hollowCylinder = cyl;
export const hollowCyl = cyl;