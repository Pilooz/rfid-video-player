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
  	a1[0].scenarId.should.be.equal('scenario1');
  	a4[0].scenarId.should.be.equal("scenario1");
  });

  var sc = a1[0].steps[0];
  ["stepId", "title", "icon", "template", "background", "choice", "medias", "text", "transitions"].forEach(function(p){
    it('scenario1.steps[0] returned by "_buildScenarList" should have property "'+p+'"', function() {
      sc.should.have.property(p);
    });
  });

  ['id', 'condition', 'duration'].forEach(function(p){
    it('scenario1.steps[0].transitions[0] returned by "_buildScenarList" should have property "'+p+'"', function() {
      sc.transitions[0].should.have.property(p);
    });
  });


  it('returns value "step-1"', function() {
    sc.stepId.should.be.equal("step-1");
  });
  it('returns value "Attributes validation"', function() {
    sc.title.should.be.equal("Attributes validation");
  });
  it('returns value "icon.png"', function() {
    sc.icon.should.be.equal("icon.png");
  });
  it('returns value "video"', function() {
    sc.template.should.be.equal("video");
  });
  it('returns value "image1.png"', function() {
    sc.background.should.be.equal("image1.png");
  });
  it('returns value "Choice 1"', function() {
    sc.choice[0].should.be.equal("Choice 1");
  });
  it('returns value "image1.png"', function() {
    sc.medias[0].should.be.equal("image1.png");
  });
  it('returns value "text1"', function() {
    sc.text.should.be.equal("text1");
  });
  it('returns type "array"', function() {
    sc.transitions.should.be.an('array');
  });

  it('returns value "step-2"', function() {
    sc.transitions[0].id.should.be.equal("step-2");
  });
  it('returns value "endMedia"', function() {
    sc.transitions[0].condition.should.be.equal("endMedia");
  });
  it('returns "2000"', function() {
    sc.transitions[0].duration.should.be.equal(2000);
  });


});