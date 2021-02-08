
/* eslint-disable no-console */

import webpack from "webpack"
import MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

const staticDir = __dirname + "/../static/";
const bundledDir = staticDir + "bundled/";

const compiler = webpack({
  entry: [require.resolve("./index")],
  output: {
    path: bundledDir,
    filename: "bundle.js",
    sourceMapFilename: "bundle.js.map",
  },
  optimization: {
    minimize: false,
  },
  resolve: {
    alias: {
      assert: "assert",
      console: "console-browserify",
      constants: "constants-browserify",
      crypto: "crypto-browserify",
      domain: "domain-browser",
      events: "events",
      http: "stream-http",
      https: "https-browserify",
      os: "os-browserify/browser",
      punycode: "punycode",
      querystring: "querystring-es3",
      stream: "stream-browserify",
      _stream_duplex: "readable-stream/duplex",
      _stream_passthrough: "readable-stream/passthrough",
      _stream_readable: "readable-stream/readable",
      _stream_transform: "readable-stream/transform",
      _stream_writable: "readable-stream/writable",
      string_decoder: "string_decoder",
      sys: "util",
      timers: "timers-browserify",
      tty: "tty-browserify",
      url: "url",
      util: "util",
      vm: "vm-browserify",
      zlib: "browserify-zlib",
      child_process: require.resolve("./child_process"),
      fs: "browserfs/dist/shims/fs.js",
      buffer: "browserfs/dist/shims/buffer.js",
      path: "browserfs/dist/shims/path.js",
      processGlobal: "browserfs/dist/shims/process.js",
      bufferGlobal: "browserfs/dist/shims/bufferGlobal.js",
      bfsGlobal: require.resolve("browserfs"),
      process: require.resolve("./process"),
    }
  },
  devtool: "source-map",
  mode: "development",
  // REQUIRED to avoid issue "Uncaught TypeError: BrowserFS.BFSRequire is not a function"
  // See: https://github.com/jvilk/BrowserFS/issues/201
  module: {
    noParse: /browserfs\.js/,
    rules: [{
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.ttf$/,
      use: ['file-loader']
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({ BrowserFS: 'bfsGlobal', process: 'processGlobal', Buffer: 'bufferGlobal' }),
    new MonacoWebpackPlugin(),
  ],
  // node: {
  //   process: false,
  //   Buffer: false
  // },
})

const handler = (err: Error | undefined) => {
  if(err)
    return console.error(err);
  console.log("Bundled TS");
}

compiler.watch({}, handler);

import express = require("express");

const app = express();

app.use(express.static(staticDir));

// @ts-ignore
import corsAnywhere = require("cors-anywhere");

const proxy = corsAnywhere.createServer({
  originWhitelist: [], // Allow all origins
  requireHeaders: [], // Do not require any headers.
  removeHeaders: [] // Do not remove any headers.
});

app.get('/registry/:proxyUrl*', (req, res) => {
  req.url = req.url.replace('/registry/', '/https://registry.npmjs.org/');
  proxy.emit('request', req, res);
});

app.listen(8000)
