const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 8080;

let app = express();
let server = http.createServer( app );
let io = socketIO( server );

const roomRegex = new RegExp('^room_');

app.use( express.static( publicPath ) );

// User enters site
io.on( "connection", socket => {
	// Fetch available rooms
	let availableRooms = getAvailableRooms( io.sockets.adapter.rooms.entries() );
	if ( availableRooms ) {
		socket.emit( 'availableRooms', { rooms: availableRooms } );
	}

	// User creates a lobby room
	socket.on( 'createLobby', roomData => {
		const rooms = io.sockets.adapter.rooms;
		let roomName = makeName( roomData.lobbyName );
		socket.username = roomData.username;

		if ( rooms.has( roomName ) ) {
			roomName = makeName( roomData.lobbyName );
		}
		socket.join( roomName );
		socket.player = 1;
		socket.room = roomName;
		socket.emit( 'setPlayer', socket.player );
	})

	// User join a lobby room
	socket.on( 'joinLobby', data => {
		let player = io.sockets.adapter.rooms.get( data.room );
		player = io.sockets.sockets.get( player.values().next().value );
		socket.join( data.room );
		socket.player = 2;
		socket.room = data.room;
		io.emit( 'roomDeleted', data.room );
		socket.emit( 'setPlayer', socket.player );
		io.to( data.room ).emit( 'reserveSpot', { player: player.username } );
	});

	// User picks username
	socket.on( 'usernamePicked', data => {
		socket.username = data.username;
		io.to( socket.room ).emit( 'usernamePicked', data.username );
	});

	// Mark player as ready
	socket.on( 'markReady', () => {
		if ( ! socket.ready ) {
			socket.ready = 1;
		}
		else {
			socket.ready = 0;
		}
		io.to( socket.room ).emit( 'markReady', {
			player: socket.player,
			ready: socket.ready, 
		});
		if ( socket.ready == 1 ) {
			let players = io.sockets.adapter.rooms.get( socket.room );
			let ready = true;
			for ( player of players.values() ) {
				if ( ! io.sockets.sockets.get( player ).ready ) {
					ready = false;
				}
			}
			if ( ready ) {
				io.to( socket.room ).emit( 'startGame' );
			}
		}
	});

	socket.on( 'rickroll', () => {
		console.log(socket.username + ' has been rickrolled LOL!');
	});

	// User disconnects
	socket.on("disconnecting", reason => {
		console.log(reason);
	});
  });

  io.of("/").adapter.on("create-room", room => {
	if ( roomRegex.test( room ) ) {
		io.emit( 'roomCreated', room )
	}
  });
  io.of("/").adapter.on("delete-room", room => {
	if ( roomRegex.test( room ) ) {
		io.emit( 'roomDeleted', room )
	}
  });



server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});

// HELPER FUNCTIONS

// Get all available rooms
function getAvailableRooms( rooms ) {
	let availableRooms = [];
	for ( let [roomName, players] of rooms ) {
		if ( roomRegex.test( roomName ) && players.size < 2 ) {
			availableRooms.push( roomName );
		}
	}
	if ( availableRooms.length > 0 ) {
		return availableRooms;
	} else {
		return false;
	}
}

// Generates Name for room
function makeName( name ) {
    var randomString     = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 8; i++ ) {
      randomString += characters.charAt( Math.floor( Math.random() * charactersLength ) );
   	}
   return 'room_' + name + '_' + randomString;
}