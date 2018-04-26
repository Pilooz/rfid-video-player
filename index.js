var CONFIG        = require('./config/config.js');
var in_array      = require('in_array');
var app 			    = require('express')();
var express			  = require('express');
var router        = express.Router();
var server 			  = require('http').createServer(app);
const httpPort		= CONFIG.server.port;
var io            = require('socket.io').listen(server);
var ip 				    = require('ip');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var path			    = require('path');
var fs            = require('fs');

// Rfid parsing functions
var rfid          = require('./lib/rfid.js');

// Databases
var db_keywords   = require('./data/keywords.js');
var db_media      = require('./data/media.js');


// RFID Data structure
var lastRfidData = { tag: "", reader: "" };
var rfidData = {
	tag: "0110FB663BB7",
	reader: "1"
};

// Video data sctructure for the choosen media
var mediaFile = {
  uri: "",
  loop: "",
  autoplay: "",
  controls: "",
  status: "",
  tag: ""
}

const waitingMedia = { uri: CONFIG.app.mediaPath + "/messages/waitingForTag.mp4", loop: "on", autoplay: "on", controls: "off", status: "waiting", tag: "" };
const mediaNotFoundMedia = { uri: CONFIG.app.mediaPath + "/messages/mediaNotFound.mp4", loop: "off", autoplay: "on", controls: "off", status: "mediaNotFound", tag: "" };
const noTagAssocMedia = { uri: CONFIG.app.mediaPath + "/messages/noTagAssociation.mp4", loop: "off", autoplay: "on", controls: "off", status: "noTagAssociation", tag: "" };
const searchingMedia = { uri: CONFIG.app.mediaPath + "/messages/searching.mp4", loop: "off", autoplay: "on", controls: "off", status: "searching", tag: "" };

console.log(db_keywords.keywordslist.length + " keywords in database.");
console.log(db_media.medialist.length + " medias in database.");

//
// Sorting unique in an array
//
function sort_unique(arr) {
  if (arr.length === 0) return arr;
  arr = arr.sort(function (a, b) { return a*1 - b*1; });
  var ret = [arr[0]];
  for (var i = 1; i < arr.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
    if (arr[i-1] !== arr[i]) {
      ret.push(arr[i]);
    }
  }
  return ret;
}

// Building a keyword list with rfid Tag
function buildKeywordList(rfidTag){
  // Builded keyword list from RFID tag
  var keyList = [];
  var index = 0;
  // Parcours tous les mots clés
  db_keywords.keywordslist.forEach(function(k){
    // Pour chaque mot clé, parcours tous les codes associés
    k.codes.forEach(function(c){
      if (c == rfidTag) {
        // Ajout du mot clé à la liste
        keyList[index] = k.keyword;
        index++;
        return false; // Easy way to break loop !
      }
    });
  });
  return sort_unique(keyList);
}

// Building media list
function buildMediaList(rfidTag){
  // Builded media list from keywordList
  var mediaCollection = [];
  var index = 0;
  // First Building keyword List 
  var keys = buildKeywordList(rfidTag);
  console.log(keys);  

  // Parcours des medias
  db_media.medialist.forEach(function(m){
    // Pour chaque mots-clé
    m.keywords.forEach(function(k){
      // Si les mots clé associés au media sont dans la listes de mots clé générée
      // On ajoute le média
      if ( in_array(k, keys) ) {
        mediaCollection[index] = CONFIG.app.mediaPath + "/" + m.media;
        index++;
        return false;
      }
    });
  });
  var col = sort_unique(mediaCollection);
  console.log(col); 
  return col;
  // return sort_unique(mediaCollection);
}

// Choosing a media randomly in the list
function chooseMedia(arr) {
  var i = Math.floor(Math.random()*arr.length);
  var m = arr[i];
  console.log("Choosen #" + i + " : " + m);
  return m;
  // return arr[Math.floor(Math.random()*arr.length)];
}
//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {

    // Emit the service message to client : by defaut, playing "waiting video"
    socket.emit('server.message', waitingMedia);
    
    // Client acknowledgment when it has received a media element
    socket.on('client.acknowledgment', function(data){
      console.log(data.message);
    });

    // When receiving endMedia, send waitingMedia
    socket.on('client.endMedia', function(data){
      console.log(data.message);
      socket.emit('server.message', waitingMedia);
    });

});

