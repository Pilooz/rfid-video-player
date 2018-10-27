/*--------------------------------------------------------------------------------------
	Functions to deal with the choices in media list
--------------------------------------------------------------------------------------*/
var CONFIG        = require('../config/config.js');
var in_array      = require('in_array');
var fs            = require('fs');

var db_scenarios = undefined;
var scenarTpl = {	
					config : {},
					scenarId : '', 
			        rfid : '',
			      	title : '',
			      	scenarioMediaPath : '',
			      	currentStep : '',
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

	  // Parcours des scénarios
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
	// For the moment, the relation between rfidTag and scenarios is ONE to ONE
	// No need to choose a random scenario in a list
	//
	chooseScenario: function(tag, reader, rootPath) {
		var scenars = [];
		var scenarData = scenarTpl;
		scenars = module.exports._buildScenarList(tag);
		if (scenars[0]) {
			scenarData = scenars[0];
			scenarData.config = CONFIG;
			scenarData.currentStep = scenarData.steps[0].stepId;
		}
		return scenarData;
	},
} 