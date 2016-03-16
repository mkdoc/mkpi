## Macros

The default processing instruction grammar includes functions for including markdown documents, executing commands and more.

### Custom Macros

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

You macro function will then be executed when the `<? @custom-macro ?>` processing instruction is encountered.

### Grammar

These macros are defined in the default grammar.

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

Load a file and wrap it in a fenced code block, the tag `type` is the info string:

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
