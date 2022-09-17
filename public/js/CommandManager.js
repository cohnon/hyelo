class CommandManager
{
  constructor(app)
  {
    this.app = app;
  }

  handle(command, data)
  {
    if (!commands[command])
    {
      this.app.messageManager.systemMessage('That is an invalid command. Type \'/help\' for a list of commands.');
      return;
    }
    if (!Array.isArray(data))
    {
      data = [data];
    }
    commands[command].execute(this.app, data);
  }

  chat(text)
  {
    if (this.app.room_open)
    {
      this.app.socket.emit({ cmd: 'chat', msg: text });
      this.app.messageManager.push({ cmd: 'me', msg: text });
    }
  }
}

import { addTag, removeTag, clearTags, getTags } from './homepage.js';
const commands = {
  // DEFAULT COMMANDS
  help: {
    description: 'Lists all commands.',
    execute: (app, _data) => {
      let message = '__List of commands__\n';
      for (const command in commands)
      {
        if (!!commands[command].description)
        {
          message += `${command}: ${commands[command].description}\n`
        }
      }
      app.messageManager.systemMessage(message);
    },
  },
  nick: {
    description: 'Changes your nickname. /nick <new_nickname>',
    execute: (app, data) =>
    {
      const nick = data[0];
      app.changeNick(nick);
      if (!nick || nick === app.nick)
      {
        app.messageManager.systemMessage(`Your name is already ${app.nick}.`);
        return;
      }
      app.messageManager.systemMessage(`You changed your nickname to ${app.nick}.`);
      app.socket.emit({ cmd: 'nick', nick: app.nick });
    },
  },
  theme: {
    description: 'Changes the colour theme. /theme <new_theme>',
    execute: (app, data) =>
    {
      const theme = data[0];
      if (!theme) return

      app.changeTheme(theme);
      app.messageManager.systemMessage(`You changed the theme to ${theme}.`);
      app.socket.emit({ cmd: 'nick', nick: app.nick });
    },
  },
  skip: {
    description: 'Ends current random chat and starts a new one.',
    execute: (app, data) => {
      const tags = data;
      if (app.room_open && app.in_random)
      {
        if (!app.room_open)
        {
          app.changeRoute('chatroom');
        }
        else
        {
          app.messageManager.clear();
        }
        app.in_random = true;
        if (!tags || tags.length === 0)
        {
          app.socket.emit({ cmd: 'rand' });
        }
        else
        {
          app.socket.emit({ cmd: 'rand', tags });
        }
      }
    },
  },
  rand: {
    description: 'Starts a random chat.',
    execute: (app, data) => {
      const tags = data;
      if (!app.room_open)
      {
        app.changeRoute('chatroom');
      }
      else
      {
        app.messageManager.clear();
      }
      app.in_random = true;
      if (!tags || !Array.isArray(tags))
      {
        app.socket.emit({ cmd: 'rand', tags: getTags() });
      }
      else
      {
        app.socket.emit({ cmd: 'rand', tags });
      }
    },
  },
  join: {
    description: 'Joins a room. /join <group_id>',
    execute: (app, data) => {
      const roomId = data[0];
      if (!roomId || roomId.length === 0)
      {
        return;
      }
      if (!app.room_open)
      {
        app.changeRoute('chatroom');
      }
      else
      {
        app.in_random = false;
        app.messageManager.clear();
      }
      app.socket.emit({ cmd: 'join', id: roomId });   
    },
  },
  clr: {
    description: 'Clears all messages',
    execute: (app, _roomId) => {
      app.messageManager.clear();
    },
  },
  // HIDDEN COMMANDS
  home: {
    level: -1,
    execute: (app, _data) => {
      app.in_random = false;
      app.socket.emit({ cmd: 'exit' });
      app.changeRoute('homepage');
    },
  },
  tag: {
    level: -1,
    execute: (_app, data) => {
      const tag = data[0];
      addTag(tag);
    }
  },
  cltag: {
    level: -1,
    execute: (_app, data) => {
      const id = data[0];
      if (typeof id !== 'number')
      {
        clearTags();
        return;
      }
      removeTag(id - 1);
    },
  },
  ban: {
    level: -1,
    execute: (app, data) => {
      const pwd = data.shift();
      const id = data.shift();
      const reason = data.join(' ');
      if (!id || !reason || !pwd)
      {
        return app.messageManager.systemMessage('Missing argument(s)');
      }
      app.socket.emit({ cmd: 'ban', id, reason, pwd });
    },
  }
};

export default CommandManager;
