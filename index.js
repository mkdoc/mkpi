var deserialize = require('mkast').deserialize
  , types = {
      markdown: './lib/render/markdown',
      xml: 'commonmark/lib/xml',
      html: 'commonmark/lib/render/html'
    }

/**
 *  Print via a renderer to an output stream.
 *
 *  @function out
 *  @param {Object} [opts] processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {String} [type] output type.
 *  @option {Readable=process.stdin} [input] input stream.
 *  @option {Writable=process.stdout} [output] output stream.
 *  @option {Object} [render] renderer options.
 *
 *  @returns an output stream.
 */
function out(opts, cb) {
  opts = opts || {};
  opts.input = opts.input || process.stdin;
  opts.output = opts.output || process.stdout;
  opts.type = opts.type || 'markdown';
  opts.render = opts.render || {stream: process.stdout};

  if(opts.type === 'json') {
    opts.input.pipe(opts.output);
    return opts.output; 
  }

  if(!types[opts.type]) {
    return cb(new Error('unknown output type: ' + opts.type)); 
  }

  var Type = require(types[opts.type])
    , renderer = new Type(opts.render);

  deserialize(opts.input, function(err, doc) {
    if(err) {
      return cb(err); 
    }
    opts.output.write(renderer.render(doc), cb);
  });

  if(cb) {
    opts.output
      .once('error', cb)
      .once('finish', cb);
  }

  return opts.output;
}

// supported renderer types
out.types = types;

module.exports = out;
