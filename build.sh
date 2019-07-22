./node_modules/.bin/pegjs norma-parser.pegjs
./node_modules/.bin/uglifyjs norma.js -c "evaluate=false" --comments "/ Copyright .*/" -m --source-map -o norma-min.js
./node_modules/.bin/jshint norma.js
./node_modules/.bin/docco norma.js -o doc
