var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @source pi (without info string)', function(done) {
    var source = 'test/fixtures/source-markdown.md'
      , target = 'target/source-markdown.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<? @source source.md ?>'
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

      // skip open document

      expect(result[3]._literal)
        .to.eql('<?\n  @source {javascript} source.js\n?>');

      done(err);
    })
  });

});
