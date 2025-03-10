#!/bin/bash

# cd into working directory
# cd /home/runner/work/yagsl-configurator/yagsl-configurator

# remove existing docs if exists
rm -rf ./src/docs

# clone docs
git clone -b dev https://github.com/BroncBotz3481/YAGSL-Example yagsl-dev --depth=1

# move docs into extension src
mv ./yagsl-dev/docs src/docs

# remove cloned repo
rm -rf yagsl-dev

# nodejs version 22.14.0
# replace all src urls with local file paths
node build.js