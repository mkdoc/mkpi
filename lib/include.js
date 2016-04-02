var fs = require('fs')
  , path = require('path')
  , Node = require('mkast').Node
  , Walk = require('mkast/lib/walk')
  , INDEX = 'index.md';

/**
 *  Include one or more markdown files into the AST, processing instructions 
 *  in included files are executed.
 *
 *  ```html
 *  <? @include intro.md install.md ?>
 *  ```
 *
 *  If a type is given it is a relative or absolute path to include from:
 *
 *  ```html
 *  <? @include {path/to/folder} intro.md install.md ?>
 *  ```
 *
 *  Include files are resolved relative to the including file when file 
 *  data is available (`mkcat file.md`), but when no file data is available, 
 *  for example from stdin (`cat file.md | mkcat`), then files are resolved 
 *  relative to the current working directory.
 *
 *  @module {function} include
 *
 *  @param {Function} cb callback function.
 */
function include(cb) {
  var writer = this.writer
    , tag = this.tag
    , options = this.options
    , Parser = this.Parser
    , parser = this.parser
    , files = (tag.name + ' ' + tag.description).trim().split(/\s+/)
    , file
    , owner = this.file
    // if the document has no associated file (stdin)
    // then the paths are relative to the cwd
    , rel = process.cwd();

  // work out relative path
  if(owner) {
    rel = path.dirname(owner); 
  }

  if(tag.value) {
    /* istanbul ignore next: don't want to use absolute path in tests */
    rel = /^\//.test(tag.value) ? tag.value : path.join(rel, tag.value);
  }

  function onRead(err, content) {

    /* istanbul ignore next: tough to mock as stat() already called */
    if(err) {
      return cb(err);
    } 

    var doc = parser.parse('' + content);
    doc.file = file;
    if(owner) {
      doc.owner = owner; 
    }

    // must re-parse included files so that 
    // processing instructions in the includes
    // works as expected
    var walk = new Walk({eof: false})
      , pi = new Parser(options);

    walk.pipe(pi);

    pi.on('data', function(buf) {
      writer.write(buf);
    })

    pi.once('finish', function() {
      it();
    });

    walk.write(doc);
    walk.end(Node.createNode(Node.EOF, {file: file}));
  }

  function onStat(err, stat) {
    if(err) {
      return cb(err); 
    }
    if(stat && stat.isDirectory()) {
      file = path.join(file, INDEX);
    }
    fs.readFile(file, onRead);
  }

  function it() {
    file = files.shift();
    if(!file) {
      return cb(); 
    }
    file = path.join(rel, file);
    fs.stat(file, onStat);
  }
  it();
}

module.exports = include;
