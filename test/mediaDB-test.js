/*
	Unit tests for lib/mediaDB.js

	Run with 'npm test' or 'npm run autotest'
*/

// Mocking up data in keywords, and media
var db_keywords   = require('../data/keywords.js.sample'),
	db_media      = require('../data/media.js.sample');

var should = require('chai').should(),
    mediaDB = require('../lib/mediaDB'),
    buildKeywordList = mediaDB.buildKeywordList,
    buildMediaList = mediaDB.buildMediaList,
    cod1 = "coderfid1",
    cod2 = "coderfid2",
    cod3 = "coderfid3",
    cod4 = "coderfid4";

describe('#buildKeywordList', function() {
  var a1 = buildKeywordList(cod1, db_keywords),
  	  a2 = buildKeywordList(cod2, db_keywords),
  	  a3 = buildKeywordList(cod3, db_keywords),
  	  a4 = buildKeywordList(cod4, db_keywords);

  it('returned type of keywordList', function() {
    a1.should.be.an('array');
    a2.should.be.an('array');
    a3.should.be.an('array');
    a4.should.be.an('array');
  });

  it('builds the keyword list, tests result array length', function() {
    a1.should.have.lengthOf(2);
    a2.should.have.lengthOf(2);
    a3.should.have.lengthOf(3);
    a4.should.have.lengthOf(1);
  });

  it('tests array content', function() {
  	a1.should.have.all.members(['key1','key2']);
  	a2.should.have.all.members(['key1','key3']);
  	a3.should.have.all.members(['key1','key2', 'key3']);
  	a4.should.have.all.members(['key4']);
  });

  it('Keywords list null', function() {
    buildKeywordList("ThisTagDoesntExist", db_keywords).should.have.lengthOf(0);
  });

});

describe('#buildMediaList', function() {
	var arr1 = buildMediaList(cod1, db_keywords, db_media, '.'),
		arr2 = buildMediaList(cod2, db_keywords, db_media, '.'),
		arr3 = buildMediaList(cod3, db_keywords, db_media, '.'),
		arr4 = buildMediaList(cod4, db_keywords, db_media, '.');

	it('builds the media list, with rfid tag', function() {
		arr1.should.have.lengthOf(3);
		arr2.should.have.lengthOf(3);
		arr3.should.have.lengthOf(3);
		arr4.should.have.lengthOf(1);
	});

	it('returned type of buildMediaList', function() {
		arr1.should.be.an('array');
		arr2.should.be.an('array');
		arr3.should.be.an('array');
		arr4.should.be.an('array');
	});

	it('tests array content', function() {
		arr1.should.have.all.members(['./video1.mp4','./video2.mp4','./video3.mp4']);
		arr2.should.have.all.members(['./video1.mp4','./video2.mp4','./video3.mp4']);
		arr3.should.have.all.members(['./video1.mp4','./video2.mp4','./video3.mp4']);
		arr4.should.have.all.members(['./video4.mp4']); 
	});

  	it('Rfid tag null, media list null', function() {
		buildMediaList("ThisTagDoesntExist", db_keywords, db_media, '.').should.have.lengthOf(0);
	});

});

