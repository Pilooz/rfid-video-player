/*--------------------------------------------------------------------------------------
	Functions to deal with the choices in media list
--------------------------------------------------------------------------------------*/
var in_array      = require('in_array');

module.exports = {
	// Choosing a media randomly in the list
	chooseMedia: function(arr) {
	  return arr[Math.floor(Math.random()*arr.length)];
	},

	// Sort an array and suppresses dupplicates
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
	}
}