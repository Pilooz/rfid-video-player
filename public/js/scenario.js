// Global variables -------------------------------------------------
var socket = io('http://localhost:3000'); //
var scenario = {}; // Scenario given by the rfid reading
var step = {};     // Current step in the scenario
var stepIndex = 0; // Index of the step in scenario (this is an integer)
var content = {}; // Rendered template of the current step
var lsnr_content = {}; // Rendered event listeners template of the current step
var nextStep = ""; // stepId for the next step of the scenario
var nav_history = new Array(); // Navigation history in scenario
var stepTimeout = undefined; // Timeout object for setTimeout function (timeElapsed, endMedia)

// These transitions are treated as listener or setTimeout functions
var nonEvaluableConditions = new Array('endMedia', 'timeElapsed', 'manualStep', 'selectObject', 'deselectObject');
var evaluableConditions = new Array(); // Array of evaluable conditions ( ie var == 'val' )

// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/
var bar = new ProgressBar.SemiCircle(progress, {
  strokeWidth: 6,
  easing: 'easeInOut',
  duration: 1400,
  color: '#F79B34',
  trailColor: '#ADA27F',
  trailWidth: 6,
  svgStyle: null
});

// End Global variables ---------------------------------------------

// ------------------------------------------------------------------
// Scenario managing functions
// ------------------------------------------------------------------
// Returns first step of the choosen scenario
function getFirstStep(scenar) {
  stepIndex = 0;
  return scenar.steps[0].stepId;
}

// Get details of a step with the current step
function getCurrentStepDetails(){
  var stepItem = "";
  for (var i=0; i<scenario.steps.length; i++) {
    if(scenario.steps[i].stepId == scenario.currentStep) {
      stepIndex = i;
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

// Adding a step in the nav history
function addStepHistory(stp) {
  nav_history.push(step.stepId);
  // suppress dupplicates.
  nav_history = nav_history.filter(function(val,ind) { return nav_history.indexOf(val) == ind; })
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
  // keep history of visited steps
  addStepHistory(step.stepId);
  // Set UI elements
  setPrevButton();
  setNextButton();
  updateProgressBar();
}

// change context to display next step
function goToNextStep() {
  console.log("Next step is " + nextStep);
  // 1. Clearing running timeouts
  clearStepTimeout();
  // 2. set the new currentStep attribut in 'scenario' object
  scenario.currentStep = nextStep;
  // 3. loading new template, and transitions template
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
     crossDomain: true,
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
// Clearing in use timeout if any
// Usefull when #nextButton/#prevButton is click and endMedia/timeElapsed transitions are defined
function clearStepTimeout() {
  if (stepTimeout) {
    clearTimeout(stepTimeout);
    stepTimeout = undefined;
  }
}

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
      stepTimeout = setTimeout(goToNextStep, step.transitions[i].duration  || 2000 );
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

// returns true if the step (in param) has been visited (it is in history array)
function histo(stp) {
  if ( nav_history.indexOf(stp) >= 0 ) {
    return true;
  }
  return false;
}

// Validation function for the current step. This allows to go to the next one
function step_validation(choice) {
  // First, if there is no conditions to evaluate, we should have
  // a non Evaluable Conditions as 'endMedia', 'timeElapsed', 'manualStep', ...
  console.log("Need to evaluate " + evaluableConditions.length + " conditions...");
  if (evaluableConditions.length == 0) {
    // for non evaluable conditions, this should have only 1 transition, so take the first
    nextStep = step.transitions[0].id;
    goToNextStep();
    return true;
  }

  // Evaluating conditions now
  console.log(nav_history);
  for (var i = 0; i < evaluableConditions.length; i++) {
    console.log("choice : '" + choice + "'");
    console.log("Evaluating : " + evaluableConditions[i].condition + 
                " => '" + eval(evaluableConditions[i].condition) + "'");
    if (eval(evaluableConditions[i].condition)) {
      nextStep = evaluableConditions[i].id;
      goToNextStep();
      // This first true encountered condition is taken in account
      break;
    }
  }
}

// ------------------------------------------------------------------
// button functions / UI functions
// ------------------------------------------------------------------
// Kevin's Reset button
$("#resetButton").on('click', function(){
  nextStep = getFirstStep(scenario);
  // trash navigation history
  nav_history = new Array();
  // Go
  goToNextStep();
});

// Next button
$('#nextButton').click(function() {
  clearStepTimeout();
  step_validation();
}); 

// Prev button
$('#prevButton').click(function() {
  // taking last visited step before the last one which is this one.
  nextStep = nav_history[nav_history.length-2] || getFirstStep(scenario);
  goToNextStep();
}); 

// Set visibility of prev button
function setPrevButton() {
  // this isthe first step, hide prev button
  if(scenario.steps[0].stepId == scenario.currentStep) {
    $('#prevButton').hide();
  } else {
    $('#nextButton').html("&lt;");
    $('#prevButton').show();
  }
}

// Set visibility of next button
function setNextButton() {
  // this is the last step, hide next button
  if(scenario.steps[scenario.steps.length-1].stepId == scenario.currentStep) {
    $('#nextButton').hide();
  } else {
    $('#nextButton').html("&gt;");
    $('#nextButton').show();
  }
}

// Updating ProgressBar : this is used every step change
function updateProgressBar(){
  // Sometime, the critical pass is shorter than the total number of steps.
  if (scenario.currentStep == scenario.steps[scenario.steps.length - 1].stepId) {
    bar.animate(1.0);
  } else {
    bar.animate((stepIndex + 1) / scenario.steps.length);  // Number from 0.0 to 1.0
  }
}



