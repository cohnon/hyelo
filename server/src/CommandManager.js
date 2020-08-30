class CommandManager
{
  constructor(app)
  {
    this.app = app;
  }

  handleCommand(websocket, socket, data)
  {
    const command = commands[data.cmd];
    if (!command)
    {
      return;
    }

    try
    {
      command(this.app, websocket, socket, data);
    }
    catch (e)
    {
      console.log('Command Error: ', e);
    }
  }
}

const config = require('../config');
const commands = {
  chat: (app, websocket, socket, data) => {
    if (!data.msg || !data.msg.length || data.msg.length < 1)
    {
      return;
    }
    if (data.msg.length > 2000)
    {
      data.msg = data.msg.substring(0, 2000);
    }
    const room = app.roomManager.find(socket.roomId);
    if (room)
    {
      data.nick = socket.nick;
      data.time = Date.now();
      data.id = socket.id;
      websocket.sendToRoom(socket, room, data);
    }
  },

  rand: (app, websocket, socket, data) => {
    let { tags } = data;
    if (tags)
    {
      if (!Array.isArray(tags))
      {
        return;
      }

      if (tags.length === 0)
      {
        tags = undefined;
      }
      else
      {
        let invalid = false;
        tags.forEach((tag) => {
          if (typeof tag !== 'string')
          {
            invalid = true;
          }
        });
        if (invalid)
        {
          return;
        }
      }

    }

    if (app.matchMaker.isWaiting(socket))
    {
      return websocket.send(socket, {
        cmd: 'warn',
        msg: 'You are already in queue.',
      });
    }

    // leave old room if in one
    if (socket.roomId)
    {
      const left_room = app.roomManager.leave(socket.roomId, socket);
      if (left_room)
      {
        websocket.sendToRoom(socket, left_room, { cmd: 'info', msg: `${socket.nick} left.` });
      }
    }

    let match = app.matchMaker.findMatch(socket, tags);
    if (!match)
    {
      // if waiting with tags, give up after XX seconds
      if (tags)
      {
        setTimeout(() => {
          if (app.matchMaker.isWaiting(socket))
          {
            match = app.matchMaker.giveUp(socket);
            if (!match)
            {
              return;
            }
  
            matchMade();
          }
        }, 8000);
      }
      return websocket.send(socket, {
        cmd: 'info',
        msg: 'Matching...',
      });
    }

    matchMade();

    function matchMade()
    {
      const roomId = app.roomManager.join(socket);
      app.roomManager.join(match.socket, roomId);
      const tagMessage = match.tag ? ` You both like ${match.tag}!` : '';
      websocket.send(socket, {
        cmd: 'info',
        msg: `You matched with ${match.socket.nick}.` + tagMessage,
      });
      websocket.send(match.socket, {
        cmd: 'info',
        msg: `You matched with ${socket.nick}.` + tagMessage,
      });
    }
  },

  join: (app, websocket, socket, data) => {
    let { id } = data;
    if (typeof id !== 'string')
    {
      return;
    }

    // leave old room if in one
    if (socket.roomId)
    {
      const left_room = app.roomManager.leave(socket.roomId, socket);
      if (left_room)
      {
        websocket.sendToRoom(socket, left_room, { cmd: 'info', msg: `${socket.nick} left.` });
      }
    }

    const roomId = app.roomManager.join(socket, id);
    const room = app.roomManager.find(roomId);
    if (room.size === 1)
    {
      websocket.send(socket, {
        cmd: 'info',
        msg: `You are the only one here. Invite others with http://localhost:8080/?${roomId}`,
      });
    }
    else
    {
      websocket.sendToRoom(null, room, { cmd: 'info', msg: `${socket.nick} joined.` });
    }
  },

  exit: (app, websocket, socket) => {
    // leave if in queue
    if (app.matchMaker.isWaiting(socket))
    {
      app.matchMaker.removeFromQueue(socket);
    }

    // leave if in room
    const room = app.roomManager.find(socket.roomId);
    if (room)
    {
      app.roomId = null;
      app.roomManager.leave(socket.roomId, socket);
      if (room.size > 0)
      {
        websocket.sendToRoom(socket, room, {
          cmd: 'info',
          msg: `${socket.nick} left.`,
        });
      }
    }
  },

  nick: (_app, _websocket, socket, data) => {
    let new_nick = data.nick;
    if (!new_nick)
    {
      return;
    }
    new_nick = new_nick.trim().substring(0, 20);
    socket.nick = new_nick;
  },

  ban: (app, websocket, socket, data) => {
    const { pwd, id } = data;
    const reason = data.reason || 'No reason specified.';

    if (pwd !== config.ADMIN_PASSWORD)
    {
      return;
    }

    const banned_socket = websocket.findSocketById(id);
    if (!banned_socket)
    {
      return websocket.send(socket, {
        cmd: 'info',
        msg: 'A user with that id doesn\'t exit',
      });
    }

    app.rateLimiter.ban(banned_socket.address);
    websocket.send(socket, {
      cmd: 'info',
      msg: 'User banned',
    });
    websocket.send(banned_socket, {
      cmd: 'warn',
      msg: `You have been banned: ${reason}`,
    });
  },
};

module.exports = CommandManager;
