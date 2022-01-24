/// <reference lib="dom"/>

import "./initSw.ts";

import "../client/stylus/index.styl";
import "../client/stylus/fonts.css";
import ReactDOM from "../deps/react-dom.ts";
import React from "../deps/react.ts";
import { App } from "./App.tsx";

console.log("hi");
ReactDOM.render(<App />, document.getElementById("root"));
