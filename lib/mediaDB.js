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
		console.log(db_keywords.keywordslist.length + " keywords in database.");
		console.log(db_media.medialist.length + " medias in database.");
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

	//
	// Sort an array and suppresses dupplicates
	//
	sort_unique: function(arr) {
	  if (arr.length === 0) return arr;
	  arr = arr.sort(function (a, b) { return a*1 - b*1; });
	  var ret = [arr[0]];
	  for (var i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
	    if (arr[i-1] !== arr[i]) {
	      ret.push(arr[i]);
	    }
	  }
	  return ret;
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
		var newFileName = file + "." + Date.now() + ".sav"
		// 1. Take a snapshot of old version
		fs.copyFile(file, newFileName, (err) => {  
		    if (err) {
		    	console.log(err);
		    	throw err; 
		   	}
		    console.log("saved to " + newFileName);  
		   	// 2. Writing file because snapshop is ok ! 
			fs.writeFile(file, db, function(err) {
			    if(err) {
			        console.log(err);
			        throw err;
			    }
			    console.log("saved new version of " + file);  
			}); 
		});  
	},

	addRfidCode: function(code, key) {
		//var keyNotFound = false;
		db_keywords.keywordslist.forEach(function(k){
			if(k.keyword == key ){
				k.codes.push(code);
				k.codes = module.exports.sort_unique(k.codes);
				return false;
			} //else {
			// 	// key does not exists
			// 	keyNotFound = true;
			// }
		});
		// if (keyNotFound) {
		// 	db_keywords.keywordslist.push({keyword: key, codes: [code]});
		// }
		return db_keywords;
	},

	//
	// Adding a new media to database, with RFID code and Keywords
	// TODO : Take care of dupplicates /!\
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
			  if(err) throw err;
			});				
		});
		// Register Code and keywords
		var keys = fields.keywords.split(" ");
		// For every keyword, we attach a code as singleton array ['code']
		keys.forEach(function(k){
			// TODO : If keyword already exists, just merge codes
			db_keywords.keywordslist.push({keyword: k, codes: [fields.code]});
		});
		
		// Register media
		// TODO : If media already exists : just merge keywords
		db_media.medialist.push({media: files.mediafile.name, keywords: keys});

		// Write new databases and reload them
		var fileRadical = "module.exports = ";
		module.exports.saveDB(__basedir + "/data/keywords.js", fileRadical + JSON.stringify(db_keywords, null, 4));
		module.exports.saveDB(__basedir + "/data/media.js", fileRadical + JSON.stringify(db_media, null, 4));		
	}
} 