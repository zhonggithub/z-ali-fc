#!/bin/sh
set -e
npm config set registry https://registry.npm.taobao.org
npm install
npm run build
rm -rf node_modules
rm -rf src