## Macros

The default processing instruction grammar includes functions for including markdown documents, executing commands and more.

### @include

Include one or more markdown documents into the AST stream:

```xml
<? @include intro.md install.md license.md ?>
```

Processing instructions in included files are also executed, paths are resolved relative to the owner document when a file is available.

You can specify a path to include from using the tag type:

```xml
<? @include {path/to/folder} intro.md install.md license.md ?>
```

### @exec

Execute a command and parse the result into the AST stream:

```xml
<? @exec pwd ?>
```

To capture the stderr stream use the `stderr` keyword before the command:

```xml
<? @exec stderr pwd ?>
```

An error is reported when a command fails, to include the output of a command with a non-zero exit code use the `@fails` tag:


```xml
<? @fails stderr pwd ?>
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

### @source

Load a file and wrap it in a fenced code block, the tag `type` is the info string:

```xml
<? @source {javascript} index.js ?>
```
