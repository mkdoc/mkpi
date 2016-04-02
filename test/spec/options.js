var expect = require('chai').expect
  , Parser = require('../../lib/parser');

describe('mkpi:', function() {

  it('should create parser with no options', function(done) {
    expect(new Parser()).to.be.an('object');
    done();
  });

});
