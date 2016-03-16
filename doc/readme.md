# Processing Instructions

[![Build Status](https://travis-ci.org/mkdoc/mkpi.svg?v=3)](https://travis-ci.org/mkdoc/mkpi)
[![npm version](http://img.shields.io/npm/v/mkpi.svg?v=3)](https://npmjs.org/package/mkpi)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkpi/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkpi?branch=master)

> Script markdown documents

<? @include {=readme} introduction.md install.md ?>

## Usage

<? @source {javascript=s/\.\.\/index/mkpi/gm} usage.js ?>

## Example

This [readme document](/README.md) ([raw version](https://raw.githubusercontent.com/mkdoc/mkpi/master/README.md)) was built from the source file [doc/readme.md](/doc/readme.md) shown below:

<? @source {markdown} readme.md ?>

Using the command:

<? @macro {shell} return require('./package.json').scripts.readme ?>

<? @include {=readme} macros.md ?>
<? @exec ./sbin/apidocs ?>
<? @include {=readme} license.md links.md ?>
