const RoomManager = require('./RoomManager');
const MatchMaker = require('./MatchMaker');
const CommandManager = require('./CommandManager');
const Sockets = require('./Sockets');
const RateLimiter = require('./RateLimiter');

class HyeloApp
{
  init()
  {
    this.rateLimiter = new RateLimiter();
    this.roomManager = new RoomManager();
    this.matchMaker = new MatchMaker();
    this.commandManager = new CommandManager(this);
    this.sockets = new Sockets(this);
  }
}

module.exports = HyeloApp;
