var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const httpPort = 3000;
var ip = require('ip');

// RFID Code
var serialData = {
	tag: "",
	reader: ""
};

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
	}	
});

// function parseSerial(msg){
// };

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  } else {
  	console.log('Reading on ', portName);
  }
});

//------------------------------------------------------------------------
// Init Socket to transmit Serial data to HTTP client
//------------------------------------------------------------------------
io.on('connection', function(client){
  client.on('event', function(data){});
  client.on('disconnect', function(){});
});

// Http server Listening
server.listen( httpPort, function( ) {
  console.log( 'server Ip Address is %s', ip.address() );	 		
  console.log( 'it is listening at port %d', httpPort );
});

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
