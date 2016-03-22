var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Node = mkast.Node
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should return stream with no options', function(done) {
    var stream = mkpi();
    expect(stream).to.be.an('object');
    done();
  });

  it('should process @include pi', function(done) {
    var source = 'test/fixtures/include.md'
      , target = 'target/include.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<? \n  @include inc.md \n  @unknown\n?>',
          '<? @include deep.md ?>'
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

      //console.dir(result);

      expect(result).to.be.an('array');
      expect(result[0].type).to.eql(Node.DOCUMENT);
      expect(result[1].type).to.eql(Node.PARAGRAPH);
      expect(result[1].firstChild.literal).to.eql('Paragraph before.');
      expect(result[2].literal).to.eql(instructions[0]);

      // skip the open document

      expect(result[4].level).to.eql(2);
      expect(result[4].firstChild.literal).to.eql('Include');

      // skip the include paragraph

      expect(result[6].literal).to.eql(instructions[1]);

      // skip the open document

      expect(result[8].firstChild.literal)
        .to.eql('This is a paragraph in a deep include.');

      expect(result[result.length - 2].firstChild.literal)
        .to.eql('Paragraph after.');
      expect(result[result.length - 1].type).to.eql('eof');
      done(err);
    })
  });

});
