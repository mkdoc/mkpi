Parses and executes processing instructions according to macro functions defined by a grammar.

Uses the [mkparse][] library to form a DSL based on tags declared in processing instructions `<? ... ?>`.

Reads newline-delimited JSON records from an input stream, interprets and executes the instructions and writes the modified AST to the output stream.
