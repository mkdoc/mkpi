# Processing Instructions

<? @include readme/badges.md ?>

> Script markdown documents

<? @include {=readme} introduction.md install.md ?>

***
<!-- @toc -->
***

<? @include {=readme} security.md usage.md example.md sample.md ?>

<? @include {=readme} macros.md help.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {=readme} license.md links.md ?>
