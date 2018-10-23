  // Global variables --------------------------------------------------
  var socket = io(); //'http://localhost:3000'
  var scenario = {}; // Scenario given by the rfid reading
  var step = {};     // Current step in the scenario
  var content = {}; // Rendered template of the current step
  var trns_content = {}; // Rendered transitions template of the current step  
  // End Global variables ----------------------------------------------

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

  // Loading step
  function loadStep(scenar){
    // Set title
    setScenarioTitle(scenar.title);
    // get step
    step = getCurrentStepDetails();
    // step title
    setStepTitle(step.title);
    // get step template
    content = getTemplate('/scenario/step-template', step, "#stepTemplate");
    // get transiton template
    trns_content = getTemplate('/scenario/step-transitions', step, "#transitionsTemplate");
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
