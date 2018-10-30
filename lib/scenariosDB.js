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
	  var scCollection = [];
	  var index = 0;

	  // Parcours des scénarios
	  db_scenarios.scenarios.forEach(function(sc){
	  	sc.rfid.forEach(function (t) {
		  	if (t == rfidTag) {
				scCollection[index] = sc;
				index++;
		  	}
	  	});
	  });
	  return scCollection;
	},

	//
	// Choosing a scenario in list, dealing with errors
	// The relation between rfidTag and scenarios is MANY to ONE
	// Many rfidTags for One scenario.
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
	
	// 
	// Choosing a scenario without rfid reading, just with its Id.
	// This is useful to change the scenario client-side
	// 
	chooseScenarioWithScenarId: function(scenarId) {
		var scenar = null;
		var scenarData = scenarTpl;
		
		db_scenarios.scenarios.forEach(function(sc){
	  	if (sc.scenarId == scenarId) {
				scenar = sc;
	  	}
	  });
		
		if (scenar != null) {
			scenarData = scenar;
			scenarData.config = CONFIG;
			scenarData.currentStep = scenarData.steps[0].stepId;
		}
		return scenarData;
	},
} 