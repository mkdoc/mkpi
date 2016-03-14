var fs = require('fs')
  , path = require('path')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

/**
 *  Include one or more markdown files into the AST.
 */
function include(tag, state, cb) {
  var files = (tag.name + ' ' + tag.description).trim().split(/\s+/)
    , rel = process.cwd();

  console.dir('grammar function');
  console.dir(state);
  console.dir(files);

  // work out relative path
  if(state.file) {
    rel = path.dirname(state.file); 
  }

  function onRead(err, content) {
    if(err) {
      return cb(err);
    } 
    var parser = new Parser()
      , doc = parser.parse('' + content);
    console.dir(doc);
    it();
  }

  function it() {
    var file = files.shift();
    if(!file) {
      return cb(); 
    }
    file = path.join(rel, file);
    console.dir('file: ' + file);
    fs.readFile(file, onRead);
  }
  it();
}

module.exports = {
  include: include
}
