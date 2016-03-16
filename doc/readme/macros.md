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

You can specify a path to include from using the tag type:

```xml
<? @include {path/to/folder} intro.md install.md license.md ?>
```

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

#### @macro

Defines a macro function body; use this for application specific logic.

Return a value to inject some information into the stream:

```xml
<?
  @macro return require('./package.json').name;
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

A macro function accepts a single argument `cb` which must be invoked when processing is complete, an `Error` may be passed to the callback. With the exception that `@macro` function body definitions that return a value other than `undefined` should not call the callback.

They access all pertinent information via `this`, for example:

```javascript
function(cb) {
  var tag = this.tag;
  console.error(tag.name);
  cb();
}
```

See the [grammar api docs](#grammar-1) for more information.
