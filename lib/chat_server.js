const socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = (server) => {
  // start Socket.io server, allowing it piggyback on existing HTTP server
  io = socketio.listen(server);
  io.set('log level', 1);

  // user connection will be handled
  io.sockets.on('connection', (socket) => {
    // assign user a guest name when they connect
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, 'Lobby');

    handleMessageBoardcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);

    socket.on('rooms', () => {
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    handleClientDisconnection(socket, nickNames, namesUsed);
  })
}