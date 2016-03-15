<?
  @include {readme} introduction.md install.md macros.md
?>

<?
  @exec ./sbin/apidocs
?>

<?
  @include {readme} license.md
?>
