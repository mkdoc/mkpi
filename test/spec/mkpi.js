var fs = require('fs')
  , expect = require('chai').expect
  , mkpi = require('../../index')
  , mkast = require('mkast')
  , Parser = mkast.Parser;

describe('mkpi:', function() {

  it('should process @include processing instructions', function(done) {
    var source = 'test/fixtures/include.md'
      , target = 'target/include.json.log'
      , parser = new Parser()
      , data = parser.parse('' + fs.readFileSync(source))

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
      console.dir(result);
      expect(result[0]._type).to.eql('document');
      expect(result[1]._type).to.eql('paragraph');
      expect(result[1]._firstChild._literal).to.eql('Paragraph before.');
      //expect(result[1]._type).to.eql('paragraph');
      //
      expect(result[result.length - 1]._type).to.eql('eof');
      done(err);
    })
  });

});
