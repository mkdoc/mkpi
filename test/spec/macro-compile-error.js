var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @macro pi (compile error)', function(done) {
    var source = 'test/fixtures/macro-compile-error.md'
      , target = 'target/macro-compile-error.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source));

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output, preserve: true};
    
    mkpi(opts, function(err) {
      function fn() {
        throw err; 
      }
      expect(fn).throws(SyntaxError);
      done();
    });
  });

});
