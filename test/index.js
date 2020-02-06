
module.exports = (escad, p) => {
  p;
  return escad.intersection(
    escad.cyl({ r: 1, h: 10, sides: 12 }).rotate(0, 90, 0),
    escad.cyl({ r: 1, h: 10, sides: 12 }).rotate(90, 0, 0),
    escad.cyl({ r: 1, h: 10, sides: 12 }),
  );
};
