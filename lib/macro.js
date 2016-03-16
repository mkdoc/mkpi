var path = require('path')
  , mkast = require('mkast')
  , Node = require('mkast').Node
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
 *  Use this for inline application-specific logic.
 *
 *  The function is assumed to be a standard macro function implementation 
 *  that accepts the arguments:
 *
 *  - `tag`: the current tag.
 *  - `state`: the processing state.
 *  - `cb`: callback function to invoke when not returning a value.
 *
 *  It is also passed an additional non-standard argument:
 *
 *  - `require`: alias to require files relative to the cwd.
 *
 *  If the function returns a value other than `undefined` the result is 
 *  parsed as markdown and written to the stream and and control flow 
 *  is returned (as if `cb` was invoked automatically).
 *
 *  ```xml
 *  <? @macro return require('package.json').name; ?>
 *  ```
 *
 *  Otherwise the macro **must** invoke the callback function and should 
 *  pass an optional error and result string to the callback:
 *
 *  ```xml
 *  <? @macro cb(null, '*emph*'); ?>
 *  ```
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
    , info = tag.type
    , doc
    , next;

  try {
    /* jshint ignore:start */
    func = new Function('tag', 'state', 'cb', 'require', tag.body);
    /* jshint ignore:end */
  }catch(e) {
    return cb(e); 
  }

  function write(result) {
    var code;
    result = '' + result;

    if(info !== undefined) {
      if(result.charAt(result.length - 1) !== '\n') {
        result += '\n'; 
      }
      code = new Node('code_block');
      code._literal = result;
      if(info) {
        code._info = info;
      }
      state.writer.write(code);
    }else{
      // iterate children we don't write the `document` element
      doc = parser.parse(result);
      next = doc.firstChild;
      while(next) {
        state.writer.write(next);
        next = next.next; 
      }
    }
    state.writer.end();
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
    return write(result);
  }

  // expect the macro function to invoke the callback with no 
  // return value
}

module.exports = macro;
