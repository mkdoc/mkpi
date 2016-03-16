var sh = require('child_process').exec
  , Node = require('mkast').Node
  , ERR = 'stderr'
  , FAILS = 'exec!';

/**
 *  Run an external command, newlines are removed from the command so it 
 *  may span multiple lines.
 *
 *  ```xml
 *  <? @exec pwd ?>
 *  ```
 *
 *  To capture the stderr stream set `stderr` before the command:
 *
 *  ```xml
 *  <? @exec stderr pwd ?>
 *  ```
 *
 *  By default an error is reported if the command fails, to include the 
 *  output when a command returns a non-zero exit code use the `@exec!` tag:
 *
 * ```xml
 *  <? @exec! pwd ?>
 *  ```
 *
 *  To wrap a result in a fenced code block specify a `type`:
 *
 * ```xml
 *  <? @exec {javascript} cat index.js ?>
 *  ```
 *  
 *  If you want the result in a fenced code block with no info string use:
 *  
 * ```xml
 *  <? @exec {} cat index.js ?>
 *  ```
 *
 *  @module {function} exec
 *
 *  @param {Function} cb callback function.
 */
function exec(cb) {
  var writer = this.writer
    , tag = this.tag
    , parser = this.parser
    // fetch everything after tag id and type
    , cmd = tag.body.trim().replace(/\r?\n/gm, '')
    , info = tag.type
    , fails = tag.id === FAILS
    , errs = tag.name === ERR
    , opts = {
        env: process.env,
        shell: process.env.SHELL
      };

  if(errs) {
    cmd = tag.description.trim().replace(/\r?\n/gm, ''); 
  }

  sh(cmd, opts, function(err, stdout, stderr) {
    var doc
      , code
      , res = (tag.name === ERR) ? stderr : stdout;

    if(!fails && err) {
      return cb(err); 
    }

    // wrap in fenced code block
    if(info !== undefined) {
      doc = new Node('document')
      code = new Node('code_block');

      code._literal = '' + res;
      if(info) {
        code._info = info;
      }

      doc.appendChild(code);
      writer.end(code);
    }else{
      doc = parser.parse(res);
      doc._cmd = cmd;
      writer.end(doc);
    }
  })
}

module.exports = exec;
