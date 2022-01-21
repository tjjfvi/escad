// @ts-nocheck

import { BufferGeometry, Float32BufferAttribute, Geometry } from "three.ts"

function EdgesGeometry(geometry, thresholdAngle = 1){

  BufferGeometry.call(this)

  this.type = "EdgesGeometryT6"

  this.parameters = { thresholdAngle }

  let thresholdDot = Math.cos(Math.PI / 180 * thresholdAngle)
  let map = {}
  let keys = ["a", "b", "c"]

  geometry = geometry.isBufferGeometry ? new Geometry().fromBufferGeometry(geometry) : geometry.clone()

  geometry.mergeVertices()
  geometry.computeFaceNormals()

  let verts = geometry.vertices
  let faces = geometry.faces

  let keepEdges = []

  for(let face of faces)
    for(let j = 0; j < 3; j++) {
      let edge1 = face[keys[j]]
      let edge2 = face[keys[(j + 1) % 3]]
      runEdge(edge1, edge2, face.normal)
    }

  function runEdge(edge1, edge2, normal){

    for(let obj of map[edge1] || []) {
      if(obj.done)
        continue
      let od = verts[obj.o].clone().sub(verts[edge1])
      let oD = od.lengthSq()
      let td = verts[edge2].clone().sub(verts[edge1])
      let tD = td.lengthSq()
      let d = od.normalize().dot(td.normalize())
      if(d > thresholdDot) {
        let [a, b, n] = oD < tD ? [obj.o, edge2, normal] : [obj.o, edge2, obj.n]
        if(od.o !== edge2)
          runEdge(a, b, n)
        if(obj.n.dot(normal) <= thresholdDot)
          keepEdges.push([edge1, a])
        obj.done = true
        return
      }
    }

    (map[edge2] = map[edge2] || []).push({ o: edge1, n: normal })
  }

  this.setAttribute("position", new Float32BufferAttribute(
    keepEdges
      .concat(Object.entries(map).flatMap(([a, os]) => os.filter(o => !o.done).map(({ o: b }) => [a, b])))
      .flatMap(e => e.flatMap(i => verts[i].toArray())), 3),
  )

}

EdgesGeometry.prototype = Object.create(BufferGeometry.prototype)
EdgesGeometry.prototype.constructor = EdgesGeometry

export { EdgesGeometry }
