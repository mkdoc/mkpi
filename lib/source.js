var fs = require('fs')
  , path = require('path')
  , Node = require('mkast').Node;

/**
 *  Load and parse a file as markdown without executing processing instructions 
 *  or wrap the file in a fenced code block.
 *
 *  ```html
 *  <? @source file.md ?>
 *  <? @source {javascript} index.js ?>
 *  ```
 *
 *  @module {function} source
 *
 *  @param {Function} cb callback function.
 */
function source(cb) {
  var writer = this.writer
    , tag = this.tag
    , parser = this.parser
    , info = tag.type
    , file = tag.name
    // if the document has no associated file (stdin)
    // then the paths are relative to the cwd
    , rel = process.cwd();

  // work out relative path
  if(this.file) {
    rel = path.dirname(this.file); 
  }

  file = path.join(rel, file);

  fs.readFile(file, function(err, buf) {
    if(err) {
      return cb(err); 
    }

    var result = '' + buf;

    if(info !== undefined) {
      var code = new Node('code_block');

      code._literal = result;
      if(info) {
        code._info = info;
      }

      writer.end(code);
    }else{
      writer.end(parser.parse(result));
    }
  })
}

module.exports = source;
