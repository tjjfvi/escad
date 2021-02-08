
import webpack from "webpack";
import fs from "fs";

const compiler = webpack({
  context: "/project/",
  entry: ["/project/index.ts"],
  output: {
    path: "/out/",
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
    hashFunction: "md5",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    alias: {}
  },
  devtool: "source-map",
  mode: "development",
})

// @ts-ignore
compiler.inputFileSystem.join = fs.join;

export const compile = () => {
  // compiler.run((e, x) => {
  //   console.log(e ?? x);
  // })
}
