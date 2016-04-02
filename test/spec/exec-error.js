var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , ast = require('mkast');

describe('mkpi:', function() {

  it('should error when command fails', function(done) {
    var source = 'test/fixtures/exec-error.md'
      , target = 'target/exec-error.json.log'
      , data = ast.parse('' + fs.readFileSync(source));

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output, preserve: true};
    
    mkpi(opts, function(err) {
      function fn() {
        throw err;
      }
      expect(fn).throws(/command failed/i);
      done();
    });
  });

});
