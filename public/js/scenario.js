// Global variables -------------------------------------------------
var scenario = {}; // Scenario given by the rfid reading
var step = {};     // Current step in the scenario
var stepIndex = 0; // Index of the step in scenario (this is an integer)
var content = {}; // Rendered template of the current step
var lsnr_content = {}; // Rendered event listeners template of the current step
var nextStep = ""; // stepId for the next step of the scenario
var nav_history = new Array(); // Navigation history in scenario
var scenario_history = new Array();
var stepTimeout = undefined; // Timeout object for setTimeout function (timeElapsed, endMedia)

var setTimeoutStepIsStarting;
var setTimeoutStepIsEnding;
var setTimeoutBingoTransition;

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

// Get details of a step with a given stepId
function getStepDetailsOfStepId(stepId){
  var stepItem = "";
  for (var i=0; i<scenario.steps.length; i++) {
    if(scenario.steps[i].stepId == stepId) {
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
	/*
  $('title').html(t);
  $('#data-title').html(t);
  */
}

// Set step title
function setStepTitle(t){
  $('#data-title').html(t);
}

// Display rendered template
function displayTemplate(content, domId, thisStep) {
	cleanRenderContainer();
	
	$('body')
  	.attr('data-step-id', thisStep.stepId)
  	.attr('data-scenario-id', thisStep.scenarId)
  	.attr('data-template', thisStep.template);
  	
  $(domId)
  	.html(content);
  	
	$(domId).find('[data-toggle-if-step-id-in-histo]').each(function(){
		if (histo($(this).data('toggle-if-step-id-in-histo')) == true) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
  	
	$(domId).find('[data-toggle-if-step-id-not-in-histo]').each(function(){
		if (histo($(this).data('toggle-if-step-id-not-in-histo')) == true) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
  	
	$(domId).find('[data-toggle-if-scenar-in-histo]').each(function(){
		if (scenar_histo($(this).data('toggle-if-scenar-in-histo')) == true) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
  	
	$(domId).find('[data-toggle-if-scenar-not-in-histo]').each(function(){
		if (scenar_histo($(this).data('toggle-if-scenar-not-in-histo')) == true) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
  	
	$(domId).find('[data-toggle-if-all-scenars-not-in-histo]').each(function(){
		if (scenar_histo('scenario1') == true
		 && scenar_histo('scenario2') == true
		 && scenar_histo('scenario3') == true) {
			$(this).hide();
		} else {
			$(this).show();
		}
	});
  	
	$(domId).find('[data-toggle-if-all-scenars-in-histo]').each(function(){
		if (scenar_histo('scenario1') == true
		 && scenar_histo('scenario2') == true
		 && scenar_histo('scenario3') == true) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
  
  stepIsStarting();
}

// Clean all transition classes from the previous step
function cleanRenderContainer() {
	$('body').removeClass('step-is-ending is-video-paused is-menu-open cant-next');
}

function stepIsEnding(cb, delay = 500) {
	$('body').addClass('step-is-ending');
	
	clearTimeout(setTimeoutStepIsEnding);
  setTimeoutStepIsEnding = setTimeout(function(){
    cb();
  }, delay);
}

function stepIsStarting() {
	$('body').addClass('step-is-starting');
	
	clearTimeout(setTimeoutStepIsStarting);
	setTimeoutStepIsStarting = setTimeout(function(){
		$('body').removeClass('step-is-starting');
	}, 500);
}

// Adding a step in the nav history
function addStepHistory(stp) {
  nav_history.push(step.stepId);
  // suppress dupplicates.
//  nav_history = nav_history.filter(function(val,ind) { return nav_history.indexOf(val) == ind; })
}

// Loading step into navigator
function loadStep(scenar, stepId = null){
  // Tell the server which scenario and step we manage
  socket.emit('client.currentScenario', { currentScenario: scenar });
  
  // get step
  if (stepId != null) {
  	step = getStepDetailsOfStepId(stepId);
  } else {
  	step = getCurrentStepDetails();
  }
  
  // get step template
  content = getTemplate('/scenario/step-template', step, "#stepTemplate", function(){
	  // Set title
	  setScenarioTitle(scenar.title);
	  // step title
	  setStepTitle(step.title);
	  // build transition conditions
	  build_step_validation();
	  // keep history of visited steps
	  addStepHistory(step.stepId);
	  // Set UI elements
	  setPrevButton();
	  setNextButton();
	  updateProgressBar();
	  
	  /*
	  clearTimeout(setTimeoutBingoTransition);
	  
	  setTimeoutBingoTransition = setTimeout(function(){
		  unsetBingoTransition();
		}, 3000);
		*/
	  
	//  if (scenario.steps[scenario.steps.length-1].stepId == scenario.currentStep) {
		  addScenarioHistory();
	//  }
  });
}

// Adding a step in the scenario history
function addScenarioHistory() {
  scenario_history.push(scenario.scenarId);
  // suppress duplicates.
  scenario_history = scenario_history.filter(function(val,ind) { return scenario_history.indexOf(val) == ind; })
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

function getTemplate(url, data, resultDomId, cb) {
  data.scenarId = scenario.scenarId;
  data.scenarioMediaPath = scenario.scenarioMediaPath;
 

  $.ajax({
     url: url,
     crossDomain: true,
     data: data,
     type: 'POST',
     error: function(req, textStatus) {
      // TODO something clever to show error ! 
      displayTemplate(req.responseText, resultDomId, data.step);
      cb();
     },
     success: function(data) {
      // TODO : write a callback to update page
      displayTemplate(data.content, resultDomId, data.step);
      cb();
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

// returns true if the scenario (in param) has been visited (it is in history array)
function scenar_histo(scenarId) {
  if ( scenario_history.indexOf(scenarId) >= 0 ) {
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
    if (step.transitions[0].isBingoTransition && step.transitions[0].isBingoTransition == true) {
      if (step.transitions[0].isFinalBingo) {
      	setBingoTransition(true);
      } else {
	    	setBingoTransition();
      }
      
      setTimeoutBingoTransition = setTimeout(function(){
				goToNextStep();
      }, 300);
    } 
    // in any other case
    else {
    	goToNextStep();
    }
    
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
      
      // if we have to trigger a "bingo" transition
      if (evaluableConditions[i].isBingoTransition && evaluableConditions[i].isBingoTransition == true) {
	      if (evaluableConditions[i].isFinalBingo) {
	      	setBingoTransition(true);
	      } else {
		    	setBingoTransition();
	      }
	      
	      setTimeoutBingoTransition = setTimeout(function(){
					goToNextStep();
	      }, 300);
      } 
      // in any other case
      else {
      	goToNextStep();
      }
      // This first true encountered condition is taken in account
      break;
    }
  }
}

function setBingoTransition(isFinal = false) {
	if (isFinal == true) {
		$('body').addClass('is-bingo-transition is-final-bingo');
	} else {
		$('body').addClass('is-bingo-transition');
	}
}

function unsetBingoTransition() {
	$('body').removeClass('is-bingo-transition is-final-bingo');
}

// ------------------------------------------------------------------
// button functions / UI functions
// ------------------------------------------------------------------
// Kevin's Reset button
$("#resetButton").on('click', function(){
	
	location.reload();
	
	/*
  nextStep = getFirstStep(scenario);
  // trash navigation history
  nav_history = new Array();
  // Go
  goToNextStep();
  */
});

// Next button
$('#nextButton').click(function() {
	if ($('body').hasClass('is-bingo-transition')) {
		unsetBingoTransition();
	} else {
	  clearStepTimeout();
	  step_validation();
  }
}); 

$('#bingo').on('click', function(){
	unsetBingoTransition();
});

// Prev button
$('#prevButton').click(function() {
  // taking last visited step before the last one which is this one.
  nextStep = nav_history[nav_history.length-2] || getFirstStep(scenario);
  // remove the last step id (where we were)…
  nav_history.pop();
  // and remove the last before the last step id (where we're on). Why? Because goToNextStep() will add it then
  nav_history.pop();
  
  unsetBingoTransition();
  
  goToNextStep();
}); 

// Set visibility of prev button
function setPrevButton() {
  // this isthe first step, hide prev button
  if(scenario.steps[0].stepId == scenario.currentStep) {
    $('body').addClass('is-first-step-of-scenario');
  } else {
    $('body').removeClass('is-first-step-of-scenario');
  }
}

// Set visibility of next button
function setNextButton() {
  // this is the last step, hide next button
  if(scenario.steps[scenario.steps.length-1].stepId == scenario.currentStep) {
    $('body').addClass('is-last-step-of-scenario');
  } else {
    $('body').removeClass('is-last-step-of-scenario');
  }
  
  console.log(step);
  
  // if the step does not want next button (because of choices, e.g.)
  if(step.templateData && step.templateData.canNext == false) {
    $('body').addClass('cant-next');
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



