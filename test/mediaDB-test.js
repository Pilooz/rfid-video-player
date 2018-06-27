/*
	Unit tests for lib/mediaDB.js

	Run with 'npm test' or 'npm run autotest'
*/

var fs = require('fs');

var should = require('chai').should(),
	expect = require('chai').expect,

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
    msgSearch = mediaDB.searchingMedia,
    saveDB = mediaDB.saveDB,
    addRfidCodeTOKeywordsDB = mediaDB.addRfidCodeTOKeywordsDB,
    getKeyword = mediaDB.getKeyword;

// Mocking up data in keywords, and media
var db_keywords = require('../data/keywords.js.sample'),
	db_media    = require('../data/media.js.sample');

mediaDB.init(db_keywords, db_media);

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

describe('#saveDB testing', function() {
	it('creates a .sav file in "datatmp" directory', function() {
		// var f = "./datatmp/keywords.test.js";
		// fs.exists(f,function(exists){
		// 	if(!exists) {
		// 		fs.open(f, 'w', function(err, fd) {
		// 		    if (err) {
		// 		        throw 'error opening file: ' + err;
		// 		    }
		// 			fs.writeFile(f, 'test content!', function (err) {
		// 			  if (err) throw err;
		// 			  console.log('Saved!');
		// 			});
		// 		}); 
		// 		// fs.unlink(f, function (err) {
		// 		//   if (err) throw err;
		// 		//   console.log('File deleted!');
		// 		// }); 
		// 	}
		// });
		//expect(saveDB(f, db_keywords)).to.Throw();
	});
});

describe('#getKeyword function', function(){
	var myKey = getKeyword("key1");
	['keyword', 'codes'].forEach(function(p){
		it('retrieves first keyword with "'+p+'" property', function() {
			myKey.should.have.property(p);
		});
	});
	it('retrieves key1 properties', function() {
		myKey.keyword.should.be.equal("key1");
		myKey.codes.should.have.lengthOf(3);

	});

	it('retrieves one of all keyword', function() {
		myKey = getKeyword("key2");
		myKey.keyword.should.be.equal("key2");
		myKey.codes.should.have.lengthOf(2);
	});
	
	it('retrieves last keyword', function() {
		myKey = getKeyword("key4");
		myKey.keyword.should.be.equal("key4");
		myKey.codes.should.have.lengthOf(1);

	});
	
});

describe('#DB adding Rfid Code without dupplicates the couple {keyw, code} when key exists', function() {
	it('adds an existing code and key', function() {
		// Unique entry by keywords
		db_keywords.keywordslist.should.have.lengthOf(4);
		db_keywords = addRfidCodeTOKeywordsDB("coderfid4", "key1");
		db_keywords.keywordslist.should.have.lengthOf(4);
	});

	it('adds an existing code with the same existing key', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid4", "key1");
		db_keywords.keywordslist.should.have.lengthOf(4);
		var myKey = getKeyword("key1");
		myKey.codes.should.have.lengthOf(4);
	});

	it('adds an existing code and a new key', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid4", "key5");
		db_keywords.keywordslist.should.have.lengthOf(5);
	});

	it('adds an new code and a existing key', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid5", "key1");
		db_keywords.keywordslist.should.have.lengthOf(5);
	});

	it('adds an new code and a new key', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid6", "key6");
		db_keywords.keywordslist.should.have.lengthOf(6);
		//console.log(JSON.stringify(db_keywords, null, 4))
	});

	it('Trying to add a zero length key (no modifications)', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid6", "");
		db_keywords.keywordslist.should.have.lengthOf(6);
	});

	it('Trying to add an undefined key (no modifications)', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("coderfid6", undefined);
		db_keywords.keywordslist.should.have.lengthOf(6);
	});

	it('Trying to add an undefined code (no modifications)', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB(undefined, "key1");
		var myKey = getKeyword("key1");
		myKey.codes.should.have.lengthOf(5);
	});

	it('Trying to add an zero length code (no modifications)', function() {
		// Unique entry by keywords
		db_keywords = addRfidCodeTOKeywordsDB("", "key1");
		var myKey = getKeyword("key1");
		myKey.codes.should.have.lengthOf(5);
	});

});


