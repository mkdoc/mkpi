## Grammar

The default processing instruction grammar includes functions for including markdown documents, executing commands and wrapping results in fenced code blocks.

### @include

Include one or more markdown documents into the AST stream:

```html
<? @include intro.md install.md license.md ?>
```

Processing instructions in included files are also executed, paths are resolved relative to the owner document when a file is available.

### @exec

Execute a command and parse the stdout result into the AST stream:

```html
<? @exec pwd ?>
```

To capture the stderr stream:

```html
<? @exec {err} pwd ?>
```
