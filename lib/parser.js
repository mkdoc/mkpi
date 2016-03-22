var through = require('through3')
  , Walk = require('mkast/lib/walk')
  , ast = require('mkast')
  , Node = ast.Node
  , astparser = ast.Parser()
  , mkparse = require('mkparse');

/**
 *  Finds processing instructions in the stream, parses those found with 
 *  [mkparse][] and invokes a macro function if it exists for a tag in 
 *  the parsed processing instruction.
 *
 *  @constructor Parser
 *  @param {Object} [opts] processing options.
 *
 *  @option {Boolean=false} [preserve] keep processing instructions.
 */
function Parser(opts) {
  opts = opts || {};
  this.grammar = opts.grammar || require('./grammar');
  this.serializer = opts.serializer;
  this.preserve = opts.preserve;

  // update reference when using default grammar
  opts.grammar = opts.grammar;

  this.options = opts;
}

/**
 *  @private
 */
function parser(chunk, encoding, cb) {
  var comment
    , stream = this
    , state = {
        stream: stream,
        file: this.file,
        Parser: module.exports,
        parser: astparser,
        grammar: this.grammar,
        serializer: this.serializer,
        preserve: this.preserve,
        options: this.options
      }
    , grammar = this.grammar
    , preserve = this.preserve
    , writer;

  function execute() {

    if(!comment) {
      return cb();
    }

    var tags = comment.tags.slice();

    state.comment = comment;

    function next(err) {
      if(err) {
        return cb(err); 
      }
      var tag = tags.shift();
      state.tag = tag;

      // all done
      if(!tag) {
        return cb(); 
      }

      writer = state.writer = new Walk({eof: false})

      writer.on('data', function(buf) {
        // push on to this stream which will work
        // when piped to a serializer or when the pipeline
        // is used directly (composite streams)
        stream.push(buf);
      })

      writer.once('finish', function() {
        next();
      });

      var macro = grammar[tag.id];
      if(macro instanceof Function) {
        return macro.call(state, next); 
      }

      // continue to next tag
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

    // execute the processing instructions
    execute();
  }

  function pi(str) {
    var stream = mkparse.parse(
          str, {rules: require('mkparse/lang/pi')}, onFinish);
    stream.on('comment', onComment);
  }

  if(Node.is(chunk, Node.DOCUMENT)) {
    this.file = chunk.file;
  }else if(Node.is(chunk, Node.EOF)) {
    this.file = null;
  // got a processing instruction
  }else if(Node.is(chunk, Node.HTML_BLOCK)
    && chunk.htmlBlockType === 3 || chunk._htmlBlockType === 3) {
    if(preserve) {
      this.push(chunk);
    }
    return pi(chunk.literal);
  }

  // pass through untouched
  this.push(chunk);
  cb();
}

module.exports = through.transform(parser, {ctor: Parser});
