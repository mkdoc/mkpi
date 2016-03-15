## Macros

The default processing instruction grammar includes functions for including markdown documents, executing commands and more.

### @include

Include one or more markdown documents into the AST stream:

```html
<? @include intro.md install.md license.md ?>
```

Processing instructions in included files are also executed, paths are resolved relative to the owner document when a file is available.

You can specify a path to include from using the tag `type`:

```html
<? @include {path/to/folder} intro.md install.md license.md ?>
```

### @exec

Execute a command and parse the result into the AST stream:

```html
<? @exec pwd ?>
```

To capture the stderr stream:

```html
<? @exec stderr pwd ?>
```

An error is reported when a command fails, to include the output of a command with a non-zero exit code use the `@fails` tag:


```html
<?
  @fails
  @exec {err} pwd 
?>
```

### @source

Load a file and wrap it in a fenced code block, the tag `type` is the info string:

```html
<? @source {javascript} index.js ?>
```
