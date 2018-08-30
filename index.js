global.__basedir  = __dirname;
var CONFIG        = require('./config/config.js');

var app           = require('express')();
var express       = require('express');
var router        = express.Router();
var server        = require('http').createServer(app);
const httpPort    = CONFIG.server.port;
var io            = require('socket.io').listen(server);
var ip            = require('ip');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var path          = require('path');
var formidable    = require('formidable'); // File upload

// Timout to simulate searching, if needed by config.
var timeBeforeSendingMedia = (CONFIG.app.simulateSearchTime) ? CONFIG.app.searchTimeout : 0;

// Rfid parsing functions
var rfid          = require('./lib/rfid.js');

// RFID Data structure
var lastReadData = { code: "", reader: "" };
var rfidData     = { code: "x", reader: "1"};

// Databases
var db_keys   = require(CONFIG.app.dbPath + '/keywords.js');
var db_m      = require(CONFIG.app.dbPath + '/media.js');

// Media DB functions
var mediaDB       = require('./lib/mediaDB.js');

// Init media functions with databases
mediaDB.init(db_keys, db_m);

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {
    console.log("New client is connected : " + socket.id );
    // Emit the service message to client : by defaut, playing "waiting video"
    socket.emit('server.message', mediaDB.waitingMedia());
    
    // Client acknowledgment when it has received a media element
    socket.on('client.acknowledgment', function(data){
      console.log(data.message);
    });

    // When receiving endMedia, send mediaDB.waitingMedia()
    socket.on('client.endMedia', function(data){
      console.log(data.message);
      // reset lastReadData and rfidData, because we may reuse the same tag
      lastReadData = { code: "", reader: "" };
      rfidData     = { code: "x", reader: "1"};
      socket.emit('server.message', mediaDB.waitingMedia());
    });

});


//------------------------------------------------------------------------
// Emit sockets to send media to the client
//------------------------------------------------------------------------
function sendingMedia() {
  // Emit Socket only if rfid is different of the last reading
  console.log("lastReadData.code = " + lastReadData.code);
  console.log("rfidData.code = " + rfidData.code);
    
  if (lastReadData.code != rfidData.code ) {  
    io.emit('server.rfidData', {tag: rfidData.code, reader: rfidData.reader});

    // Simulating a search time in the extra super big media database !
    if (CONFIG.app.simulateSearchTime) {
      io.emit('server.play-media', module.exports.searchingMedia());
    }

    // if CONFIG.app.simulateSearchTime then timeout this code
    setTimeout(function() {
      console.log("Tag : '" + rfidData.code + "', reader : #" + rfidData.reader);
      io.emit('server.play-media', mediaDB.chooseMedia(rfidData.code, rfidData.reader, __dirname));
    }, timeBeforeSendingMedia);

    lastReadData.code = rfidData.code;
  }
}

// 
// START of Emulation of tag reading .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
// This is just for dev purposes
//
if (CONFIG.rfid.behavior == "emulated") {
  console.log("The Serial communication with RFID readers is in '" + CONFIG.rfid.behavior + "' mode.");
  //var testList = [ {tag:"1234567890ABC", reader:1}, {tag: "0110FB661A96", reader:2}, {tag: "0110FB65F976", reader:3}, {tag: "0110FB5DEB5C", reader:1}, {tag: "0110FB5DF047", reader:2}];
  var testList = [ {tag:"coderfid1", reader:1}, {tag: "coderfid2", reader:2}, {tag: "coderfid3", reader:3}, {tag: "coderfid4", reader:1}, {tag: "coderfid5", reader:2}];
  var i = 0;

  function sendEachTime() {
      // // Emit Socket only if rfid is different of the last reading
      rfidData.code = testList[i].tag;
      rfidData.reader = testList[i].reader;
      sendingMedia();
      i++;
      if (i == testList.length ) i=0;
  }

  // Send current time every 10 secs
  setInterval(sendEachTime, 10000);
}

//
// END of Emulation of tag reading .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
//

//------------------------------------------------------------------------
// Reading Serial Port (App have to be configure un 'real' mode, see below)
//------------------------------------------------------------------------
if (CONFIG.rfid.behavior == "real") {
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
      sendingMedia();
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
}

//------------------------------------------------------------------------
// HTTP Server configuration
//------------------------------------------------------------------------
server.listen( httpPort, '0.0.0.0', function( ) {
  console.log( '------------------------------------------------------------' );
  console.log( 'server Ip Address is %s', ip.address() );     
  console.log( 'it is listening at port %d', httpPort );
  console.log( '------------------------------------------------------------' );
  console.log( 'Working mode : ' + CONFIG.rfid.mode);
  console.log( 'RFID reading is ' + CONFIG.rfid.behavior);
  console.log( '------------------------------------------------------------' );
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
app.use('/videos', express.static(__dirname + CONFIG.app.mediaPath)); // redirect media directory
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/socket.io/dist')); // Socket.io
app.use('/js', express.static(__dirname + '/node_modules/json-editor/dist')); // Json-editor
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

//-----------------------------------------------------------------------------
// Routing Middleware functions
// application logic is here / GET and POST on Index
//-----------------------------------------------------------------------------
var dataForTemplate = {};
var httpRequests = {};

router.all('/*', function (req, res, next) {
  // mettre toutes les requests dans un seul objet.
  httpRequests = req.query; // according to the use of express
  dataForTemplate.rfid_mode = CONFIG.rfid.mode;
  dataForTemplate.numReaders = CONFIG.rfid.numReaders;

  next(); // pass control to the next handler
})

/* POST home page. */
.post('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
})

/* GET home page. */
.get('/', function(req, res, next) {
  res.render('index', { data: dataForTemplate });
})

/* GET contrib page. */
.get('/contrib', function(req, res, next) {
  res.render('contrib', { data: httpRequests });
})

/* POST media page. */
.post('/media-upload', function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, CONFIG.app.mediaPath);
    form.keepExtensions = true; // keep original extension

    form.parse(req, function (err, fields, files) {
       // Let the media library do the rest of the job !
      mediaDB.newMedia(fields, files);
    });
  // Routing to index
  res.redirect('/');
  //res.render('index', { data: dataForTemplate });
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
