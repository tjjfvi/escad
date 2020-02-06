
module.exports = (escad, p) => {
  p;
  return escad.cyl({ r: 1 }).sub(escad.cyl({ r: .5, c: false }));
};
