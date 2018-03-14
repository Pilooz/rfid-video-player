var app 			= require('express')();
var express			= require('express');
var server 			= require('http').createServer(app);
const httpPort		= 3000;
var io = require('socket.io').listen(server);
var ip 				= require('ip');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');
var index			= require('./routes/index');
var path			= require('path');

// RFID Data
var serialData = {
	tag: "1234567890",
	reader: "1"
};

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(socket) {
    socket.emit('rfidData', serialData);
    socket.on('clientAcknowledgment', console.log);
});

// just for POC
// Send current time to all connected clients
function sendEachTime() {
    serialData.tag++;
    io.emit('time', { time: new Date().toJSON() });
    io.emit('rfidData', serialData);
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

parser.on('data', function(msg){
 	console.log('Received:', msg);
	// If data is a tag
	if(msg.indexOf("<TAG:") > -1) {
	 	serialData.code = msg.split("<TAG:").join("").split(">")[0]
	 	console.log("extracted rfid code : ", serialData.code);
	 	serialData.reader = msg.split("<READER:")[1].split(">")[0]
	 	console.log("extracted reader : ", serialData.reader);
    io.emit('rfidData', serialData);
	}	
});

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
app.use('/videos', express.static(__dirname + '/media')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/js', express.static(__dirname + '/node_modules/socket.io/dist')); // Socket.io
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
