//var vm = require('vm');
var path = require('path')
  , mkast = require('mkast')
  , Walk = require('mkast/lib/walk')
  , parser = new mkast.Parser();

/**
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
 *  If the function returns a value other than `undefined` the callback is 
 *  invoked immediately and control flow is returned.
 *
 *  ```html
 *  <? @macro return require('package.json').name; ?>
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
    , doc;

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

  result = func(tag, state, cb, req);

  if(result !== undefined) {
    result = '' + result;

    // iterate children we we don't write the `document` element
    var doc = parser.parse(result)
      , next = doc.firstChild;

    while(next) {
      walk.write(next);
      next = next.next; 
    }
    walk.end();

    return;
  }

  return cb();
}

module.exports = macro;
