#!/usr/bin/env bash

VERSION=$(node -p "require('./package.json').version")

buildPackage() {
  echo "======      Making distribution folder"
  mkdir -p ./dist/
  echo "======      Concatenating files"
  cat ./jsc.js.prefix ./jsc.js ./charts/**/*.js ./jsc.js.suffix > ./dist/jsc.js
}

echo "====== BUILDING: Version ${VERSION}"

buildPackage

echo "====== BUILDING: DONE"
