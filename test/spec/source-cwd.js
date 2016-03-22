var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @source pi (relative to cwd)', function(done) {
    var source = 'test/fixtures/source-cwd.md'
      , target = 'target/source-cwd.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<? @source {} .gitignore ?>'
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
      expect(result[1].literal).to.eql(instructions[0]);

      expect(result[2].info).to.eql(undefined);
      expect(result[2].literal)
        .to.eql('' + fs.readFileSync('.gitignore'));

      done(err);
    })
  });

});
