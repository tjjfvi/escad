
const { Work } = require(".");
const { PointMapWork } = require("./PointMapWork");
const { Matrix4 } = require("./Matrix4");

class TransformWork extends PointMapWork {

  static id="TransformWork";

  transformArgs(matrix, _m){
    if(typeof matrix === "function")
      return [matrix, _m];
    return [v => matrix.multiplyVector(v), matrix];
  }

  transformChildren(children){
    if(children.length !== 1)
      throw new Error("TransformWork only accepts one child");
    let [child] = children;
    if(child instanceof TransformWork) {
      this.returnVal = new TransformWork(child.children, this.hierarchy, this.args[1].multiply(child.args[1]))
      return [];
    }
    return super.transformChildren([child]);
  }

}

Work.Registry.register(TransformWork);

module.exports = { TransformWork, Matrix4 };
