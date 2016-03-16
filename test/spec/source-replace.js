
var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @source pi (w/ info string and replace regexp)',
    function(done) {
      var source = 'test/fixtures/source-replace.md'
        , target = 'target/source-replace.json.log'
        , parser = new Parser()
        , data = parser.parse('' + fs.readFileSync(source))
        , expected
        , instructions = [
          '<? @source {javascript=s/\\.\\.\\/index/mkpi/} usage.js ?>'
          ];

      expected = "var mkpi = require(\'mkpi\');\n// read from process.stdin, "
        + "write to process.stdout\nmkpi();\n";

      // mock file for correct relative path
      // mkcat normally injects this info
      data._file = source;

      var input = mkast.serialize(data)
        , output = fs.createWriteStream(target)
        , opts = {input: input, output: output, preserve: true};
      
      mkpi(opts);

      output.once('finish', function() {
        var result = ('' + fs.readFileSync(target)).trim().split('\n');
        result = result.map(function(line) {
          return JSON.parse(line); 
        })

        expect(result).to.be.an('array');
        expect(result[1]._literal).to.eql(instructions[0]);

        expect(result[2]._info).to.eql('javascript');
        expect(result[2]._literal)
          .to.eql(expected);

        done();
      })
    }
  );

});
