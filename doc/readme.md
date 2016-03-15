<?
  @include {readme} introduction.md install.md
?>

## Example

This [readme document](/README.md) was built the source file ([doc/readme.md](/doc/readme)):

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
  @include {readme} license.md links.md
?>
