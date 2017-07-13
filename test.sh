#!/usr/bin/env bash

VERSION=$(node -p "require('./package.json').version")
TEST_RUNNER=./node_modules/node-qunit-phantomjs/bin/node-qunit-phantomjs

echo "====== TESTING: Version ${VERSION}"

echo "======      Basics"
$TEST_RUNNER ./test/spec/basics.html

echo "======      Donut Chart"
$TEST_RUNNER ./test/spec/charts-donut.html

echo "====== TESTING: DONE"
