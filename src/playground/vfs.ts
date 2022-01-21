export async function putVfs(url: string | URL, content: BodyInit) {
  console.log(url, content);
  await fetch(`/vfs/${url}`, {
    method: "PUT",
    body: content,
  });
}

export async function getVfs(url: string | URL) {
  return await fetch(`/vfs/${url}`);
}

export async function readVfs(url: string | URL) {
  return await (await getVfs(url)).text();
}
