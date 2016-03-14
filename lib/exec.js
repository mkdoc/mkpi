var sh = require('child_process').exec
  , Walk = require('mkast/lib/walk')
  , parser = new require('mkast').Parser()
  , FAILS = 'fails';

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
 *  By default an error is reported if the command fails, to include the 
 *  output when a command returns a non-zero exit code use the `@fails` tag:
 *
 * ```html
 *  <?
 *    \@fails
 *    \@exec pwd
 *  ?>
 *  ```
 *
 *  Newlines are removed from the tag data so a command 
 *  may span multiple lines.
 *
 *  @module {function} exec
 *
 *  @param {Object} tag parsed tag data.
 *  @param {Object} state processing instruction state.
 *  @param {Function} cb callback function.
 */
function exec(tag, state, cb) {
  // fetch everything after tag id and type
  var cmd = tag.source
      .replace(/^\s*@[^\s]*\s+(\{[^\}]+\})?/, '').trim().replace('\n', '')
    , comment = state.comment
    , fails = false
    , opts = {
        env: process.env,
        shell: process.env.SHELL
      };

  for(var i = 0;i < comment.tags.length;i++) {
    if(comment.tags[i].id === FAILS) {
      fails = true;
      break;
    } 
  }

  sh(cmd, opts, function(err, stdout, stderr) {

    if(!fails && err) {
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
