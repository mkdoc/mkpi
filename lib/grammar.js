/**
 *  Default map of tag names to grammar macro functions.
 *
 *  @module Grammar
 */
var exec = require('./exec');
module.exports = {
  include: require('./include'),
  source: require('./source'),
  exec: exec,
  fails: exec
}
