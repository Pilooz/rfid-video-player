/*
	Unit tests for lib/scenariosDB.js

	Run with 'npm test' or 'npm run autotest'
*/
var CONFIG        = require('../config/config.js');
// Mocking some config values 
CONFIG.app.dbSavePath = "/tmp";

var fs = require('fs');

var should = require('chai').should(),
	expect = require('chai').expect,

    scenariosDB = require('../lib/scenariosDB'),
    _buildScenarList = scenariosDB._buildScenarList,
    chooseScenario = scenariosDB.chooseScenario,
    cod1 = "coderfid1",
    cod2 = "coderfid2",
    cod3 = "coderfid3",
    cod4 = "coderfid4";


// Mocking up data in keywords, and media
var db_sc         = require(CONFIG.app.dbPath + '/scenarios.js.sample');

scenariosDB.init(db_sc);

describe('#_buildScenarList', function() {
	var a1 = _buildScenarList(cod1),
			a3 = _buildScenarList(cod3),
			a4 = _buildScenarList(cod4);

	it('returns an array', function() {
		a1.should.be.an('array');
		a3.should.be.an('array');
		a4.should.be.an('array');
	});

  it('builds the scenario list, tests result array length', function() {
    a1.should.have.lengthOf(1);
    a3.should.have.lengthOf(0);
    a4.should.have.lengthOf(1);
  });

  it('test properties', function(){

  });
  
  it('tests array content', function() {
  	a1.scenarId.should.be.equal('sceanrio1');
  	a4.scenarId.should.be.equal("sceanrio1");
  });

});
