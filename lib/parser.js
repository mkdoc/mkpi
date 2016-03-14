var through = require('through3')
  , mkparse = require('mkparse');

/**
 *  Stream that transforms the incoming AST.
 *
 *  @constructor Parser
 */
function Parser(opts) {
  opts = opts || {};
  this.grammar = opts.grammar || require('./grammar');
  this.serializer = opts.serializer;
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
        serializer: this.serializer
      }
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

  //if(chunk._type === 'paragraph') {
    //console.error('[%s]: %s', chunk._type, chunk._literal || chunk._text);
    //console.error(chunk);
  //}

  if(chunk._type === 'document') {
    this._file = chunk._file;
  }else if(chunk._type === 'eof') {
    this._file = null;
  // got a processing instruction
  }else if(chunk._type === 'html_block'
    && chunk._htmlBlockType === 3) {
    var str = chunk._literal
      , stream = mkparse.parse(
          str, {rules: require('mkparse/lang/pi')}, onFinish);
    stream.on('comment', onComment);
    this.push(chunk);
    return;
  }
  // pass through untouched
  this.push(chunk);
  cb();
}

module.exports = through.transform(parser, {ctor: Parser});
