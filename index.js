var mkast = require('mkast')
  , EOL = require('os').EOL
  , attach = require('mkast/lib/attach')
  , through = require('through3');

/**
 *  Stream that transforms the incoming AST.
 *
 *  @constructor Parser
 */
function Parser() {}

/**
 *  @private
 */
function parser(chunk, encoding, cb) {
  var node = attach(chunk);
  if(node._type === 'html_block' && node._htmlBlockType === 3) {
    console.dir(node);
    return cb();
  }

  // pass through untouched
  this.push(chunk);
  cb();
}

/**
 *  @private
 */
function stringify(chunk, encoding, cb) {
  this.push(JSON.stringify(chunk) + EOL);
  cb();
}


var ParserStream = through.transform(parser, {ctor: Parser})
  , Stringify = through.transform(stringify);

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

  var transform = new ParserStream();

  mkast.parser(opts.input)
    .pipe(transform)
    .pipe(new Stringify())
    .pipe(opts.output);

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

module.exports = pi;
