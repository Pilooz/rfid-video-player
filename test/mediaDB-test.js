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
    chooseMedia = mediaDB.chooseMedia,
    cod1 = "coderfid1",
    cod2 = "coderfid2",
    cod3 = "coderfid3",
    cod4 = "coderfid4",
    msgWait = mediaDB.waitingMedia,
    msgNotFound = mediaDB.mediaNotFoundMedia,
    msgNoTag = mediaDB.noTagAssocMedia,
    msgSearch = mediaDB.searchingMedia;

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

describe('#chooseMedia', function() {
  	it('Type of chooseMedia', function() {
		chooseMedia.should.be.an('function');
	});

  	it('Type returned by chooseMedia', function() {
		chooseMedia().should.be.an('object');
	});

  	var o = chooseMedia(cod1);
	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('object1 returned by "chooseMedia" should have property "'+p+'"', function() {
			o.should.have.property(p);
		});
	});

  	o = chooseMedia(cod2);
	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('object2 returned by "chooseMedia" should have property "'+p+'"', function() {
			o.should.have.property(p);
		});
	});

  	o = chooseMedia(cod3);
	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('object3 returned by "chooseMedia" should have property "'+p+'"', function() {
			o.should.have.property(p);
		});
	});

  	o = chooseMedia();
	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('Null object returned by "chooseMedia" should have property "'+p+'"', function() {
			o.should.have.property(p);
		});
	});
	it('Null object returned by "chooseMedia" should give "msgNoTag" object', function() {
		o.should.be.equal(msgNoTag());
	});
});

// 
// Test service messages
//
describe('#Service Message msgWait', function() {
	it('returned type of service messages', function() {
		msgWait.should.be.an('function');
	});

	it('returned type of service messages', function() {
		msgWait().should.be.an('object');
	});

	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('obbject should have property "'+p+'"', function() {
			msgWait().should.have.property(p);
		});
	});

	it('video link of service messages', function() {
		msgWait().uri.should.be.equal('/videos/messages/waitingForTag.mp4');
	});
});

describe('#Service Message msgNotFound', function() {
	it('returned type of service messages', function() {
		msgNotFound.should.be.an('function');
	});

	it('returned type of service messages', function() {
		msgNotFound().should.be.an('object');
	});

	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('obbject should have property "'+p+'"', function() {
			msgNotFound().should.have.property(p);
		});
	});

	it('video link of service messages', function() {
		msgNotFound().uri.should.be.equal('/videos/messages/mediaNotFound.mp4');
	});
});

describe('#Service Message msgNoTag', function() {
	it('returned type of service messages', function() {
		msgNoTag.should.be.an('function');
	});

	it('returned type of service messages', function() {
		msgNoTag().should.be.an('object');
	});

	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('obbject should have property "'+p+'"', function() {
			msgNoTag().should.have.property(p);
		});
	});

	it('video link of service messages', function() {
		msgNoTag().uri.should.be.equal('/videos/messages/noTagAssociation.mp4');
	});
});

describe('#Service Message msgSearch', function() {
	it('returned type of service messages', function() {
		msgSearch.should.be.an('function');
	});

	it('returned type of service messages', function() {
		msgSearch().should.be.an('object');
	});

	['uri', 'loop', 'autoplay', 'controls', 'status', 'tag'].forEach(function(p){
		it('obbject should have property "'+p+'"', function() {
			msgSearch().should.have.property(p);
		});
	});

	it('video link of service messages', function() {
		msgSearch().uri.should.be.equal('/videos/messages/searching.mp4');
	});
});

