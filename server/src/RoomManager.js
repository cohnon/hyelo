const createId = require('./utilities/uniqueId');

class RoomManager
{
  constructor()
  {
    this.rooms = {};
  }

  join(socket, roomId)
  {
    // create random ID if none supplied
    if (!roomId || roomId.length === 0)
    {
      roomId = createId();
      this.rooms[roomId] = new Map();
    }
    // create room if doesn't exist
    else if (!this.rooms[roomId])
    {
      roomId = roomId.substring(0, 20).trim().replace(/\s+/, '-');
      this.rooms[roomId] = new Map();
    }
    
    this.rooms[roomId].set(socket.id, socket);
    socket.roomId = roomId;
    return roomId;
  }

  leave(roomId, socket)
  {
    // room doesn't exist
    if (!this.rooms[roomId])
    {
      return false;
    }

    // user is not in room
    if (!this.rooms[roomId].get(socket.id))
    {
      return false;
    }

    this.rooms[roomId].delete(socket.id);
    socket.roomId = null;
    
    // delete room if empty
    if (this.rooms[roomId].size === 0)
    {
      delete this.rooms[roomId];
      return false;
    }
    return this.rooms[roomId];
  }

  find(roomId)
  {
    return this.rooms[roomId];
  }
}

module.exports = RoomManager;
