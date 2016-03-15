var sh = require('child_process').exec
  , Walk = require('mkast/lib/walk')
  , parser = new require('mkast').Parser()
  , Node = require('mkast').Node
  , ERR = 'stderr'
  , FAILS = 'fails';

/**
 *  Run an external command.
 *
 *  ```html
 *  <? @exec pwd ?>
 *  ```
 *
 *  To capture the stderr stream set `stderr` before the command:
 *
 *  ```html
 *  <? @exec stderr pwd ?>
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
      .replace(/^\s*@[^\s]*\s+(\{[^\}]+\})?/, '').trim().replace(/\r?\n/gm, '')
    , comment = state.comment
    , info = tag.type
    , fails = false
    , errs = tag.name === ERR
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

  if(errs) {
    cmd = tag.description.trim().replace(/\r?\n/gm, ''); 
  }

  sh(cmd, opts, function(err, stdout, stderr) {
    var doc
      , code
      , walk
      , res = (tag.name === ERR) ? stderr : stdout;


    if(!fails && err) {
      return cb(err); 
    }

    if(info && info !== ERR) {
    
      doc = new Node('document')
      code = new Node('code_block');

      code._literal = '' + stdout;
      if(tag.type || tag.description) {
        code._info = tag.type + (tag.description ? ' ' + tag.description : '');
      }
      doc.appendChild(code);

      walk = new Walk({eof: false})

      walk.on('data', function(buf) {
        state.serializer.write(buf);
      })

      walk.once('finish', function() {
        cb();
      });

      walk.end(doc);
    }else{
      doc = parser.parse(res);

      doc._cmd = cmd;

      walk = new Walk({eof: false})

      walk.on('data', function(buf) {
        state.serializer.write(buf);
      })

      walk.once('finish', function() {
        cb();
      });

      walk.end(doc);
    }
  })
}

module.exports = exec;
