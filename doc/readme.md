<?
  @include {readme} introduction.md install.md macros.md
?>

<?
  @exec mkapi index.js lib/grammar.js --level=2 --title=API
?>

<?
  @include {readme} license.md
?>
