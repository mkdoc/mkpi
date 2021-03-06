var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @exec pi (stderr)', function(done) {
    var source = 'test/fixtures/exec-stderr.md'
      , target = 'target/exec-stderr.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<?\n  @exec stderr test/bin/exec-stderr\n?>'
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

      // skip the open document

      expect(result[3].firstChild.literal).to.eql('exec-stderr');

      done(err);
    })
  });

});
