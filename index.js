var CONFIG        = require('./config/config.js');
var app 			    = require('express')();
var express			  = require('express');
var router        = express.Router();
var server 			  = require('http').createServer(app);
const httpPort		= CONFIG.server.port;
var io            = require('socket.io').listen(server);
var ip 				    = require('ip');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var path          = require('path');

// Rfid parsing functions
var rfid          = require('./lib/rfid.js');

// Media DB functions
var mediaDB       = require('./lib/mediaDB.js');

// RFID Data structure
var lastRfidData = { tag: "", reader: "" };
var rfidData = {
	tag: "0110FB663BB7",
	reader: "1"
};

// Timout to simulate searching, if needed by config.
var timeBeforeSendingMedia = (CONFIG.app.simulateSearchTime) ? CONFIG.app.searchTimeout : 0;

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {

    // Emit the service message to client : by defaut, playing "waiting video"
    socket.emit('server.message', mediaDB.waitingMedia());
    
    // Client acknowledgment when it has received a media element
    socket.on('client.acknowledgment', function(data){
      console.log(data.message);
    });

    // When receiving endMedia, send mediaDB.waitingMedia()
    socket.on('client.endMedia', function(data){
      console.log(data.message);
      socket.emit('server.message', mediaDB.waitingMedia());
    });

});


//------------------------------------------------------------------------
// Emit sockets to send media to the client
//------------------------------------------------------------------------
function sendingMedia() {
  // Emit Socket only if rfid is different of the last reading
  if (lastRfidData.tag != rfidData.tag ) {  
    //io.emit('server.rfidData', rfidData);
    
    // Simulating a search time in the extra super big media database !
    if (CONFIG.app.simulateSearchTime) {
      io.emit('server.play-media', module.exports.searchingMedia());
    }

    // if CONFIG.app.simulateSearchTime then timeout this code
    setTimeout(function() {
      console.log("Tag : #" + rfidData.tag);
      io.emit('server.play-media', mediaDB.chooseMedia(rfidData.tag, __dirname));
    }, timeBeforeSendingMedia);

    lastRfidData.tag = rfidData.tag;
  }
}

// just for POC .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-
// Send current time to all connected clients

var testList = ["1234567890ABC", "0110FB661A96", "0110FB65F976", "0110FB5DEB5C", "0110FB5DF047"];
var i = 0;

function sendEachTime() {
    // // Emit Socket only if rfid is different of the last reading
    sendingMedia();
    rfidData.tag = testList[i];
    i++;
    if (i == testList.length ) i=0;
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
