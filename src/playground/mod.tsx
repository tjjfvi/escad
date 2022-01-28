/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import "./swApi.ts";

// @style "../client/stylus/index.styl"
// @style "../client/stylus/fonts.css"
import ReactDOM from "../deps/react-dom.ts";
import React from "../deps/react.ts";
import { App } from "./App.tsx";

ReactDOM.render(<App />, document.getElementById("root"));
console.log("fin");
