
module.exports = (escad, p) => {
  p;
  return escad.translate([1, 2, 3])({
    x: escad.cyl({ r: 1, h: 10, sides: 12 }).rotate(0, 90, 0),
    y: escad.cyl({ r: 1, h: 10, sides: 12 }).rotate(90, 0, 0),
    z: escad.cyl({ r: 1, h: 10, sides: 12 }),
  });
};
