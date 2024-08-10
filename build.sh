#!/bin/bash

echo '开始执行编译'
version=$(cat build/version)
echo $version
# ./node_modules/.bin/rollup -i src/loader-module.js -f amd -o build/$version/DATracker.amd.js -c rollup.config.js
# ./node_modules/.bin/rollup -i src/loader-module.js -f cjs -o build/$version/DATracker.cjs.js -c rollup.config.js
# ./node_modules/.bin/rollup -i src/loader-module.js -f umd -o build/$version/DATracker.umd.js -n mixpanel -c rollup.config.js
# ./node_modules/.bin/rollup -i src/loader-sync.js -f iife -o build/$version/DATracker.sync.js -n mixpanel -c rollup.config.js
./node_modules/.bin/rollup -i src/loader-globals.js -f iife -o build/$version/DATracker.globals.js -n mixpanel -c rollup.config.js

# ./node_modules/.bin/rollup -i control/control.js -f iife -o build/control/control.js  -c rollup.config.js

# ./node_modules/.bin/rollup -i plugins/eventList/index.js -f iife -o build/eventList/eventList.js  -c rollup.config.js


# cp ./build/$version/DATracker.globals.js ~/study/js-play-ground/DATracker.globals.js

#sleep 100