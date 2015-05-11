module.exports=function(io,rooms)
{
	var chatrooms = io.of('/roomlist')
	.on('connection', function(socket){
		console.log('Connection established on the server!!');
		socket.emit('roomupdate', JSON.stringify(rooms));
		socket.on('newroom', function(data){
			console.log('received newroom event')
			rooms.push(data);
			socket.broadcast.emit('roomupdate', JSON.stringify(rooms));
			socket.emit('roomupdate', JSON.stringify(rooms));
		})
	});



}