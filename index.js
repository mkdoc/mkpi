var mkast = require('mkast')
  , Serialize = require('mkast/lib/serialize')
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

  /* istanbul ignore next: always pass options in test specs */
  opts = opts || {};
  opts.input = opts.input;
  opts.output = opts.output;

  var serialize = new Serialize()
    , options = {
        grammar: opts.grammar,
        serializer: serialize,
        preserve: opts.preserve
      }
    , parser = new Parser(options);

  if(!opts.input && !opts.output) {
    return parser; 
  }

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

function serialize(opts) {
  return new Serialize(opts);
}

pi.serialize = serialize;

module.exports = pi;
