var expect = require('chai').expect
  , replace = require('../../lib/replace');

describe('mkpi:', function() {

  it('should parse replace pattern', function(done) {
    var source = 's/\\.\\.\\/index/mkpi/gm'
      , res = replace(source);

    expect(res.regexp).to.be.instanceof(RegExp);
    expect(res.replace).to.be.a('string');
    expect(res.flags).to.be.a('string');
    done();
  });

});
