import "@escad/core";

export const createBlob = (data: BlobPart, mimeType = "text/plain") =>
  URL.createObjectURL(new Blob([data], { type: mimeType }));
