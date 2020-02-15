
const isArrayish = obj => obj && (obj instanceof Array || obj.constructor === Object || obj.isComponent);
const map = (obj, func) => {
  if(obj && obj.isComponent)
    return map(obj(), func);
  if(!isArrayish(obj))
    return func(obj);
  if(obj instanceof Array)
    return obj.map(x => func(x));
  let newObj = {};
  for(let key of Object.keys(obj))
    newObj[key] = func(obj[key]);
  return newObj;
}

const mapDeep = (obj, func) =>
  map(obj, x => isArrayish(x) ? mapDeep(x, func) : func(x));

const toArray = (obj, func, flat = false) => {
  if(obj && obj.isComponent)
    return toArray(obj(), func, flat);
  if(!isArrayish(obj))
    return [func ? func(obj) : obj];
  if(obj instanceof Array)
    return func ? obj[flat ? "flatMap" : "map"](func) : obj;
  return Object.entries(obj)[flat ? "flatMap" : "map"](([k, v]) => func(v, k, obj));
}

const toArrayDeep = (obj, func, flat = true, keys = []) =>
  isArrayish(obj) ?
    toArray(obj, (v, k) => toArrayDeep(v, func, flat, keys.concat(k)), flat) :
    func ?
      func(obj, keys) :
      obj

const length = obj =>
  obj && obj.isComponent ?
    length(obj()) :
    !isArrayish(obj) ?
      1 :
      obj instanceof Array ?
        obj.length :
        Object.keys(obj).length;

const element = (obj, ind) =>
  obj && obj.isComponent ?
    element(obj(), ind) :
    !isArrayish(obj) ?
      obj :
      obj instanceof Array ?
        obj[ind] :
        obj[Object.keys(obj)[ind]];


const arrayish = { isArrayish, mapDeep, toArray, toArrayDeep, length, element };

module.exports = arrayish;
