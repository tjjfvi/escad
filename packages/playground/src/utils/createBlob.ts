
export const createBlob = (data: Buffer, mimeType = "text/plain") =>
  URL.createObjectURL(new Blob([data], { type: mimeType }))
