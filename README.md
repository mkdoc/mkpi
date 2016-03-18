# Processing Instructions

[![Build Status](https://travis-ci.org/mkdoc/mkpi.svg?v=3)](https://travis-ci.org/mkdoc/mkpi)
[![npm version](http://img.shields.io/npm/v/mkpi.svg?v=3)](https://npmjs.org/package/mkpi)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkpi/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkpi?branch=master)

> Script markdown documents

Uses the [mkparse][] library to form a DSL based on tags declared in processing instructions `<? ... ?>`.

Parses and executes processing instructions according to macro functions defined by a grammar; reads newline-delimited JSON records from an input stream, interprets and executes the instructions and writes the modified AST to an output stream.

## Install

```
npm i mkpi --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

## Usage

```javascript
var mkpi = require('mkpi');
mkpi(); // read from process.stdin, write to process.stdout
```

## Example

This [readme document](/README.md) ([raw version](https://raw.githubusercontent.com/mkdoc/mkpi/master/README.md)) was built from the source file [doc/readme.md](/doc/readme.md) shown below:

```markdown
# Processing Instructions

<? @include readme/badges.md ?>

> Script markdown documents

<? @include {=readme} introduction.md install.md ?>

## Usage

<? @source {javascript=s/\.\.\/index/mkpi/gm} usage.js ?>

<? @include readme/example.md ?>
<? @source {markdown} readme.md ?>

Using the command:

<? @macro {shell} return require('./package.json').scripts.readme ?>

<? @include readme/macros.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {=readme} license.md links.md ?>
```

Using the command:

```shell
mkcat doc/readme.md | mkpi | mkgen | mkref | mkout > README.md
```

## Macros

The default processing instruction grammar includes functions for including markdown documents, executing commands and more.

### Grammar

These macros are defined by the default grammar.

#### @include

Include one or more markdown documents into the AST stream:

```xml
<? @include intro.md install.md license.md ?>
```

Processing instructions in included files are also executed, paths are resolved relative to the owner document when a file is available.

You can specify a path to include from using the tag value:

```xml
<? @include {=path/to/folder} intro.md install.md license.md ?>
```

Use this as shorthand when all the files to include are in the same directory.

Note that file paths passed to this macro cannot include whitespace.

#### @exec

Execute a command and parse the result into the AST stream:

```xml
<? @exec pwd ?>
```

To capture the stderr stream use the `stderr` keyword before the command:

```xml
<? @exec stderr pwd ?>
```

An error is reported when a command fails, to include the output of a command with a non-zero exit code use the `@exec!` tag:

```xml
<? @exec! stderr pwd ?>
```

Commands may contain newlines they are removed before execution:

```xml
<?
  @exec ls -la
          lib
          dist
          test
?>
```

To wrap the output in a fenced code block use a type:

```xml
<? @exec {javascript} cat index.js ?>
```

#### @source

Load a file and parse it as markdown or wrap it in a fenced code block, unlike the @include macro processing instructions **are not executed**.

Parse a markdown file into the AST stream but do not execute processing instructions:

```xml
<? @source file.md ?>
```

Load a file into a fenced code block:

```xml
<? @source {javascript} index.js ?>
```

Sometimes it is useful to perform a string replacement on the sourced file, this is particularly helpful when you want to include a usage example that can be run directly but show the final package name.

To do so specify a string substitution in the form `s/{regexp}/{replace}/gimy` as a value, for example:

```xml
<? @source {javascript=s/\.\.\/index/mkpi/gm} usage.js ?>
```

Will replace all occurences of `../index` with `mkpi` in `usage.js` before the file is parsed into the stream.

#### @macro

Defines a macro function body; use this for application specific logic.

Return a value to inject some information into the stream:

```xml
<?
  @macro return require('./package.json').name;
?>
```

Or wrap the result in a fenced code block:

```xml
<?
  @macro {shell} return require('./package.json').scripts.test;
?>
```

For asynchronous operations you can callback with a string to write to the stream:

```xml
<?
  @macro cb(null, '*emph*');
?>
```

See the [macro api docs](#macro-1) for more detail.

### Custom Macros

Create a vanilla object if you wish to discard the default grammar macros:

```javascript
var mkpi = require('mkpi')
  , grammar = {}
  , id = 'custom-macro';

grammar[id] = function(cb) {
  // implement macro logic
  cb();
}

mkpi({grammar: grammar});
```

You macro function will then be executed when the `<? @custom-macro ?>` processing instruction is encountered.

To extend the existing grammar with a custom macro function use:

```javascript
var mkpi = require('mkpi')
  , grammar = require('mkpi/lib/grammar')
  , id = 'custom-macro';

grammar[id] = function(cb) {
  // implement macro logic
  cb();
}

mkpi({grammar: grammar});
```

### Macro Functions

A macro function accepts a single argument `cb` which must be invoked when processing is complete, an `Error` may be passed to the callback.

They access all pertinent information via `this`, for example:

```javascript
function(cb) {
  var tag = this.tag;
  console.error(tag.name);
  cb();
}
```

Note the exception that `@macro` function body definitions that return a value other than `undefined` should not call the callback.

See the [grammar api docs](#grammar-1) for more information.

## API

### pi

```javascript
pi([opts][, cb])
```

Execute processing instructions found in the AST.

Instructions are removed from the AST by default, use `preserve` to keep
them in the output.

When no `input` and no `output` are specified the parser stream
is returned and `cb` is ignored.

Returns an output stream.

* `opts` Object processing options.
* `cb` Function callback function.

#### Options

* `input` Readable input stream.
* `output` Writable output stream.
* `grammar` Object grammar macro functions.
* `preserve` Boolean keep processing instructions in the AST.

### Grammar

Default map of tag names to grammar macro functions.

A macro function has the signature `function(cb)`, it should always invoke
the callback and may pass an error.

It can access the following fields via `this`:

- `writer`: output stream, write AST nodes to this stream.
- `comment`: parsed processing instruction comment.
- `tag`: the tag that fired the macro function.
- `parser`: markdown parser (`parser.parse()` to convert strings to nodes).
- `grammar`: grammar document, map of tag identifiers to macro functions.
- `preserve`: whether to preserve the processing instructions.

#### exec

```javascript
exec(cb)
```

Run an external command, newlines are removed from the command so it
may span multiple lines.

```xml
<? @exec pwd ?>
```

To capture the stderr stream set `stderr` before the command:

```xml
<? @exec stderr pwd ?>
```

By default an error is reported if the command fails, to include the
output when a command returns a non-zero exit code use the `@exec!` tag:

```xml
<? @exec! pwd ?>
```

To wrap a result in a fenced code block specify a `type`:

```xml
<? @exec {javascript} cat index.js ?>
```

If you want the result in a fenced code block with no info string use:

```xml
<? @exec {} cat index.js ?>
```

* `cb` Function callback function.

#### include

```javascript
include(cb)
```

Include one or more markdown files into the AST, processing instructions
in included files are executed.

```html
<? @include intro.md install.md ?>
```

If a type is given it is a relative or absolute path to include from:

```html
<? @include {path/to/folder} intro.md install.md ?>
```

Include files are resolved relative to the including file when file
data is available (`mkcat file.md`), but when no file data is available,
for example from stdin (`cat file.md | mkcat`), then files are resolved
relative to the current working directory.

* `cb` Function callback function.

#### macro

```javascript
macro(cb)
```

Accepts a function body, compiles it and executes the function.

Use this for inline application-specific logic.

The function is assumed to be a standard macro function implementation
that accepts the arguments:

- `cb`: callback function to invoke when not returning a value.

It is also passed an additional non-standard argument:

- `require`: alias to require files relative to the cwd.

If the function returns a value other than `undefined` the result is
parsed as markdown and written to the stream and and control flow
is returned (as if `cb` was invoked automatically).

```xml
<? @macro return require('package.json').name; ?>
```

Otherwise the macro **must** invoke the callback function and should
pass an optional error and result string to the callback:

```xml
<? @macro cb(null, '*emph*'); ?>
```

* `cb` Function callback function.

#### Parser

```javascript
new Parser([opts])
```

Finds processing instructions in the stream, parses those found with
[mkparse][] and invokes a macro function if it exists for a tag in
the parsed processing instruction.

* `opts` Object processing options.

##### Options

* `preserve` Boolean=false keep processing instructions.

#### replace

```javascript
replace(str)
```

Parse a substitution definition in the form `s/{regexp}/{string}/gimy`.

When the `str` can be parsed the returned object includes:

- `regexp`: RegExp compiled pattern.
- `replace`: String replacement string.
- `flags`: String regexp flags.

If it cannot be parsed null is returned.

Returns replacement object or null.

* `str` String substitution definition.

##### Throws

* `SyntaxError` if the regexp pattern is malformed.

#### source

```javascript
source(cb)
```

Load and parse a file as markdown without executing processing instructions
or wrap the file in a fenced code block.

```html
<? @source file.md ?>
<? @source {javascript} index.js ?>
```

* `cb` Function callback function.

## License

MIT

Generated by [mkdoc](https://github.com/mkdoc/mkdoc).

[mkdoc]: https://github.com/mkdoc/mkdoc
[mkparse]: https://github.com/mkdoc/mkparse
[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

