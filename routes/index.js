var express 		    = require('express');
var router 			    = express.Router();
var httpRequests    = {};
var dataForTemplate = {};

//-----------------------------------------------------------------------------
// Voici un petit middleware qui conserve l'état de l'application
//-----------------------------------------------------------------------------
router.all('/*', function (req, res, next) {
  // mettre toutes les requests dans un seul objet.
  httpRequests = req.body;
  next(); // pass control to the next handler
})

/* POST home page. */
.post('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
})

/* GET home page. */
.get('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
});

module.exports = router;
