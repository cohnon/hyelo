const createServer = require('./loaders/server');
const createId = require('./utilities/uniqueId');
const WebSockets = require('ws');

class Sockets
{
  constructor(app)
  {
    this.app = app;
    const server = createServer();
    this.ws = new WebSockets.Server({ server });
    this.ws.on('connection', (socket, request) => {
      this.onConnection(socket, request);
    });
    this.ws.on('error', (err) => {
      this.onError(err);
    });
    setInterval(() => this.heartbeat(), 10000);
  }

  heartbeat()
  {
    this.ws.clients.forEach((socket) => {
      if (!socket.is_alive)
      {
        socket.close();
        return;
      }
      socket.ping();
      socket.is_alive = false;
    });
  }

  onConnection(socket, request)
  {
    socket.address = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    socket.id = createId();
    socket.nick = 'Stranger';
    socket.is_alive = true;
    
    socket.on('message', (data) => {
      this.onMessage(socket, data);
    });
    socket.on('close', () => {
      this.onClose(socket);
    });
    socket.on('error', (err) => {
      this.onError(err);
    });
    socket.on('pong', () => {
      socket.is_alive = true;
    });
  }

  onMessage(socket, data)
  {
    try
    {
      data = JSON.parse(data);
    }
    catch (err)
    {
      socket.close();
    }

    if (this.app.rateLimiter.use(socket.address, 0))
    {
      this.send(socket, {
        cmd: 'warn',
        msg: 'You are sending to many messages or are blocked.',
      });

      return;
    }

    this.app.rateLimiter.use(socket.address, 1);

    this.app.commandManager.handleCommand(this, socket, data);
  }
  
  onClose(socket) {
    this.app.commandManager.handleCommand(this, socket, {
      cmd: 'exit',
    });
  }

  onError(err)
  {
    console.log(`Server Error: ${err}`);
  }

  findSocketById(socketId)
  {
    for (const client of this.ws.clients)
    {
      if (client.id == socketId)
      {
        return client;
      }
    }
  }

  /* MESSAGING */
  sendToRoom(from, room, data)
  {
    room.forEach((socket) => {
      if (!from || socket.id !== from.id)
      {
        socket.send(JSON.stringify(data));
      }
    });
  }
  send(socket, data)
  {
    socket.send(JSON.stringify(data));
  }

  broadcast(from, data, { roomId })
  {
    if (roomId)
    {
      const room = this.roomManager.find(roomId);
      if (room)
      {
        room.forEach((socket) => {
          if (!from || socket.id !== from.id)
          {
            socket.send(data);
          }
        });
      }
    }
    else
    {
      this.ws.clients.forEach((socket) => {
        socket.send(data);
      });
    }
  }
}

module.exports = Sockets;
