var ptn = /^s\/([^\/\\]*(?:\\.?[^\/\\]*)*)\/([^\/]+)\/([gimy]*)$/;

/**
 *  Parse a substitution definition in the form `s/{regexp}/{string}/gimy`.
 *
 *  When the `str` can be parsed the returned object includes:
 *
 *  - `regexp`: RegExp compiled pattern.
 *  - `replace`: String replacement string.
 *  - `flags`: String regexp flags.
 *
 *  If it cannot be parsed null is returned.
 *
 *  @param {String} str substitution definition string.
 *
 *  @throws SyntaxError if the regexp pattern is malformed.
 *
 *  @returns replacement object or null.
 */
function replace(str) {
  var out = null;
  function replacer(match, regexp, replace, flags) {
    out = {};
    out.regexp = regexp; 
    out.replace = replace;
    out.flags = flags;
  }

  str.replace(replace.pattern, replacer);

  if(out && out.regexp) {
    out.regexp = new RegExp(out.regexp, out.flags); 
  }
  return out;
}

replace.pattern = ptn;

module.exports = replace;
