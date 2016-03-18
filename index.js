var ast = require('mkast')
  , Parser = require('./lib/parser');

/**
 *  Execute processing instructions found in the AST.
 *
 *  Instructions are removed from the AST by default, use `preserve` to keep 
 *  them in the output.
 *
 *  When no `input` and no `output` are specified the parser stream 
 *  is returned and `cb` is ignored.
 *
 *  @function pi
 *  @param {Object} [opts] processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {Readable} [input] input stream.
 *  @option {Writable} [output] output stream.
 *  @option {Object} [grammar] grammar macro functions.
 *  @option {Boolean} [preserve] keep processing instructions in the AST.
 *
 *  @returns an output stream.
 */
function pi(opts, cb) {

  opts = opts || {};
  opts.input = opts.input;
  opts.output = opts.output;

  var serialize = ast.stringify()
    , options = {
        grammar: opts.grammar,
        serializer: serialize,
        preserve: opts.preserve
      }
    , parser = new Parser(options);

  if(!opts.input && !opts.output) {
    return parser; 
  }

  ast.parser(opts.input)
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
