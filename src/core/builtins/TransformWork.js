
import { Work, Id } from ".";
import { PointMapWork } from "./PointMapWork";
import { Matrix4 } from "./Matrix4";

class TransformWork extends PointMapWork {

  static id = new Id("TransformWork", __filename);

  serializeArgs(){
    return this.args[1].serialize();
  }

  static deserializeArgs(buf){
    let m = Matrix4.deserialize(buf);
    return [v => m.multiplyVector(v), m]
  }

  transformArgs(matrix, _m){
    if(typeof matrix === "function")
      return [matrix, _m];
    if(matrix == null)
      matrix = _m;
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

export { TransformWork };
