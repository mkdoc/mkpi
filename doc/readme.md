# Processing Instructions

<? @include {=readme} introduction.md install.md ?>

## Usage

<? @source {javascript=s/\.\.\/index/mkpi/gm} usage.js ?>

## Example

This [readme document](/README.md) was built from the source file [doc/readme.md](/doc/readme.md) shown below:

<? @source {markdown} readme.md ?>

Using the command:

<? @macro {shell} return require('./package.json').scripts.readme ?>

<? @include {=readme} macros.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {=readme} license.md links.md ?>
