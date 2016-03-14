var mkast = require('mkast')
  , Serialize = require('mkast/lib/serialize')
  , mkparse = require('mkparse')
  , through = require('through3');

/**
 *  Stream that transforms the incoming AST.
 *
 *  @constructor Parser
 */
function Parser(opts) {
  opts = opts || {};
  this.grammar = opts.grammar || require('./grammar');
}

/**
 *  @private
 */
function parser(chunk, encoding, cb) {
  var comment
    , state = {file: this._file}
    , scope = this
    , grammar = this.grammar;

  function execute() {
    var tags = comment.tags.slice();

    function next(err) {
      if(err) {
        return cb(err); 
      }
      var tag = tags.shift();
      // all done
      if(!tag) {
        return cb(); 
      }
      if(grammar[tag.id] instanceof Function) {
        return grammar[tag.id].call(scope, tag, state, next); 
      }
      next();
    }

    // start processing
    next();
  }

  function onComment(res) {
    comment = res;
  }

  function onFinish(err) {
    if(err) {
      return cb(err); 
    }

    // something went wrong, could not find comment
    if(!comment) {
      return cb(); 
    }

    // execute the processing instructions
    execute();
  }

  if(chunk._type === 'document') {
    this._file = chunk._file;
  }else if(chunk._type === 'eof') {
    this._file = null;
  }else if(chunk._type === 'html_block' && chunk._htmlBlockType === 3) {
    var str = chunk._literal
      , stream = mkparse.parse(
          str, {rules: require('mkparse/lang/pi')}, onFinish);
    stream.on('comment', onComment);
    return;
  }
  // pass through untouched
  this.push(chunk);
  cb();
}

var ParserStream = through.transform(parser, {ctor: Parser});

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
    .pipe(new Serialize())
    .pipe(opts.output);

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

module.exports = pi;
