var fs = require('fs')
  , path = require('path')
  , Node = require('mkast').Node;

/**
 *  Load a file and wrap it in a fenced code block.
 *
 *  ```html
 *  <? @source {javascript} index.js ?>
 *  ```
 *
 *  @module {function} source
 *
 *  @param {Function} cb callback function.
 */
function source(cb) {
  var state = this
    , tag = state.tag
    , file = tag.name
    // if the document has no associated file (stdin)
    // then the paths are relative to the cwd
    , rel = process.cwd();

  // work out relative path
  if(state.file) {
    rel = path.dirname(state.file); 
  }

  file = path.join(rel, file);

  fs.readFile(file, function(err, buf) {

    if(err) {
      return cb(err); 
    }

    var code = new Node('code_block');

    code._literal = '' + buf;
    if(tag.type || tag.description) {
      code._info = tag.type + (tag.description ? ' ' + tag.description : '');
    }

    state.writer.end(code);
  })
}

module.exports = source;
