
export const range = (min, interval,  max) => {
  if(max == null) {
    max = interval;
    interval = 1;
  }
  return [...Array(Math.ceil((max - min) / interval))].map((_, i) => i * interval + min);
};
