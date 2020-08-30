const HALFLIFE = 10 * 1000;
const MAX_SCORE = 15;

class RateLimiter
{
  constructor()
  {
    this.addresses = {};
  }

  find(address)
  {
    if (!this.addresses[address])
    {
      this.addresses[address] = {
        score: 0,
        time: Date.now(),
      };
    }
    return this.addresses[address];
  }

  use(address, score)
  {
    const user = this.find(address);
    if (user.banned)
    {
      return true;
    }

    user.score *= Math.pow(2, -(Date.now() - user.time) / HALFLIFE);
    user.score += score;
    user.time = Date.now();

    if (user.score > MAX_SCORE)
    {
      return true;
    }

    return false;
  }

  ban(address)
  {
    const user = this.find(address);
    user.banned = true;
  }

  unban(address)
  {
    const user = this.find(address);
    user.banned = false;
  }
}

module.exports = RateLimiter;
