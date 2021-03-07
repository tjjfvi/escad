rm -r static/project
mkdir static/project
cd static/project
npm init -y
npm i ../packages/*.tgz \
  path-browserify \
  process \
  util \
  buffer \
  assert \
  events \
  crypto-browserify \
  readable-stream \
  stream-browserify \
  constants-browserify \
  prop-types \
  sha.js
cd ..
mkdir bundled
rm bundled/project.tgz
tar -czf bundled/project.tgz project
rm -rf project
