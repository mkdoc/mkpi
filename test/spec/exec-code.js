var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Node = mkast.Node
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @exec pi (code)', function(done) {
    var source = 'test/fixtures/exec-code.md'
      , target = 'target/exec-code.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<?\n  @exec {javascript} cat index.js\n?>'
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

      expect(result[2].type).to.eql(Node.CODE_BLOCK);
      expect(result[2].literal).to.eql('' + fs.readFileSync('index.js'));
      expect(result[2].info).to.eql('javascript');

      expect(result[3].type).to.eql('eof');

      done(err);
    })
  });

});
