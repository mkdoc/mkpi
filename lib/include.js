var fs = require('fs')
  , path = require('path')
  , mkast = require('mkast')
  , Walk = require('mkast/lib/walk')
  , Parser = mkast.Parser;

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
 *  @param {Object} tag parsed tag data.
 *  @param {Object} state processing instruction state.
 *  @param {Function} cb callback function.
 */
function include(tag, state, cb) {
  var files = (tag.name + ' ' + tag.description).trim().split(/\s+/)
    , file
    // if the document has no associated file (stdin)
    // then the paths are relative to the cwd
    , rel = process.cwd();

  // work out relative path
  if(state.file) {
    rel = path.dirname(state.file); 
  }

  if(tag.type) {
    rel = /^\\/.test(tag.type) ? tag.type : path.join(rel, tag.type);
  }

  function onRead(err, content) {
    if(err) {
      return cb(err);
    } 
    var parser = new Parser()
      , doc = parser.parse('' + content);
    doc._file = file;
    if(state.file) {
      doc._owner = state.file; 
    }

    // must re-parse included files so that 
    // processing instructions in the includes
    // works as expected
    var walk = new Walk({eof: false})
      , pi = new state.Parser(
          {
            grammar: state.grammar,
            serializer: state.serializer,
            preserve: state.preserve
          });

    walk.pipe(pi);

    pi.on('data', function(buf) {
      state.serializer.write(buf);
    })

    pi.once('finish', function() {
      it();
    });

    walk.end(doc);
  }

  function it() {
    file = files.shift();
    if(!file) {
      return cb(); 
    }
    file = path.join(rel, file);
    fs.readFile(file, onRead);
  }
  it();
}

module.exports = include;
