var app 			    = require('express')();
var express			  = require('express');
var router        = express.Router();
var server 			  = require('http').createServer(app);
const httpPort		= 3000;
var io            = require('socket.io').listen(server);
var ip 				    = require('ip');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var path			    = require('path');

var httpRequests    = {};
var dataForTemplate = {};

// RFID Data structure
var lastRfidData = { tag: "", reader: "" };
var rfidData = {
	tag: "1234567890",
	reader: "1"
};

// Video data sctructure
var mediaFile = {
  uri: "",
  loop: "",
  autoplay: "",
  controls: ""
}

const waitingMedia = { uri: "/videos/messages/waitingForTag.mp4", loop: "on", autoplay: "on", controls: "off" }
const mediaNotFoundMedia = { uri: "/videos/messages/mediaNotFound.mp4", loop: "off", autoplay: "on", controls: "off" }
const noTagAssocMedia = { uri: "/videos/messages/noTagAssociation.mp4", loop: "off", autoplay: "on", controls: "off" }
const searchingMedia = { uri: "/videos/messages/searching.mp4", loop: "off", autoplay: "on", controls: "off" }

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {
    // Emit the service message to client
    socket.emit('server.message', waitingMedia);
    //socket.emit('server.rfidData', rfidData);
    socket.on('client.acknowledgment', console.log);
});

// just for POC
// Send current time to all connected clients
function sendEachTime() {
    io.emit('server.time', { time: new Date().toJSON() });
    // Emit Socket only if rfid is different of the last reading
    if (lastRfidData.tag != rfidData.tag ) {  
      io.emit('server.rfidData', rfidData);
      lastRfidData.tag = rfidData.tag;    
      rfidData.tag++;
    }
}

// Send current time every 10 secs
setInterval(sendEachTime, 5000);
// End of POC.

//------------------------------------------------------------------------
// Reading Serial Port
//------------------------------------------------------------------------
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
// TODO : Put it in a config file
const portName = '/dev/cu.usbserial-A603XVZO';
const baudRate = 115200;
//
const port = new SerialPort(portName, { 
		autoOpen: true,
		baudRate: baudRate
	});
// Parser definiton
const parser = port.pipe(new Readline({ delimiter: '\r\n' }));

// Parsing RFID Tag
parser.on('data', function(msg){
 	console.log('Received:', msg);
	// If data is a tag
	if(msg.indexOf("<TAG:") > -1) {
	 	rfidData.code = msg.split("<TAG:").join("").split(">")[0]
	 	console.log("extracted rfid code : ", rfidData.code);
	 	rfidData.reader = msg.split("<READER:")[1].split(">")[0]
	 	console.log("extracted reader : ", rfidData.reader);

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
  	console.log('Reading on ', portName);
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
