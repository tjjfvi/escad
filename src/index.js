
require("./builtins");
const operators = require("./operators");
const o = operators;

let test0 = o.cube(1);
let test1 = o.cube(1).translate([0, 0, 2]).translate([10, 0, 0]);

(async () => {
  console.log(test0);
  console.log(await test0.process());
  console.log(test1);
  console.log((await test1.process()).faces[0]);
  console.log("\nDone!");
})()
