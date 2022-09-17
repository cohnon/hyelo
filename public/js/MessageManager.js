import { renderText, renderTime } from './hyeloText.js';

class MessageManager
{
  constructor(app)
  {
    this.app = app;
    this.lastSent = [];
    this.lastSentIndex = 0;
    this.messagesHTML = null;
    this.inputHTML = document.getElementById('input');
    this.inputHTML.addEventListener('keydown', (e) => {
      this.onKeyDown(e)
    });
    this.inputHTML.addEventListener('input', (e) => {
      if (e.target.value.length > 2000)
      {
        e.preventDefault();
        e.target.value = e.target.value.substring(0, 2000);
      }
      this.updateHeight();
    });
    window.addEventListener('keydown', (e) => {
      if (this.app.room_open)
      {
        if (e.ctrlKey || e.metaKey || e.altKey)
        {
          return;
        }
        if (e.target.id === 'nick-input')
        {
          return;
        }
        this.inputHTML.focus();
      }
      else if (e.key === '/')
      {
        this.inputHTML.focus();
      }
    });
    this.updateHeight();
  }

  onKeyDown(e)
  {
    if (e.key === 'Enter' && !e.shiftKey)
    {
      e.preventDefault();
      if (e.target.value.trim().length === 0)
      {
        return;
      }
      this.send(e.target.value);
      e.target.value = '';
      this.updateHeight();
    }
    else if (e.key === 'Escape')
    {
      e.preventDefault();
      e.target.value = '';
      this.app.commandManager.handle('home');
      this.updateHeight();
    }
    else if (e.key === 'ArrowUp')
    {
      if (this.lastSent.length === 0) return;
      e.target.value = this.lastSent[this.lastSentIndex];
      if (this.lastSentIndex < this.lastSent.length - 1)
      {
        this.lastSentIndex++;
      }
    }
    else if (e.key === 'ArrowDown')
    {
      if (this.lastSent.length === 0) return;
      e.target.value = this.lastSent[this.lastSentIndex];
      if (this.lastSentIndex > 0)
      {
        this.lastSentIndex--;
      }
    }
    this.updateHeight();
  }

  onLoad()
  {
    this.messagesHTML = document.getElementById('messages');
  }

  send(text)
  {
    // add to message history
    this.lastSentIndex = 0;
    this.lastSent.unshift(text);
    if (this.lastSent.length > 10)
    {
      this.lastSent.pop();
    }

    // clean text
    text = text.trim();


    if (text.startsWith('/'))
    {
      text = text.split(' ');
      const command = text.shift().substring(1);
      const data = text;
      this.app.commandManager.handle(command, data);
      return;
    }

    this.app.commandManager.chat(text);
  }

  updateHeight()
  {
    this.inputHTML.style.height = '0px';
    this.inputHTML.style.height = this.inputHTML.scrollHeight + 'px';
  }


  push(message)
  {
    if (!this.messagesHTML)
    {
      return;
    }

    const newMessageHTML = document.createElement('div');
    newMessageHTML.className = 'message';

    if (message.cmd === 'info')
    {
      // inform player of skip in random chat
      if (this.app.in_random && message.msg.endsWith('left.'))
      {
        message.msg += ' Type /skip or /rand to start a new chat.';
      }

      newMessageHTML.className += ' info';
    }
    else if (message.cmd === 'warn')
    {
      newMessageHTML.className += ' warn';
    }
    else
    {
      const newNickHTML = document.createElement('p');
      newNickHTML.className = 'nick';
      if (message.cmd === 'me')
      {
        message.nick = this.app.nick;
        message.time = Date.now();
        newNickHTML.className += ' me';
      }
      else
      {
        newMessageHTML.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          try {
            var el = document.createElement('textarea');
            el.value = message.id;
            el.setAttribute('readonly', '');
            el.style = {position: 'absolute', left: '-9999px'};
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
          }
          catch (e)
          {
            console.log('failed to copy id');
          }
          return false;
        }, false);
      }
      newNickHTML.innerHTML = renderText(message.nick);
      newMessageHTML.appendChild(newNickHTML);
    }  
  
    const newMsgHTML = document.createElement('p');
    newMsgHTML.classList = 'msg';
    newMsgHTML.innerHTML = renderText(message.msg);
  
    newMessageHTML.appendChild(newMsgHTML);
  
    if (message.time)
    {
      const newTimeHTML = document.createElement('p');
      newTimeHTML.classList = 'time';
      newTimeHTML.innerHTML = renderTime(message.time);
      newMessageHTML.appendChild(newTimeHTML);
    }
  
    const bottom = this.isAtBottom();
    this.messagesHTML.appendChild(newMessageHTML);
    
    if (bottom || message.cmd === 'me') {
      this.messagesHTML.scrollTo(0, this.messagesHTML.scrollHeight);
    }
  }

  systemMessage(message)
  {
    this.push({ cmd: 'info', msg: message });
  }
  
  isAtBottom()
  {
    if (this.messagesHTML)
    {
      return this.messagesHTML.scrollHeight < this.messagesHTML.scrollTop + this.messagesHTML.clientHeight + 20;
    }
  }

  clear()
  {
    if (this.messagesHTML)
    {
      this.messagesHTML.innerHTML = '';
    }
  }
}

export default MessageManager;