// just for POC .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
// Send current time to all connected clients

var testList = ["1234567890ABC", "0110FB661A96", "0110FB65F976", "0110FB5DEB5C", "0110FB5DF047"];
var i = 0;
var timeBeforeSendingMedia = (CONFIG.app.simulateSearchTime) ? CONFIG.app.searchTimeout : 0;

function sendEachTime() {
    io.emit('server.time', { time: new Date().toJSON() });
    // Emit Socket only if rfid is different of the last reading
    if (lastRfidData.tag != rfidData.tag ) {  
      io.emit('server.rfidData', rfidData);

      // Simulating a search time in the extra super big media database !
      if (CONFIG.app.simulateSearchTime) {
        io.emit('server.play-media', searchingMedia);
      }
      setTimeout(function() {
        var medias = [];
        medias = buildMediaList(rfidData.tag);
        // If media array if empty, the RFID tag was not associated
        if ( medias.length == 0 ) {
          noTagAssocMedia.tag = rfidData.tag;
          io.emit('server.play-media', noTagAssocMedia);
        } else {
          mediaFile = { uri: chooseMedia(medias), loop: "off", autoplay: "on", controls: "on", status: "content", tag: rfidData.tag };
          // Verifying that file exists
          if (fs.existsSync(path.join(__dirname, mediaFile.uri))) { 
            io.emit('server.play-media', mediaFile);
          } else {
            // File doesn't exists
            mediaNotFoundMedia.tag = rfidData.tag;
            // Putting the name of the file that doesn't exists to say it to the client
            mediaNotFoundMedia.filename = "." + mediaFile.uri;
            io.emit('server.play-media', mediaNotFoundMedia);
            mediaNotFoundMedia.filename = "";
          }
        }
      }, timeBeforeSendingMedia);

      // Storing that this tag was the last one read on port.
      lastRfidData.tag = rfidData.tag;    
      rfidData.tag = testList[i];
      i++;
      if (i == testList.length ) i=0;
    }
}

// Send current time every 10 secs
setInterval(sendEachTime, 10000);
// End of POC .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-

//------------------------------------------------------------------------
// Reading Serial Port
//------------------------------------------------------------------------
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const port = new SerialPort(CONFIG.rfid.portName, { 
		autoOpen: true,
		baudRate: CONFIG.rfid.baudRate
	});
// Parser definiton
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

// Parsing RFID Tag
parser.on('data', function(msg){
	// If data is a tag
  rfidData.code = rfid.extractTag(msg); 
  if (rfidData.code != "") {
    rfidData.reader = rfid.extractReader(msg);  
    console.log("extracted rfid code : " + rfidData.code + " on reader #" + rfidData.reader);

    // Emit Socket only if rfid is different of the last reading
    if (lastRfidData.tag != rfidData.tag ) {  
      io.emit('server.rfidData', rfidData);
      lastRfidData.tag = rfidData.tag;
    }
  }
});

// Opening serial port, checking for errors
port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  } else {
  	console.log('Reading on ', CONFIG.rfid.portName);
  }
});

//------------------------------------------------------------------------
// HTTP Server configuration
//------------------------------------------------------------------------
server.listen( httpPort, function( ) {
  console.log( 'server Ip Address is %s', ip.address() );	 		
  console.log( 'it is listening at port %d', httpPort );
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(__dirname + '/videos')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/socket.io/dist')); // Socket.io
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

//-----------------------------------------------------------------------------
// Routing Middleware functions
// application logic is here / GET and POST on Index
//-----------------------------------------------------------------------------
var dataForTemplate = {};

router.all('/*', function (req, res, next) {
  // mettre toutes les requests dans un seul objet.
  var httpRequests = req.body;
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

//-----------------------------------------------------------------------------
// Application express
//-----------------------------------------------------------------------------
app.use('/', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// all error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
