/* eslint-disable react/prop-types */

import "../stylus/Viewer3d.styl"

import React, { useEffect } from "react"
import { ViewerInput, Viewer } from "@escad/client"
// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as t from "three"
import { createScene } from "./createScene"

export interface Viewer3dInput extends ViewerInput {
  group: t.Group,
}

const s = createScene()
const {
  scene,
  camera,
  orthocamera,
  renderer,
  controls,
  centerSphere,
  inputGroup,
  orientScene,
  orientCamera,
  orientOrthocamera,
  orientRenderer,
  orientMouse,
  orientRaycast,
  mouse,
  originSphere,
  raycaster,
} = s

const Viewer3d = ({ inputs }: { inputs: Promise<Viewer3dInput>[] }) => {
  let el: HTMLDivElement | null = null

  let active = true
  useEffect(() => () => {
    active = false
  })

  inputGroup.remove(...inputGroup.children)
  inputs.map(async i => {
    const { group } = await i
    if(active) inputGroup.add(group)
  })

  return <div className="Viewer3d" ref={async newEl => {
    el = newEl
    if(!el) return
    el.appendChild(renderer.domElement)
    el.appendChild(orientRenderer.domElement)
    while(el) {
      render(el)
      await new Promise(r => requestAnimationFrame(r))
    }
  }}></div>

}

orientRenderer.domElement.classList.add("orient")
renderer.domElement.addEventListener("mousemove", onOrientRendererMousemove, false)
orientRenderer.domElement.addEventListener("mousemove", onOrientRendererMousemove, false)
orientRenderer.domElement.addEventListener("click", onOrientRendererClick)
orientRenderer.domElement.addEventListener("contextmenu", onOrientRendererRightClick)
renderer.domElement.addEventListener("dblclick", onRendererDoubleClick)

function onOrientRendererMousemove(event: MouseEvent){
  let cel = orientRenderer.domElement
  let rect = cel.getBoundingClientRect()
  orientMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  orientMouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
}

function onOrientRendererRightClick(event: MouseEvent){
  s.ortho = !s.ortho
  event.preventDefault()
}

function onRendererDoubleClick(event: MouseEvent){
  let cam = s.ortho ? orthocamera : camera
  originSphere.scale.set(1, 1, 1).multiplyScalar(camera.position.length() / 100)
  originSphere.visible = true
  originSphere.updateMatrixWorld()
  let cel = renderer.domElement
  let rect = cel.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
  raycaster.setFromCamera(mouse, cam)
  let hits = raycaster.intersectObjects([inputGroup, originSphere], true)
  originSphere.visible = false
  for(let { object, point } of hits) {
    if(object.type !== "Mesh")
      continue
    if(object === originSphere)
      point.set(0, 0, 0)
    camera.position.add(point).sub(controls.target)
    controls.target = point
    break
  }
}

function onOrientRendererClick(){
  orientRaycast(orientMouse)(camera)
}

function render(el: HTMLDivElement){
  let width = el.clientWidth
  let height = el.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  orthocamera.position
    .copy(camera.position)
    .sub(controls.target)
    .normalize()
    .multiplyScalar(10000)
    .add(controls.target)
  orthocamera.quaternion.copy(camera.quaternion)
  orthocamera.zoom = 1.73 / camera.position.clone().sub(controls.target).length()
  orthocamera.left = orthocamera.bottom * width / height
  orthocamera.right = orthocamera.top * width / height
  orthocamera.updateProjectionMatrix()

  centerSphere.position.copy(controls.target)
  centerSphere.scale.set(1, 1, 1).multiplyScalar(camera.position.clone().sub(controls.target).length() / 100)

  renderer.setSize(width, height)
  renderer.render(scene, s.ortho ? orthocamera : camera)
  orientCamera.position.copy(camera.position).sub(controls.target).normalize()
  orientCamera.lookAt(0, 0, 0)
  orientOrthocamera.position.copy(orientCamera.position)
  orientOrthocamera.quaternion.copy(orientCamera.quaternion)
  orientRenderer.render(orientScene, s.ortho ? orientOrthocamera : orientCamera)
  orientRaycast(orientMouse)
}

export const viewer3d: Viewer<Viewer3dInput> = {
  name: "3D",
  className: "3d",
  component: Viewer3d,
  weight: 1,
}

