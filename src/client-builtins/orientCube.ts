import * as t from "three.ts"
import { colors } from "./colors.ts"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.ts"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.ts"

const cubeSize = .5
const edgeSize = .125
const centerSize = cubeSize - edgeSize * 2

export function createOrientCube(getCamera: () => t.Camera, controls: OrbitControls){
  let planeGeo = new t.PlaneBufferGeometry(centerSize, centerSize)

  let edgeGeo = BufferGeometryUtils.mergeBufferGeometries([
    new t.PlaneBufferGeometry(edgeSize, centerSize).translate(-edgeSize / 2, 0, 0),
    new t.PlaneBufferGeometry(edgeSize, centerSize).translate(edgeSize / 2, 0, 0).rotateY(Math.PI / 2),
  ])

  let cornerGeo = BufferGeometryUtils.mergeBufferGeometries([
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(-edgeSize / 2, -edgeSize / 2, 0),
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(edgeSize / 2, -edgeSize / 2, 0).rotateY(Math.PI / 2),
    new t.PlaneBufferGeometry(edgeSize, edgeSize).translate(-edgeSize / 2, edgeSize / 2, 0).rotateX(-Math.PI / 2),
  ])

  let mat = new t.MeshBasicMaterial({ color: colors.blackish })
  let hoverMat = new t.MeshBasicMaterial({ color: colors.grey })

  let sides = [
    new t.Vector3(1, 0, 0),
    new t.Vector3(0, 1, 0),
    new t.Vector3(0, 0, 1),
  ].flatMap(a => [a, a.clone().negate()].map(a => {
    let mesh = new t.Mesh(planeGeo, mat)
    mesh.position.copy(a).multiplyScalar(.25)
    mesh.lookAt(a)
    return mesh
  }))

  let edges = [
    0,
    Math.PI / 2,
    Math.PI,
  ].flatMap(x => [0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap(z => {
    let mesh = new t.Mesh(edgeGeo, mat)
    mesh.rotateZ(z)
    mesh.rotateX(x)
    mesh.position.set(cubeSize / 2, 0, cubeSize / 2).applyQuaternion(mesh.quaternion)
    return mesh
  }))

  let corners = [
    0,
    Math.PI,
  ].flatMap(x => [0, Math.PI / 2, Math.PI, -Math.PI / 2].flatMap(z => {
    let mesh = new t.Mesh(cornerGeo, mat)
    mesh.rotateZ(z)
    mesh.rotateX(x)
    mesh.position.set(cubeSize / 2, cubeSize / 2, cubeSize / 2).applyQuaternion(mesh.quaternion)
    return mesh
  }))

  let parts = [sides, edges, corners].flat()

  let group = new t.Group()

  group.add(...parts)

  group.add(new t.LineSegments(
    new t.EdgesGeometry(new t.BoxGeometry(.5, .5, .5)),
    new t.LineBasicMaterial({ color: colors.lightgrey }),
  ))

  let raycaster = new t.Raycaster()
  let lastCast: t.Mesh
  let raycast = (mouse: any) => {
    raycaster.setFromCamera(mouse, getCamera())
    const raycastResult = raycaster.intersectObjects(parts)
    const [{ object: mesh = null } = {}] = raycastResult
    if(lastCast)
      lastCast.material = mat
    if(!mesh || !(mesh instanceof t.Mesh))
      return () => { }
    lastCast = mesh
    mesh.material = hoverMat
    return (c: t.Object3D) => {
      let dist = c.position.distanceTo(controls.target)
      c.position
        .copy(mesh.position)
        .normalize()
        .multiplyScalar(dist)
        .add(controls.target)
      controls.update()
    }
  }

  return [group, raycast] as const
}
