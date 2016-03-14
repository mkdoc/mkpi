var exec = require('child_process').exec;

/**
 *  Run an external command.
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
  console.error('exec called');
  cb();
}

module.exports = exec;
