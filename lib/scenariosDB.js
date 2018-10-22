/*-----------------------------------------------------------------------------
Que faut-il trasmettre aux modèles d'affichage ?
  Une fois que le scénario est choisi, 
  Seules les données de l'étape en cours suffisent 
  ainsi que les transitions possibles vers les étapes postérieures
  => Voir s'il ne faudra pas un lien vers l'étape précédente ?
  
  L'objet dataForTemplate expose donc les propriétés suivantes : 
    { 
      scenarId : '',          // identifiant du scénario choisi
      rfid : '',              // Tag rfid déclenchant le scénario
      scenarIndex : '',       // Index du scénario choisi dans le tableau des scénarios
      scenarTitle : '',       // titre du scénario choisi
      scenarMediaPath : '',   // Path vers les médias associés au scénario
      currentStep : '',       // Étape courante du scénario
      stepTitle : '',         // Titre de l'étape
      stepTemplate : '',      // Template ejs associé à l'étape
      stepMedias : [''],      // Tablau de médias associé à l'étape
      stepChoices : [''],     // tableau de choix possibles associé au template user-choice.ejs
      stepHistory: [],        // Historique de navigation deans les étapes du scénario
      stepTransitions :       // Ensemble des conditions de transition pour passer à l'étape suivante ou précédente
          [
            { id : '', condition : '' }  // id de l'étape suivante, condition js
          ],
      config : CONFIG  // la configuration générale de l'application (server/app/rfid)

----------------------------------------------------------------------------*/

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