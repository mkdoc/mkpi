<? @include {readme} introduction.md install.md ?>

## Example

This [readme document](/README.md) was built from the source file ([doc/readme.md](/doc/readme)) shown below:

<? @source {markdown} readme.md ?>
<? @include {readme} macros.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {readme} license.md links.md ?>
