[![Build Status](https://travis-ci.org/mkdoc/mkpi.svg?v=3)](https://travis-ci.org/mkdoc/mkpi)
[![npm version](http://img.shields.io/npm/v/mkpi.svg?v=3)](https://npmjs.org/package/mkpi)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkpi/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkpi?branch=master)

Parses and executes processing instructions according to macro functions defined by a grammar.

Uses the [mkparse][] library to form a DSL based on tags declared in processing instructions `<? ... ?>`.

Reads newline-delimited JSON records from an input stream, interprets and executes the instructions and writes the modified AST to the output stream.
