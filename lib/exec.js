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
  var cmd = (tag.name + ' ' + tag.description).replace(/\n/g, '')
    , opts = {};

  sh(cmd, opts, function(err, stdout, stderr) {
    if(err) {
      return cb(err); 
    }
    var res = state.stderr ? stderr : stdout
      , doc = parser.parse(res);

    //console.dir(doc);
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
