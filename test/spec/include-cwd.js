var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @include pi', function(done) {
    var source = 'test/fixtures/include-cwd.md'
      , target = 'target/include-cwd.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<? @include .gitignore ?>',
        ]

    // NOTE: do not inject file to change path resolution

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

      // skip the open document

      expect(result[1].literal).to.eql(instructions[0]);

      // skip the open document

      expect(result[3].type).to.eql('paragraph');

      expect(result[result.length - 1].type).to.eql('eof');
      done(err);
    })
  });

});
