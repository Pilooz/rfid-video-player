var SerialPort = require('serialport');
var portName = '/dev/cu.usbserial-A603XVZO';
//var port = new SerialPort('/dev/tty.usbserial-A603XVZO', { autoOpen: false });
var port = new SerialPort(portName, { 
		autoOpen: false,
		baudRate: 115200 
	});

port.open(function (err) {
  if (err) {
    return console.log('Error opening port: ', err.message);
  } else {
  	console.log('Reading on ', portName);
  }
});
 
// The open event is always emitted
port.on('open', function() {
	// Switches the port into "flowing mode"
	port.on('data', function (data) {
	  console.log('Data:', data);
	});
});


// function hex2a(x) {
//     var hex = x.toString();//force conversion
//     var str = '';
//     for (var i = 0; i < hex.length; i += 2)
//         str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
//     return str;
// }
