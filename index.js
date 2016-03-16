var mkast = require('mkast')
  , Serialize = require('mkast/lib/serialize')
  , Parser = require('./lib/parser');

/**
 *  Execute processing instructions found in the AST.
 *
 *  Instructions are removed from the AST by default, use `preserve` to keep 
 *  them in the output.
 *
 *  @function pi
 *  @param {Object} [opts] processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {Readable=process.stdin} [input] input stream.
 *  @option {Writable=process.stdout} [output] output stream.
 *  @option {Object} [grammar] grammar macro functions.
 *  @option {Boolean} [preserve] keep processing instructions in the AST.
 *
 *  @returns an output stream.
 */
function pi(opts, cb) {

  /* istanbul ignore next: always pass options in test specs */
  opts = opts || {};
  /* istanbul ignore next: never use process streams in test specs */
  opts.input = opts.input || process.stdin;
  /* istanbul ignore next: never use process streams in test specs */
  opts.output = opts.output || process.stdout;

  var serialize = new Serialize()
    , options = {
        grammar: opts.grammar,
        serializer: serialize,
        preserve: opts.preserve
      }
    , parser = new Parser(options);

  mkast.parser(opts.input)
    .pipe(parser)
    .pipe(serialize)
    .pipe(opts.output);

  if(cb) {

    parser.once('error', cb)
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

module.exports = pi;
