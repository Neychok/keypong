// Socket Init
const socket = io();

// Show available rooms
socket.on( 'availableRooms', data => {
  showAvailableRooms( data );
});

// Add room on room creation
socket.on( 'roomCreated', room => {
  addRoom( room );
});

// Delete room on room deletion
socket.on( 'roomDeleted', room => {
  removeRoom( room );
});

// Start New Lobby
const newLobbyButton = document.getElementById( 'new-lobby' );
newLobbyButton.addEventListener( 'click', () => {
  // Hide Old Screen
  document.getElementById( 'start-menu' ).style.display       = "none";
  // Show New Screen
  document.getElementById( 'create-new-lobby' ).style.display = "flex";
});

// Create New Lobby
const createLobby = document.getElementById( 'create-lobby' );
createLobby.addEventListener( 'click', () => {
  const lobbyName = document.getElementById( 'lobby-name' );
  const username = document.getElementById( 'new-lobby-username' );
  // Checks if Lobby Name is filled
  if ( ! lobbyName.value ) {
    lobbyName.style.borderColor = 'red';
  }
  // Checks if Username is filled
  if ( ! username.value ) {
    username.style.borderColor  = 'red';
  }
  
  // If everything is filled
  if ( username.value && lobbyName.value ) {
    // Send room data to server
    socket.emit( 'createLobby', { 
      lobbyName: lobbyName.value,
      username: username.value,
    });

    let player1 = document.getElementById( 'player-1' );
    
    // Hide Old Screen
    document.getElementById( 'create-new-lobby' ).style.display = "none";
    document.getElementById( 'mark-ready' ).setAttribute( 'data-player', 1 );
    // Show Lobby Name
    document.getElementById( 'lobby-name-inside' ).innerText    = lobbyName.value;
    // Show Username
    player1.querySelector( '.username' ).innerText              = username.value;
    // Show New Screen
    document.getElementById( 'lobby' ).style.display            = "flex";
  }
});

// PLAYER JOIN LOBBY
socket.on( 'reserveSpot', data => {
  let player1 = document.getElementById( 'player-1' );
  let player2 = document.getElementById( 'player-2' );
  
  player1.querySelector( '.username' ).innerText = data.player;
  player2.querySelector( '.username' ).innerText = 'Player joined and is picking name...';
});

// PLAYER PICKED NAME
const pickUsernameButton = document.getElementById( 'enter-lobby' );
// socket.data.username = document.getElementById( 'join-lobby-username' ).value;
pickUsernameButton.addEventListener( 'click', () => {
  socket.emit( 'usernamePicked', {
    username: document.getElementById( 'join-lobby-username' ).value,
    room: pickUsernameButton.dataset.room
  });

  document.getElementById( 'enter-lobby-screen' ).style.display = 'none';
  // Show New Screen
  document.getElementById( 'lobby' ).style.display = 'flex';
});

socket.on( 'usernamePicked', username => {
  document.getElementById('mark-ready').disabled = false;
  let player2 = document.getElementById( 'player-2' );
  player2.querySelector( '.username' ).innerText = username;

});

// SET PLAYER
let player;
socket.on( 'setPlayer', data => {
  player = data;
});

// LOBBY
const markReady = document.getElementById( 'mark-ready' );
markReady.addEventListener( 'click', () => {
  socket.emit( 'markReady' );
});

socket.on( 'markReady', data => {
  if ( data.player == player ) {
    if ( data.ready == 1 ) {
      markReady.innerText = 'Mark As Not Ready';
    }
    else if ( data.ready == 0 ) {
      markReady.innerText = 'Mark As Ready';
    }
  }
  if ( data.player == 1 ) {
    if ( data.ready == 1 ) {
      document.querySelector( '#player-1>.no-check' ).style.display   = 'none';
      document.querySelector( '#player-1>.yes-check' ).style.display  = 'block';
    }
    else if ( data.ready == 0 ) {
      document.querySelector( '#player-1>.no-check' ).style.display   = 'block';
      document.querySelector( '#player-1>.yes-check' ).style.display  = 'none';
    }
  }
  else if ( data.player == 2 ) {
    if ( data.ready == 1 ) {
      document.querySelector( '#player-2>.no-check' ).style.display   = 'none';
      document.querySelector( '#player-2>.yes-check' ).style.display  = 'block';
    }
    else if ( data.ready == 0 ) {
      document.querySelector( '#player-2>.no-check' ).style.display   = 'block';
      document.querySelector( '#player-2>.yes-check' ).style.display  = 'none';
    }
  }
});


