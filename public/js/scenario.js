// Global variables -------------------------------------------------
var socket = io('http://localhost:3000'); //
var scenario = {}; // Scenario given by the rfid reading
var step = {};     // Current step in the scenario
var content = {}; // Rendered template of the current step
var lsnr_content = {}; // Rendered event listeners template of the current step
var nextStep = ""; // stepId for the next step of the scenario

// These transitions are treated as listener or setTimeout functions
var nonEvaluableConditions = new Array('endMedia', 'timeElapsed', 'manualStep', 'selectObject', 'deselectObject');
var evaluableConditions = new Array(); // Array of evaluable conditions ( ie var == 'val' )

// End Global variables ---------------------------------------------

// ------------------------------------------------------------------
// Scenario managing functions
// ------------------------------------------------------------------

// Get details of a step with the current step
function getCurrentStepDetails(){
  var stepItem = "";
  for (var i=0; i<scenario.steps.length; i++) {
    if(scenario.steps[i].stepId == scenario.currentStep) {
      stepItem = scenario.steps[i];
      break;
    }
  }
  console.log(stepItem);
  return stepItem;
}

// Set Scenario title
function setScenarioTitle(t) {
  $('title').html(t);
  $('#data-title').html(t);
}

// Set step title
function setStepTitle(t){
  $('#data-step-title').html(t);
}

// Display rendered template
function displayTemplate(content, domId) {
  $(domId).html(content);
}

// Loading step into navigator
function loadStep(scenar){
  // Tell the server which scenario and step we manage
  socket.emit('client.currentScenario', { currentScenario: scenar });
  // Set title
  setScenarioTitle(scenar.title);
  // get step
  step = getCurrentStepDetails();
  // step title
  setStepTitle(step.title);
  // get step template
  content = getTemplate('/scenario/step-template', step, "#stepTemplate");
  // build transition conditions
  build_step_validation();
}

// change context to display next step
function goToNextStep() {
  console.log("'goToNextStep' function called ! Next step is " + nextStep);
  // 1. keep history in histo object TODO !
  // 2. set the new currentStep attribut in 'scenario' object
  scenario.currentStep = nextStep;
  // 3. Send this contextual data (scenarId and currentStep) to server (it needs to know where we are, in case of refreshing the page)
  // 4. reloading new template, and transitions template
  loadStep(scenario);
}

// ------------------------------------------------------------------
// Getting embeded templates
// ------------------------------------------------------------------

function getTemplate(url, data, resultDomId) {
  data.scenarId = scenario.scenarId;
  data.scenarioMediaPath = scenario.scenarioMediaPath;

  $.ajax({
     url: url,
     data: data,
     type: 'POST',
     error: function(req, textStatus) {
      // TODO something clever to show error ! 
      console.log(req);
      displayTemplate(req.responseText, resultDomId);
     },
     success: function(html) {
      // TODO : write a callback to update page
      displayTemplate(html, resultDomId);
     }
  });
}

// ------------------------------------------------------------------
// Transitions functions
// ------------------------------------------------------------------

function build_step_validation() {
  evaluableConditions = new Array();
  for (var i = 0; i < step.transitions.length; i++) {
    // Construct evaluable conditions
    if ( nonEvaluableConditions.indexOf(step.transitions[i].condition) < 0 ) {
      // Put evaluable conditions in a specific array to be evaluated further more
      console.log("evaluable : " + step.transitions[i].condition);
      evaluableConditions.push(step.transitions[i]);
    }

    // Managing non evaluable conditions now
    // 1. endMedia is treated in video.ejs.

    // 2. timeElapsed
    if (step.transitions[i].condition == 'timeElapsed') {
      nextStep = step.transitions[i].id;
      console.log('timeElapsed transition. Next step in ' + (step.transitions[i].duration / 1000) + " seconde(s)");
      setTimeout(goToNextStep, step.transitions[i].duration  || 2000 );
    }

    // 3. manualStep
    if ( step.transitions[i].condition == 'manualStep' ) {
      nextStep = step.transitions[i].id;
      console.log("manualStep transition. Waiting for a human interaction...");
      // 'Next' button should be visible
      $('#nextButton').show();
    }

    // 4. deselecObject
      if ( step.transitions[i].condition == 'deselectObject' ) {
        console.log("deselectObject transition... This is the end, re-init scenario !");
        $('#initButton').show();
        // Re-init to the first step of the secnario
        // TODO : re-init to the splash screen "waiting for tag"
        nextStep = scenario.steps[0].stepId;
      }    
  }
}

// Validation function for the current step. This allows to go to the next one
function step_validation(choice) {
  // First, if there is no conditions to evaluate, we should have
  // a non Evaluable Conditions as 'endMedia', 'timeElapsed', 'manualStep', ...
  console.log("Need to evaluate " + evaluableConditions.length + " conditions...");
  if (evaluableConditions.length == 0) {
    console.log("Go to next step ('" + nextStep + "'') !");
    goToNextStep();
    return true;
  }

  // Evaluating conditions now
  for (var i = 0; i < evaluableConditions.length; i++) {
    console.log("choice : '" + choice + "'");
    console.log("Evaluating : " + evaluableConditions[i].condition + 
                " => '" + eval(evaluableConditions[i].condition) + "'");
    if (eval(evaluableConditions[i].condition)) {
      nextStep = evaluableConditions[i].id;
      console.log("Go to next step ('" + nextStep + "'') !");
      goToNextStep();
      break;
    }
  }
}

// ------------------------------------------------------------------
// button functions / UI functions
// ------------------------------------------------------------------
// Kevin's Reset button
$("#resetButton").on('click', function(){
  nextStep = scenario.steps[0].stepId;
  // trash navigation historic
  // Go
  goToNextStep();
});



