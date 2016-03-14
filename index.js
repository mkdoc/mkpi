var mkast = require('mkast')
  , Serialize = require('mkast/lib/serialize')
  , Parser = require('./lib/parser');

/**
 *  Execute processing instructions found in the AST.
 *
 *  @function pi
 *  @param {Object} [opts] processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {Readable=process.stdin} [input] input stream.
 *  @option {Writable=process.stdout} [output] output stream.
 *
 *  @returns an output stream.
 */
function pi(opts, cb) {
  opts = opts || {};
  opts.input = opts.input || process.stdin;
  opts.output = opts.output || process.stdout;

  var serialize = new Serialize()
    , parser = new Parser({serializer: serialize});

  mkast.parser(opts.input)
    .pipe(parser)
    .pipe(serialize)
    .pipe(opts.output);

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

module.exports = pi;