// Game Start
socket.on( "startGame", () => {

  document.getElementById( 'screen' ).style.display = 'none';

  //DEFINES
  const WIDTH = 1024;
  const HEIGHT = 512

  //Aliases
  const Application = PIXI.Application,
      loader        = PIXI.loader,
      resources     = PIXI.loader.resources,
      Sprite        = PIXI.Sprite,
      TextureCache  = PIXI.utils.TextureCache,
      Rectangle     = PIXI.Rectangle,
      Graphics      = PIXI.Graphics,
      Text          = PIXI.Text,
      TextStyle     = PIXI.TextStyle;

  let player1, player2, ball, line;   

  //Create a Pixi Application
  const app = new Application( { width: WIDTH, height: HEIGHT } );

  //Add the canvas that Pixi automatically created for you to the HTML document
  document.body.appendChild( app.view );
  link = document.createElement( 'a' );
  link.setAttribute( 'href', 'https://youtu.be/dQw4w9WgXcQ' );
  link.setAttribute( 'class', 'dlc' );
  link.innerText = 'TO CONTINUE PLAYING PLEASE BUY THE DLC!';
  document.body.appendChild( link );

  link.addEventListener( 'click', () => {
    socket.emit('rickroll');
  });

  //load an image and run the `setup` function when it's done
  loader
    .add( "cat","sprites/tileset.png")
    .on("progress", loadProgressHandler)
    .load(setup);

    function loadProgressHandler(loader, resource) {

    //Display the file `url` currently being loaded
    console.log("loading: " + resource.url); 
    
    //Display the percentage of files currently loaded
    console.log("progress: " + loader.progress + "%"); 
    
    //If you gave your files names as the first argument 
    //of the `add` method, you can access them like this
    //console.log("loading: " + resource.name);
    }

  //This `setup` function will run when the image has loaded
  function setup() {
    //Create the cat sprite
    player1 = new Graphics();
    player2 = new Graphics();
    ball    = new Graphics();
    line    = new Graphics();
    player1.beginFill(0xff0000);
    player2.beginFill(0x0000ff);
    
    ball.beginFill(0xffff00);
    line.beginFill(0x165600);

    player1.drawRect(0, 0, 8, 84);
    player2.drawRect(0, 0, 8, 84);
    ball.drawCircle(0, 0, 16);
    line.drawRect(0, 0, 8, 512);

    player1.endFill();
    player2.endFill();
    ball.endFill();
    line.endFill();

    player1.position.set( 32, HEIGHT/2-42 );
    player2.position.set( WIDTH-32, HEIGHT/2-42 );
    ball.position.set( WIDTH/2, HEIGHT/2 );
    line.position.set( WIDTH/2-4, 0 );

    app.stage.addChild( line );
    app.stage.addChild( player1 );
    app.stage.addChild( player2 );
    app.stage.addChild( ball );

    console.log(player);
    if ( player == 1 ) {
      keyboard( 'ready', WIDTH - 850, HEIGHT - 80 );
    }
    else if ( player == 2 ) {
      keyboard( 'ready', WIDTH - 300, HEIGHT - 80 );
    }

    // Start Game
    app.ticker.add( delta => game( delta ) );
  }

  function game( delta ) {
    ball.x += 1;
  }

  function keyboard( str, startW, startH ) {
    let neutralStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "white",
    });
    let wrongStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "red",
    });
    let correctStyle = new TextStyle({
      fontFamily: "Arial",
      fontSize: 36,
      fill: "green",
    });
    let word = [];
    for ( let char = 0, space = 0; char < str.length; char++ ) {
      word.push( new Text( str[char], neutralStyle) );
      if ( char > 0 ) {
        space += word[char-1].width
      }
      word[char].position.set( startW + space + 10, startH );
      app.stage.addChild( word[char] );
    }
    let i = 0;
    document.addEventListener("keypress", function(event) {
      if ( i < word.length ){
        if ( event.key == str[i] ){
          word[i].style = correctStyle;
          i++;
        } else {
          word[i].style = wrongStyle;
        }
      } else {
        return true;
      }
    });
  }
});

// HELPER FUNCTIONS

// KEYBOARD KEY


// SHOWS AVAILABLE ROOMS
function showAvailableRooms( data ) {
  if ( data.rooms ) {
    data.rooms.forEach( room => {
      let listItem  = document.createElement( 'li' );
      let title     = document.createElement( 'p' );
      let button    = document.createElement( 'button' );

      title.innerText = room.slice( 5, -9 );
      listItem.appendChild( title );

      button.innerText = 'Join Room';
      button.setAttribute( "class", "join-room" );
      button.setAttribute( "data-room", room );
      button.onclick = () => { joinRoom( button ); };
      listItem.appendChild( button );
      listItem.setAttribute( 'class', room );

      document.getElementById( 'games-list' ).appendChild( listItem );
    });
  }
}

// ADDS ROOM
function addRoom( room ) {
  if ( room ) {
    let listItem  = document.createElement( 'li' );
    let title     = document.createElement( 'p' );
    let button    = document.createElement( 'button' );

    title.innerText = room.slice( 5, -9 );
    listItem.appendChild( title );

    button.innerText = 'Join Room';
    button.setAttribute( 'class', 'join-room' );
    button.setAttribute( 'data-room', room );
    button.onclick = () => { joinRoom( button ); };
    listItem.appendChild( button );
    listItem.setAttribute( 'class', room );

    document.getElementById( 'games-list' ).appendChild( listItem );
  }
}

// REMOVES ROOM
function removeRoom( room ) {
  document.querySelector( '.' + room ).remove();
}

// JOIN ROOM
function joinRoom( element ) {
  socket.emit( 'joinLobby', { room: element.dataset.room } );
  // Hide Old Screen
  document.getElementById( 'start-menu' ).style.display = "none";

  document.querySelector( '#enter-lobby-screen>.lobby-name' ).innerText = element.dataset.room.slice( 5, -9 );
  document.getElementById( 'lobby-name-inside' ).innerText      = element.dataset.room.slice( 5, -9 );
  // Show New Screen
  document.getElementById( 'enter-lobby-screen' ).style.display = "flex";
}