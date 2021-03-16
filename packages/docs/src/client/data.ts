
import { Ranges } from "../Range"
import flatted from "flatted"

export const getRanges = async (file: string) => {
  const raw = await fetch(`/data/files/${file}/ranges.json`).then(r => r.text())
  const ranges: Ranges = flatted.parse(raw)
  return ranges
}

export const getFile = async (file: string) =>
  await fetch(`/data/files/${file}/file`).then(r => r.text())
