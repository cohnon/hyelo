class MatchMaker
{
  constructor()
  {
    this.noTagQueue = null;
    this.queue = new Map();
    this.tags = {};
    this.lastUsedTags = {};
    this.popular = [];
  }

  findMatch(socket, tags)
  {
    // no tag matching is simple
    if (!tags)
    {
      const foundUser = this.noTagQueue;
      if (!foundUser)
      {
        this.noTagQueue = socket;
        return;
      }
      if (foundUser.id === socket.id)
      {
        return;
      }
      this.noTagQueue = null;
      return { socket: foundUser };
    }

    // tag matching
    let foundUser = null;
    let matchedTag = null;
    for (let tag of tags)
    {
      foundUser = this.getUserByTag(tag);
      if (foundUser)
      {
        matchedTag = tag;
        break;
      }
    }

    if (!foundUser)
    {
      this.addToQueue(socket, tags);
      return;
    }

    if (foundUser.socket.id === socket.id)
    {
      return;
    }
    
    // match them up
    this.removeFromQueue(foundUser.socket);
    return { socket: foundUser.socket, tag: matchedTag };
  }

  giveUp(socket)
  {
    if (!this.queue.get(socket.id))
    {
      return;
    }

    this.removeFromQueue(socket);
    return this.findMatch(socket);
  }

  getUserByTag(tagMatch)
  {
    let foundUser = null;
    for (const tag in this.tags)
    {
      if (tag == tagMatch)
      {
        const id = this.tags[tag].socketIds[0];
        foundUser = this.queue.get(id);
      }
    }

    return foundUser;
  }

  addToQueue(socket, tags)
  {
    const newUser = {
      socket,
      tags,
    };

    this.queue.set(socket.id, newUser);

    // add the new tags to all the tags
    tags.forEach((tag) => {
      this.updatePopular(tag);
      if (this.tags[tag] === undefined)
      {
        this.tags[tag] = { score: 1, socketIds: [socket.id] };
      }
      else
      {
        this.tags[tag].score++;
        this.tags[tag].socketIds.push(socket.id);
      }
    });
  }

  removeFromQueue(socket)
  {
    // remove no tag
    if (this.noTagQueue && socket.id === this.noTagQueue.id)
    {
      this.noTagQueue = null;
      return;
    }


    const deletedUser = this.queue.get(socket.id);
    if (!deletedUser)
    {
      return;
    }
    this.queue.delete(socket.id);
    deletedUser.tags.forEach((tag) => {
      const index = this.tags[tag].socketIds.findIndex((socketId) => socketId === socket.id);
      if (index > -1)
      {
        this.tags[tag].socketIds.splice(index, 1);
        const tagScore = --this.tags[tag].score;
        if (tagScore < 1)
        {
          delete this.tags[tag];
        }
      }
    });
  }

  updatePopular(newTag)
  {
    if (!this.lastUsedTags[newTag])
    {
      this.lastUsedTags[newTag] = 1;
    }
    else
    {
      this.lastUsedTags[newTag]++;
    }
    
    const tagKeys = Object.keys(this.lastUsedTags);
    if (tagKeys.length > 15)
    {
      delete this.lastUsedTags[this.popular[this.popular.length - 1]];
    }
    this.popular = tagKeys.sort((a, b) => {
      return this.lastUsedTags[b]-this.lastUsedTags[a];
    });
  }

  popularTags()
  {
    return this.popular.splice(0, 5);
  }

  isWaiting(socket)
  {
    return !!this.queue.get(socket.id) || (!!this.noTagQueue && this.noTagQueue.id === socket.id);
  }
}

module.exports = MatchMaker;
