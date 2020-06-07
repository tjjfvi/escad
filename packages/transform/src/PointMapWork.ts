
import { Mesh, Face, Vector3 } from "@escad/mesh";
import { Work, ConvertibleTo, StrictLeaf } from "@escad/core";

abstract class PointMapWork<W extends PointMapWork<W>> extends Work<W, Mesh, [ConvertibleTo<Mesh>]> {

  abstract map(input: Vector3): Vector3;

  _execute(input: Vector3): Vector3
  _execute(input: Face): Face
  _execute(input: Mesh): Mesh
  _execute(input: Mesh | Face | Vector3): Mesh | Face | Vector3{
    if(input instanceof Mesh)
      return new Mesh(input.faces.map(f => this._execute(f).finish()));
    if(input instanceof Face)
      return new Face(input.points.map(p => this._execute(p)));
    if(input instanceof Vector3)
      return this.map(input);
    throw new Error("Invalid input to PointMapWork");
  }

  async execute([input]: [StrictLeaf<ConvertibleTo<Mesh>>]){
    return this._execute(await Mesh.convert(input).process()).finish();
  }

}

export { PointMapWork };
