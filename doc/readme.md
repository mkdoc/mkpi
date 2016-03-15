<?
  @include {readme} introduction.md install.md
?>

## Example

This document was built using:

<?
  @source {markdown} readme.md
?>

<?
  @include {readme} macros.md
?>

<?
  @exec ./sbin/apidocs
?>

<?
  @include {readme} license.md
?>
