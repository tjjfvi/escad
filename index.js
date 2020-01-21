
require("./builtins");
const operators = require("./operators");
const o = operators;

let test0 = o.number(1);
test0.add(2);
test0.delay(1000);
let test1 = o.sum(test0, o.number(3));

true && (async () => {
  console.log("Should only have one \"SlowWork\"\n");

  console.time("test0");
  console.log(test0.process());
  console.log(test0.process());
  console.log(test0.process());
  console.log(await test0.process());
  console.timeEnd("test0");

  console.log();

  console.time("test1");
  console.log(await test1.process());
  console.timeEnd("test1");
})()
