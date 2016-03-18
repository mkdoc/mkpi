var pi = require('../index')
  , ast = require('mkast');
ast.src('<? @exec {shell} pwd ?>')
  .pipe(pi())
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
