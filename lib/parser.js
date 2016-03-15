var through = require('through3')
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
        grammar: this.grammar,
        serializer: this.serializer,
        preserve: this.preserve
      }
    , scope = this
    , grammar = this.grammar;

  function execute() {
    var tags = comment.tags.slice();

    //console.error(comment);

    state.comment = comment;

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

    // execute the processing instructions
    execute();
  }

  if(chunk._type === 'document') {
    this._file = chunk._file;
  }else if(chunk._type === 'eof') {
    this._file = null;
  // got a processing instruction
  }else if(chunk._type === 'html_block'
    && chunk._htmlBlockType === 3) {

    if(this.preserve) {
      this.push(chunk);
    }

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

module.exports = through.transform(parser, {ctor: Parser});
