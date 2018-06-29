/*--------------------------------------------------------------------------------------
	Functions to deal with the choices in media list
--------------------------------------------------------------------------------------*/
var CONFIG        = require('../config/config.js');
var in_array      = require('in_array');
var fs            = require('fs');

var msgWaitingMedia = { uri: CONFIG.app.mediaPath + "/messages/waitingForTag.mp4", loop: "on", autoplay: "on", controls: "off", status: "waiting", tag: "" },
    msgMediaNotFoundMedia = { uri: CONFIG.app.mediaPath + "/messages/mediaNotFound.mp4", loop: "off", autoplay: "on", controls: "off", status: "mediaNotFound", tag: "" },
    msgNoTagAssocMedia = { uri: CONFIG.app.mediaPath + "/messages/noTagAssociation.mp4", loop: "off", autoplay: "on", controls: "off", status: "noTagAssociation", tag: "" },
    msgSearchingMedia = { uri: CONFIG.app.mediaPath + "/messages/searching.mp4", loop: "off", autoplay: "on", controls: "off", status: "searching", tag: "" };

var db_keywords = undefined;
	db_media = undefined;
//------------------------------------------------------------------------
// the media Functions
//------------------------------------------------------------------------
module.exports = {
	//
	// Intialisation service, this should be a constructor if mediaDB was a class (some day :))
	//
	init: function(keys, media){
		db_keywords = keys;
		db_media  = media;
		if (!db_keywords.keywordslist) {
			db_media = {medialist: []};
			db_keywords = {keywordslist: []};
		}
		console.log(db_keywords.keywordslist.length + " keywords in database.");
		console.log(db_media.medialist.length + " medias in database.");
	},

	//
	// retrieve an element of keyword DB (keywords.js) from specific Keyword
	//
	getKeyword: function(key) {
		var myKey = "";
		db_keywords.keywordslist.forEach(function(k){
		 	if(k.keyword == key) {
		 		myKey = k;
		 		return false;
		 	}
		});
		return myKey;
	},

	//
	// retrieve an element of media DB (media.js) from specific Media name
	//
	getMedia: function(media) {
		var myMedia = "";
		db_media.medialist.forEach(function(m){
		 	if(m.media == media) {
		 		myMedia = m;
		 		return false;
		 	}
		});
		return myMedia;
	},

	//
	// service messages : dealing with errors
	//
	waitingMedia: function() { return msgWaitingMedia; },

	mediaNotFoundMedia: function(tag, file) { 
		msgMediaNotFoundMedia.tag = tag;
		msgMediaNotFoundMedia.filename = file;
		return msgMediaNotFoundMedia; 
	},

	noTagAssocMedia: function(tag) { 
		msgNoTagAssocMedia.tag = tag;
		return msgNoTagAssocMedia; 
	},

	searchingMedia: function() { return msgSearchingMedia; },

	// Choosing a media randomly in the list
	chooseRandomly: function(arr) {
	  return arr[Math.floor(Math.random()*arr.length)];
	},

	sort_unique: function(arr) {
		var uniqueArray = arr.filter(function(elem, pos) {
    		return arr.indexOf(elem) == pos;
		});
		return uniqueArray.sort();
	},
	//
	// Building Keyword List
  	//
  	buildKeywordList: function(rfidTag, dbkeys) {
	  // Builded keyword list from RFID tag
	  var keyList = [];
	  var index = 0;
	  // Parcours tous les mots clés
	  dbkeys.keywordslist.forEach(function(k){
	    // Pour chaque mot clé, parcours tous les codes associés
		    k.codes.forEach(function(c){
		      if (c == rfidTag) {
		        // Ajout du mot clé à la liste
		        keyList[index] = k.keyword;
		        index++;
		        return false; // Easy way to break loop !
		      }
		    });
		});
		return module.exports.sort_unique(keyList);
  	},

  	//
  	// Building media list containing all candidate to be played
  	// 
  	buildMediaList: function(rfidTag, dbkeys, dbmedia, path){
	  // Builded media list from keywordList
	  var mediaCollection = [];
	  var index = 0;
	  // First Building keyword List 
	  var keys = module.exports.buildKeywordList(rfidTag, dbkeys); 

	  // Parcours des medias
	  dbmedia.medialist.forEach(function(m){
	    // Pour chaque mots-clé
	    m.keywords.forEach(function(k){
	      // Si les mots clé associés au media sont dans la listes de mots clé générée
	      // On ajoute le média
	      if ( in_array(k, keys) ) {
	        mediaCollection[index] = path + "/" + m.media;
	        index++;
	        return false;
	      }
	    });
	  });
	  var col = module.exports.sort_unique(mediaCollection);
	  return col;
	},

	//
	// Choosing a media in final list, dealing with errors
	//
	chooseMedia: function(tag, rootPath) {
		// Video data sctructure for the choosen media
		var mediaFile = { uri: "", loop: "", autoplay: "", controls: "", status: "", tag: "" },	
			medias = [];
		medias = module.exports.buildMediaList(tag, db_keywords, db_media, CONFIG.app.mediaPath);
		console.log(medias);
		// If media array if empty, the RFID tag was not associated
		if ( medias.length == 0 ) {
			return module.exports.noTagAssocMedia(tag);
		} else {
			mediaFile = { uri: module.exports.chooseRandomly(medias), loop: "off", autoplay: "on", controls: "on", status: "content", tag: tag };
			// Verifying that file exists
			if (!fs.existsSync(rootPath +  mediaFile.uri)) { 
				return module.exports.mediaNotFoundMedia(tag, mediaFile.uri);
			}
			console.log("Choosen media is '" + mediaFile.uri + "'");
			return mediaFile;
		}
	},

	//
	// updating keywords DB by write JSON File
	//
	saveDB: function(file, db){
		var actualDBfile = CONFIG.app.dbPath + "/" + file;
		var savedDBFile = CONFIG.app.dbSavePath + "/" + file + "." + Date.now() + ".sav";

		db = "module.exports = " + JSON.stringify(db, null, 4);

		// 1. Take a snapshot of old version
		//fs.createReadStream(actualDBfile).pipe(fs.createWriteStream(savedDBFile));


		var rd = fs.createReadStream(actualDBfile);
		rd.on("error", function(err) {
			console.log("Can not read " + actualDBfile + " : " + err);
		});

		var wr = fs.createWriteStream(savedDBFile);
		wr.on("error", function(err) {
			console.log("Can not write " + actualDBfile + " : " + err);
		});

		wr.on("close", function(ex) {
			// 2. Writing file because snapshot is ok ! 
			fs.writeFile(actualDBfile, db, function(err) {
			    if(err) {
			        console.log(err);
			        throw err;
			    }
			    console.log("saved new version of " + actualDBfile);  
			}); 
		});

		rd.pipe(wr);


		// fs.copyFile( actualDBfile, savedDBFile, (err) => {  
		//     if (err) {
		//     	console.log(err);
		//     	throw err; 
		//    	}
		//     console.log("saved to " + savedDBFile);  
		//    	// 2. Writing file because snapshop is ok ! 
		// 	fs.writeFile(actualDBfile, db, function(err) {
		// 	    if(err) {
		// 	        console.log(err);
		// 	        throw err;
		// 	    }
		// 	    console.log("saved new version of " + actualDBfile);  
		// 	}); 
		// });  
	},

	//
	// Adding a code and keyword to keywords DB
	//
	addRfidCodeToKeywordsDB: function(code, key) {
		var keyFound = false;
		if (key !== "" && key !== undefined && code !== "" && code !== undefined) {
			db_keywords.keywordslist.forEach(function(k){
				if(k.keyword == key ){
					k.codes.push(code);
					k.codes = module.exports.sort_unique(k.codes);
					keyFound = true;
					return false;
				}
			});
			// The key was not found, so add it !
			if (!keyFound) {
				db_keywords.keywordslist.push({keyword: key, codes: [code]});
			}
		}
		return db_keywords;
	},

	//
	// Adding amedia and a keyword to madia DB
	//
	addMediaToMediaDB: function(media, key) {
		var mediaFound = false;
		if (key !== "" && key !== undefined && media !== "" && media !== undefined) {
			db_media.medialist.forEach(function(m){
				if(m.media == media ){
					m.keywords.push(key);
					m.keywords = module.exports.sort_unique(m.keywords);
					mediaFound = true;
					return false;
				}
			});
			// The key was not found, so add it !
			if (!mediaFound) {
				db_media.medialist.push({media: media, keywords: [key]});
			}
		}
		return db_media;
	},

	//
	// Adding a new media to database, with RFID code and Keywords
	//
	newMedia: function(fields, files) {
		var oldpath = files.mediafile.path;
		var newpath =  __basedir + CONFIG.app.mediaPath + "/" + files.mediafile.name;
		fs.rename(oldpath, newpath, function (err) {
			if (err) {
				// Something was wrong, so delete file
				fs.unlink(newpath, function(err){
				  if(err) throw err;
				});				
				throw err;
			}
			// Delete temp file
			fs.unlink(oldpath, function(err){
			  if(err) console.log(err);
			});				
		});
		// Register Code, media and keywords
		var keys = fields.keywords.split(" ");
		keys.forEach(function(k){
			module.exports.addRfidCodeToKeywordsDB(fields.code, k);
			module.exports.addMediaToMediaDB(files.mediafile.name, k);
		});

		// Write new databases and reload them
		module.exports.saveDB("keywords.js", db_keywords);
		module.exports.saveDB("media.js", db_media);		
	}
} 