//var vm = require('vm');
var path = require('path')
  , mkast = require('mkast')
  , Walk = require('mkast/lib/walk')
  , parser = new mkast.Parser();

/**
 *  @private
 *
 *  Overload require() so that paths resolve to the cwd().
 */
function req(file) {
  if(/\//.test(file) && !/^\//.test(file)) {
    file = path.join(process.cwd(), file);
  }
  return require(file);
}

/**
 *  Accepts a function body, compiles it and executes the function.
 *
 *  The function is assumed to be a standard macro function implementation 
 *  that accepts the arguments:
 *
 *  - `tag`: the current @macro tag.
 *  - `state`: the processing state.
 *  - `cb`: callback function to invoke when not returning a value.
 *  - `require`: alias to require files relative to the cwd.
 *
 *  If the function returns a value other than `undefined` the callback is 
 *  invoked immediately and control flow is returned.
 *
 *  ```html
 *  <? @macro return require('package.json').name; ?>
 *  ```
 *
 *  The return value is converted to a string, parsed to a markdown AST and 
 *  written to the stream.
 *
 *  Otherwise the macro **must** invoke the callback function and should write 
 *  AST object(s) to the output stream via `state.serializer.write`.
 *
 *  @module {function} macro
 *
 *  @param {Object} tag parsed tag data.
 *  @param {Object} state processing instruction state.
 *  @param {Function} cb callback function.
 */
function macro(tag, state, cb) {
  var func
    , result
    , doc
    , next;

  try {
    //script = new vm.Script(body);

    /* jshint ignore:start */
    func = new Function('tag', 'state', 'cb', 'require', tag.body);
    /* jshint ignore:end */
  }catch(e) {
    return cb(e); 
  }

  var walk = new Walk({eof: false})

  walk.on('data', function(buf) {
    state.serializer.write(buf);
  })

  walk.once('finish', function() {
    cb();
  });

  function write() {
  
    result = '' + result;

    // iterate children we don't write the `document` element
    doc = parser.parse(result);
    next = doc.firstChild;
    while(next) {
      walk.write(next);
      next = next.next; 
    }
    walk.end();

  }

  function complete(err, result) {
    if(err) {
      return cb(err); 
    }else if(result !== undefined) {
      return write(result); 
    }
    cb();
  }

  result = func(tag, state, complete, req);

  // print result to the stream
  if(result !== undefined) {
    return write();
  }

  // expect the function to invoke the callback with no 
  // return value
}

module.exports = macro;
