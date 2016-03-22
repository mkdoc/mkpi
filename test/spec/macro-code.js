var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @macro pi (code)', function(done) {
    var source = 'test/fixtures/macro-code.md'
      , target = 'target/macro-code.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          "<? @macro {shell} return require('./package.json').scripts.readme ?>"
        ]

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

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
      expect(result[1].literal).to.eql(instructions[0]);

      expect(result[2].literal).to.eql(
        require('../../package.json').scripts.readme + '\n');

      done(err);
    })
  });

});
