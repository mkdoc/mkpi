var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @exec pi (stdout)', function(done) {
    var source = 'test/fixtures/exec-stdout.md'
      , target = 'target/exec.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<?\n  @exec test/bin/exec-stdout\n?>'
        ]

    // mock file for correct relative path
    // mkcat normally injects this info
    data._file = source;

    var input = mkast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {input: input, output: output};
    
    mkpi(opts);

    output.once('finish', function(err) {
      var result = ('' + fs.readFileSync(target)).trim().split('\n');
      result = result.map(function(line) {
        return JSON.parse(line); 
      })

      expect(result).to.be.an('array');
      expect(result[1]._literal).to.eql(instructions[0]);

      // skip the open document

      expect(result[3]._firstChild._literal).to.eql('exec-stdout');

      done(err);
    })
  });

});