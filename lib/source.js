var fs = require('fs')
  , path = require('path')
  , replace = require('./replace')
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
    , value = tag.value
    , sub
    // if the document has no associated file (stdin)
    // then the paths are relative to the cwd
    , rel = process.cwd();

  // work out relative path
  if(this.file) {
    rel = path.dirname(this.file); 
  }

  file = path.join(rel, file);

  if(value) {
    try {
      sub = replace(value); 
    }catch(e) {
      return cb(e); 
    }
  }

  fs.readFile(file, function(err, buf) {
    if(err) {
      return cb(err); 
    }

    var result = '' + buf;

    if(sub) {
      result = result.replace(sub.regexp, sub.replace);
    }

    if(info !== undefined) {
      var code = Node.createNode(Node.CODE_BLOCK);

      code.literal = result;
      code._isFenced = true;
      code._fenceChar = '`'
      code._fenceLength = 3;
      if(info) {
        code.info = info;
      }

      writer.end(code);
    }else{
      writer.write(parser.parse(result));
      writer.end(Node.createNode(Node.EOF, {file: file}));
    }
  })
}

module.exports = source;
