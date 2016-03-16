var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @macro pi (return with newline)', function(done) {
    var source = 'test/fixtures/macro-return-newline.md'
      , target = 'target/macro-return-newline.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          "<? @macro {} return require('./package.json').name + '\\n'; ?>"
        ]

    // mock file for correct relative path
    // mkcat normally injects this info
    data._file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output, preserve: true};
    
    mkpi(opts);

    output.once('finish', function(err) {
      var result = ('' + fs.readFileSync(target)).trim().split('\n');
      result = result.map(function(line) {
        return JSON.parse(line); 
      })

      expect(result).to.be.an('array');
      expect(result[1]._literal).to.eql(instructions[0]);

      expect(result[2]._literal).to.eql(
        require('../../package.json').name + '\n');

      done(err);
    })
  });

});
