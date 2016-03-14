/**
 *  Mark a result as appearing in a fenced code block, that tag name and 
 *  description become the info string delimited by a single space.
 *
 *  ```html
 *  <? @code javascript ?>
 *  ```
 *
 *  @function code
 *
 *  @param {Object} tag parsed tag data.
 *  @param {Object} state processing instruction state.
 *  @param {Function} cb callback function.
 */
function code(tag, state, cb) {
  tag.info = tag.name + ' ' + tag.description;
  state.code = tag;
  cb();
}

module.exports = code;
