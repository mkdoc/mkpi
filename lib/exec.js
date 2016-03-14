var sh = require('child_process').exec
  , Walk = require('mkast/lib/walk')
  , parser = new require('mkast').Parser();

/**
 *  Run an external command.
 *
 *  ```html
 *  <? @exec pwd ?>
 *  ```
 *
 *  To capture the stderr stream set the type to `err`:
 *
 *  ```html
 *  <? @exec {err} pwd ?>
 *  ```
 *
 *  Newlines are removed from the tag data so a command 
 *  may span multiple lines.
 *
 *  @function exec
 *
 *  @param {Object} tag parsed tag data.
 *  @param {Object} state processing instruction state.
 *  @param {Function} cb callback function.
 */
function exec(tag, state, cb) {
  var cmd = tag.source
      .replace(/^\s*@[^\s]*\s+(\{[^\}]+\})?/, '').trim().replace('\n', '')
    , opts = {};

  sh(cmd, opts, function(err, stdout, stderr) {

    if(err) {
      return cb(err); 
    }

    var res = (tag.type === 'err') ? stderr : stdout
      , doc = parser.parse(res);

    doc._cmd = cmd;

    var walk = new Walk({eof: false})

    walk.on('data', function(buf) {
      state.serializer.write(buf);
    })

    walk.once('finish', function() {
      cb();
    });

    walk.end(doc);
  })
}

module.exports = exec;
