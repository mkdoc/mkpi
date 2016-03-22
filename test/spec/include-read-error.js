var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @include pi (file read error)', function(done) {
    var include = 'test/fixtures/include-read-error.md'
      , target = 'target/include-read-error.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(include));

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = include;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output, preserve: true};
    
    mkpi(opts, function(err) {
      function fn() {
        throw err; 
      }
      expect(fn).throws(/ENOENT/i);
      done();
    });
  });

});
