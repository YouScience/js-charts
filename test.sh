#!/usr/bin/env bash

NAME=$(node -p "require('./package.json').name")

TEST_RUNNER=./node_modules/node-qunit-phantomjs/bin/node-qunit-phantomjs

echo "====== TESTING: ${NAME}"

echo "======      Basics"
$TEST_RUNNER ./test/spec/basics.html

echo "======      Donut Chart"
$TEST_RUNNER ./test/spec/charts-donut.html

echo "====== TESTING: DONE"
