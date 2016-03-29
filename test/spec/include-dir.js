var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Node = mkast.Node
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @include with directory', function(done) {
    var source = 'test/fixtures/include-dir.md'
      , target = 'target/include-dir.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))
      , instructions = [
          '<? @include dir ?>'
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

      expect(result[0].type).to.eql(Node.DOCUMENT);
      expect(result[1].literal).to.eql(instructions[0]);

      // included document
      expect(result[2].type).to.eql(Node.DOCUMENT);

      // mock paragraph
      expect(result[3].type).to.eql(Node.PARAGRAPH);
      expect(result[3].firstChild.literal).to.eql('Paragraph.');

      // EOF for both documents
      expect(result[4].type).to.eql(Node.EOF);
      expect(result[5].type).to.eql(Node.EOF);

      done(err);
    })
  });

});
