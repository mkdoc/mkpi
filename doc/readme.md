# Processing Instructions

<? @include readme/badges.md ?>

> Script markdown documents

<? @include {=readme} introduction.md install.md ?>

## Usage

<? @source {javascript=s/\.\.\/index/mkpi/gm} usage.js ?>

<? @include readme/example.md ?>
<? @source {markdown} readme.md ?>

Using the command:

<? @macro {shell} return require('./package.json').scripts.readme ?>

<? @include {=readme} macros.md help.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {=readme} license.md links.md ?>
