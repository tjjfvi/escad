/// <reference lib="dom"/>

import "./initSw.ts";

import "../client/stylus/index.styl";
import "../client/stylus/fonts.css";
import ReactDOM from "https://cdn.esm.sh/v64/react-dom@17.0.2/es2021/react-dom.development.js";
import React from "../deps/react.ts";
import { App } from "./App.tsx";

console.log("hi");
ReactDOM.render(<App />, document.getElementById("root"));
