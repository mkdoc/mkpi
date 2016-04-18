## Example

Execute processing instructions in a file:

```shell
mkcat README.md | mkpi | mkout
```

Disable unsafe macros for untrusted input:

```shell
mkcat README.md | mkpi --safe | mkout
```

