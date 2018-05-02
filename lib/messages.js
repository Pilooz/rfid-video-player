
exports = module.exports = function(io){
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
}