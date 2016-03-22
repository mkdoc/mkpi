var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @macro pi (callback)', function(done) {
    var source = 'test/fixtures/macro-callback.md'
      , target = 'target/macro-callback.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          "<? @macro cb(null, '*emphasis*'); ?>"
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

      expect(result[2].type).to.eql('paragraph');
      expect(result[2].firstChild.type).to.eql('emph');
      expect(result[2].firstChild.firstChild.type).to.eql('text');
      expect(result[2].firstChild.firstChild.literal).to.eql('emphasis');

      done(err);
    })
  });

});
