
import { createBlob } from "./createBlob.ts"
import fs from "fs.ts"

export function getClientURL(){
  let scriptURL: string
  try {
    scriptURL = createBlob(fs.readFileSync("/static/bundle.js"))
  }
  catch (e) {
    return null
  }
  return createBlob(Buffer.from(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>escad</title>
</head>
<body>
  <div id="root"></div>
  <script src="${location.origin}/bundled/escad.js"></script>
  <script src="${scriptURL}"></script>
</body>
</html>
  `.trim()), "text/html")
}
