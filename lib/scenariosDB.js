/*--------------------------------------------------------------------------------------
	Functions to deal with the choices in media list
--------------------------------------------------------------------------------------*/
var CONFIG        = require('../config/config.js');
var in_array      = require('in_array');
var fs            = require('fs');

var db_scenarios = undefined;
var scenar_tpl = {	
					scenarId : '', 
			        rfid : '',
			      	title : '',
			      	scenarioMediaPath : '',
			      	steps : []
			      };

//------------------------------------------------------------------------
// the media Functions
//------------------------------------------------------------------------
module.exports = {
	//
	// Intialisation service, this should be a constructor if scenariosDB was a class (some day :))
	//
	init: function(db){
		db_scenarios = db;
		console.log(db_scenarios.scenarios.length + " scenarios in database.");
	},

 	//
  	// Building scenario list containing all candidate to be launched
  	// 
  	_buildScenarList: function(rfidTag){
	  // Builded media list from keywordList
	  var scCollection = [];
	  var index = 0;

	  // Parcours des medias
	  db_scenarios.scenarios.forEach(function(sc){
	  	if (sc.rfid == rfidTag) {
			scCollection[index] = sc;
			index++;
	  	}
	  });
	  return scCollection;
	},

	//
	// Choosing a scenario in list, dealing with errors
	//
	chooseScenario: function(tag, reader, rootPath) {
		var scenarData = scenar_tpl,
			scenars = [];
		scenars = module.exports._buildScenarList(tag);
		console.log(scenars);
	},

} 