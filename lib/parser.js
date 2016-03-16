var through = require('through3')
  , Walk = require('mkast/lib/walk')
  , astparser = new require('mkast').Parser()
  , mkparse = require('mkparse');

/**
 *  Stream that transforms the incoming AST.
 *
 *  @constructor Parser
 *  @private
 */
function Parser(opts) {
  opts = opts || {};
  this.grammar = opts.grammar || require('./grammar');
  this.serializer = opts.serializer;
  this.preserve = opts.preserve;
}

/**
 *  @private
 */
function parser(chunk, encoding, cb) {
  var comment
    , state = {
        stream: this,
        file: this._file,
        Parser: module.exports,
        parser: astparser,
        grammar: this.grammar,
        serializer: this.serializer,
        preserve: this.preserve
      }
    , grammar = this.grammar
    , preserve = this.preserve
    , writer;

  function execute() {

    if(!comment) {
      return cb();
    }

    var tags = comment.tags.slice();

    //console.error(comment);

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
        state.serializer.write(buf);
      })

      writer.once('finish', function() {
        next();
      });

      var macro = grammar[tag.id];
      if(macro instanceof Function) {
        return macro.call(state, next); 
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

    // execute the processing instructions
    execute();
  }

  function pi(str) {
    var stream = mkparse.parse(
          str, {rules: require('mkparse/lang/pi')}, onFinish);
    stream.on('comment', onComment);
  }

  if(chunk._type === 'document') {
    this._file = chunk._file;
  }else if(chunk._type === 'eof') {
    this._file = null;
  // got a processing instruction
  }else if(chunk._type === 'html_block'
    && chunk._htmlBlockType === 3) {
    if(preserve) {
      this.push(chunk);
    }
    return pi(chunk._literal);
  }

  // pass through untouched
  this.push(chunk);
  cb();
}

module.exports = through.transform(parser, {ctor: Parser});
