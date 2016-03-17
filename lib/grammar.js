/**
 *  Default map of tag names to grammar macro functions.
 *
 *  A macro function has the signature `function(cb)`, it should always invoke 
 *  the callback and may pass an error.
 *
 *  It can access the following fields via `this`:
 *
 *  - `writer`: output stream, write AST nodes to this stream.
 *  - `comment`: parsed processing instruction comment.
 *  - `tag`: the tag that fired the macro function.
 *  - `parser`: markdown parser (`parser.parse()` to convert strings to nodes).
 *  - `grammar`: grammar document, map of tag identifiers to macro functions.
 *  - `preserve`: whether to preserve the processing instructions.
 *
 *  @module Grammar
 */

var exec = require('./exec');
module.exports = {
  macro: require('./macro'),
  include: require('./include'),
  source: require('./source'),
  exec: exec,
  'exec!': exec
}
