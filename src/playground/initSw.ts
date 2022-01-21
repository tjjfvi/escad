let sw = await navigator.serviceWorker.register(
  new URL("/sw.js", import.meta.url),
  {
    scope: "/",
    type: "module",
  },
);

console.log(sw);
