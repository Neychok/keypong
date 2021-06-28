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
socket.on( "enterGame", () => {


  document.getElementById( 'screen' ).style.display = 'none';

  //DEFINES
  const WIDTH = 1024;
  const HEIGHT = 512

  //Aliases
  const Application            = PIXI.Application,
        loader                 = PIXI.loader,
        Graphics               = PIXI.Graphics,
        Text                   = PIXI.Text,
        TextStyle              = PIXI.TextStyle;
        DisplayObjectContainer = PIXI.DisplayObjectContainer;

  let player1, player2, ball, line;   

  //Create a Pixi Application
  const app = new Application( { width: WIDTH, height: HEIGHT } );

  //Add the canvas that Pixi automatically created for you to the HTML document
  document.body.appendChild( app.view );

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
    }

  let y_direction = 1;
  let x_direction = 1;
  let player1_hitable = false;
  let player2_hitable = false;
  let wordContainer, i, str;
  let word = [];

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
  let scoreStyle = new TextStyle({
    fontFamily: "Arial",
    fontSize: 72,
    fill: 0x444444,
  });
  
  //This `setup` function will run when the image has loaded
  function setup() {
    //Create the cat sprite
    player1 = new Graphics();
    player2 = new Graphics();
    player1_score = new Text( 0, scoreStyle );
    player2_score = new Text( 0, scoreStyle );
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

    player1.position.set( 16, HEIGHT/2-42 );
    player2.position.set( WIDTH-24, HEIGHT/2-42 );
    player1_score.position.set( WIDTH - 800, HEIGHT/2-36 );
    player2_score.position.set( WIDTH - 275, HEIGHT/2-36 );
    ball.position.set( WIDTH/2, HEIGHT/2 );
    line.position.set( WIDTH/2-4, 0 );

    app.stage.addChild( line );
    app.stage.addChild( player1 );
    app.stage.addChild( player2 );
    app.stage.addChild( player1_score );
    app.stage.addChild( player2_score );
    app.stage.addChild( ball );

    keyboard( 'ready' );

    socket.on( 'gameStart', data => {
          // Initial Game Vartiables
      y_direction = data.y;
      x_direction = data.x;
      app.ticker.speed = 4;
      gameInstance = app.ticker.add( game );
    });
  }

  // TICKER
  const game = function game( delta ) {
    
    // Checks if ball hit a player 1
    if ( ball.x <= 40 && player1_hitable ) {
      if ( x_direction == -1 ) {
        x_direction = 1;
      } else {
        x_direction = -1;
      }
      player1_hitable = false;
      if ( player == 2 ) {
        socket.emit( 'word' );
      }
    }

    // Checks if ball hit player 2
    if ( ball.x >= WIDTH-40 && player2_hitable ) {
      if ( x_direction == -1 ) {
        x_direction = 1;
      } else {
        x_direction = -1;
      }
      player2_hitable = false;
      if ( player == 1 ) {
        socket.emit( 'word' );
      }
    }

    // Checks if ball hit upper and lower wall
    if ( ball.y >= HEIGHT - 16 ) {
      y_direction = -1;
    }
    else if ( ball.y <= 16 ){
      y_direction = 1;
    }

    // Player 1 scores
    if ( ball.x > WIDTH ) {
      resetGame();
      app.ticker.remove( game );

      if ( player == 1 ) {
        socket.emit( 'scored' );
      }
    }
    // Player 2 scores
    else if ( ball.x <= 0 ) {
      resetGame();
      app.ticker.remove( game );

      if ( player == 2 ) {
        socket.emit( 'scored' );
      }
    }
   
    ball.x += delta * x_direction;
    ball.y += delta * y_direction;

    if ( ball.y < HEIGHT - 42 && ball.y > 42 ) {
      player1.y = ball.y - 42;
      player2.y = ball.y - 42;
    };
  }
  // END OF TICKER

  socket.on( 'word', data => {
    keyboard( data.word );
  });

  socket.on( 'enemyEnteredWord', () => {
    if ( player == 1 ) {
      player2_hitable = true;
    } else {
      player1_hitable = true;
    }
  });

  socket.on( 'scoreUpdate', data => {
    if ( data.player == 1 ) {
      app.stage.removeChild( player1_score );
      player1_score = new Text( data.score, scoreStyle );
      player1_score.position.set( WIDTH - 800, HEIGHT/2-36 );
      app.stage.addChild( player1_score );
    } else {
      app.stage.removeChild( player2_score );
      player2_score = new Text( data.score, scoreStyle );
      player2_score.position.set( WIDTH - 275, HEIGHT/2-36 );
      app.stage.addChild( player2_score );
    }
  });

  socket.on( 'speedIncrease', data => {
    app.ticker.speed = app.ticker.speed + 0.15;
    console.log(app.ticker.speed);
  });

  socket.on( 'secondLevel', () => {
    app.ticker.speed = 3.5;
  });

  function resetGame() {
    app.ticker.speed = 4;
    ball.position.set( WIDTH / 2, HEIGHT / 2 );
    player1.position.set( 16, HEIGHT / 2 - 42 );
    player2.position.set( WIDTH - 24, HEIGHT / 2 - 42 );
    player1_hitable = false;
    player2_hitable = false;
    keyboard( 'ready' );
  }
  
  // Display a word and wait for input
  function keyboard( string ) {
    let startW, startH;
    str = string;
    word = [];
    i = 0;
    document.removeEventListener( "keypress", checkKey );
    app.stage.removeChild( wordContainer );
    
    if ( player == 1 ) {
      startW = WIDTH - 850;
      startH = HEIGHT - 80;
    }
    else if ( player == 2 ) {
      startW = WIDTH - 300;
      startH = HEIGHT - 80;
    }
    
    wordContainer = new DisplayObjectContainer();
    app.stage.addChild( wordContainer );
    for ( let char = 0, space = 0; char < str.length; char++ ) {
      word.push( new Text( str[char], neutralStyle) );
      if ( char > 0 ) {
        space += word[char-1].width
      }
      word[char].position.set( startW + space + 10, startH );
      wordContainer.addChild( word[char] );
    }
    document.addEventListener( "keypress", checkKey );
  }

  function checkKey( event ) {
    if ( i < word.length ) {
      if ( event.key == str[i] ) {
        word[i].style = correctStyle;
        i++;
        if ( i == word.length ) {
          app.stage.removeChild( wordContainer );
          if ( str == 'ready' ) {
            socket.emit( 'readyEntered' );
            this.removeEventListener( 'keypress', checkKey );
            return;
          } else {
            socket.emit( 'wordEntered' );
            if ( player == 1 ) {
              player1_hitable = true;
            } else {
              player2_hitable = true;
            }
            this.removeEventListener( 'keypress', checkKey );
            return;
          }
        }
      } else {
        word[i].style = wrongStyle;
      }
    }
  }



});

// HELPER FUNCTIONS


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