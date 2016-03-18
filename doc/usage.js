var pi = require('../index')
  , ast = require('mkast')
  , walk = ast.walk();
walk
  .pipe(pi())
  .pipe(pi.serialize({indent: 2}))
  .pipe(process.stdout);
walk.end(ast.parse('<? @exec {shell} pwd ?>'));
