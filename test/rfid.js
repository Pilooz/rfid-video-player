/*
  Unit tests for lib/rfid.js

  Run with 'npm test' or 'npm run autotest'
*/
var should = require('chai').should(),
    rfid = require('../lib/rfid'),
    tag = rfid.extractTag,
    reader = rfid.extractReader,
    testMessage = "<TAG:1234567890><READER:1>",
    uncompleteMassage = "1234>";

describe('#Tag', function() {
  it('Extract tag from a serialized message', function() {
    tag(testMessage).should.equal('1234567890');
  });

  it('With a empty meesage tag should be null', function() {
    tag('').should.equal('');
  });

  it('With an uncomplete meesage tag should be null', function() {
    tag(uncompleteMassage).should.equal('');
  });

});

describe('#Reader', function() {
  it('Extract the rfid reader identification', function() {
    reader(testMessage).should.equal('1');
  });

  it('With a empty meesage reader should be null', function() {
    reader('').should.equal('');
  });

  it('With an uncomplete meesage tag should be null', function() {
    reader(uncompleteMassage).should.equal('');
  });

});