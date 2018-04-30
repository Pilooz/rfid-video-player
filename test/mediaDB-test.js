// Mocking up data in keywords, and media
var db_keywords   = require('../data/keywords.js.sample'),
	db_media      = require('../data/media.js.sample');


var should = require('chai').should(),
    mediaDB = require('../lib/mediaDB'),
    buildKeywordList = mediaDB.buildKeywordList,
    buildMediaList = mediaDB.buildMediaList,
    coderfid1 = "coderfid1",
    coderfid2 = "coderfid2",
    coderfid3 = "coderfid3",
    coderfid4 = "coderfid4";

describe('#buildKeywordList', function() {
  it('builds the keyword list, tests result array length', function() {
    buildKeywordList(coderfid1, db_keywords).should.have.lengthOf(2);
    buildKeywordList(coderfid2, db_keywords).should.have.lengthOf(2);
    buildKeywordList(coderfid3, db_keywords).should.have.lengthOf(3);
    buildKeywordList(coderfid4, db_keywords).should.have.lengthOf(1);
  });

  it('Keywords list null', function() {
    buildKeywordList("ThisTagDoesntExist", db_keywords).should.have.lengthOf(0);
  });

  it('Array containance', function() {
    //tag(uncompleteMassage).should.equal('');
  });

});

describe('#buildMediaList', function() {
	it('builds the media list, with rfid tag', function() {
		buildMediaList(coderfid1, db_keywords, db_media, '.').should.have.lengthOf(3);
		buildMediaList(coderfid2, db_keywords, db_media, '.').should.have.lengthOf(3);
		buildMediaList(coderfid3, db_keywords, db_media, '.').should.have.lengthOf(3);
		buildMediaList(coderfid4, db_keywords, db_media, '.').should.have.lengthOf(1);
	});

  it('Rfid tag null, media list null', function() {
    buildMediaList("ThisTagDoesntExist", db_keywords, db_media, '.').should.have.lengthOf(0);
  });

});

// TODO : tester les messages d'erreur statndard
