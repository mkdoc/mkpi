var pi = require('../index')
  , ast = require('mkast')
  , walk = ast.walk()
  , stream = pi();
walk
  .pipe(stream)
  .pipe(pi.serialize({indent: 2}))
  .pipe(process.stdout);
walk.end(ast.parse('<? @exec {shell} pwd ?>'));
