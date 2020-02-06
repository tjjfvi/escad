
const { Vector3 } = require("./Vector3");
const _Face = require("./Face");

const epsilon = 1e-5;

class Plane {

  constructor(points, w){
    if(points instanceof Vector3) {
      this.normal = points;
      this.w = w;
    } else {
      let [a, b, c] = points;
      this.normal = b.subtract(a).cross(c.subtract(a)).unit();
      this.w = this.normal.dot(a);
    }
    Object.freeze(this);
  }

  flip(){
    return new Plane(this.normal.negate(), -this.w);
  }

  splitFace(face, coplanarFront, coplanarBack, front, back){
    const Coplanar = 0;
    const Front = 1;
    const Back = 2;
    const Spanning = 3;

    let faceType = 0;
    let types = face.points.map(v => {
      let t = this.normal.dot(v) - this.w;
      let type = t < -epsilon ? Back : t > epsilon ? Front : Coplanar;
      faceType |= type; // Bitwise or
      return type;
    });

    console.log(faceType);
    switch(faceType) {
      case Coplanar:
        (this.normal.dot(face.plane.normal) > 0 ? coplanarFront : coplanarBack).push(face);
        break;
      case Front:
        front.push(face);
        break;
      case Back:
        back.push(face);
        break;
      case Spanning: {
        let f = [];
        let b = [];
        face.points.map((vi, i, a) => {
          let j = (i + 1) % a.length;
          let ti = types[i];
          let tj = types[j];
          let vj = a[j];
          if(ti !== Back) f.push(vi);
          if(ti !== Front) b.push(vi);
          if((ti | tj) !== Spanning) // Bitwise or
            return
          let t = (this.w - this.normal.dot(vi)) / this.normal.dot(vj.subtract(vi));
          let v = vi.lerp(vj, t);
          f.push(v);
          b.push(v);
        })
        console.log(front.length, back.length);
        f.slice(2).map((_, i) => front.push(new _Face.Face([f[0], f[i + 1], f[i + 2]])));
        b.slice(2).map((_, i) => back.push(new _Face.Face([b[0], b[i + 1], b[i + 2]])));
        console.log(front.length, back.length);
        break;
      }
    }
  }

}

module.exports = { Plane };
