const MatchMaker = require('./MatchMaker');
const matchMaker = new MatchMaker();

function makeTestSockets(amount)
{
  const data = [];
  for (let i = 0; i < amount; i++)
  {
    data.push({ id: i });
  }
  return data;
}

const possibleTags = ['one', 'two', 'three', 'four', 'five', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];
function makeTestTags(amount)
{
  const data = [];
  for (let i = 0; i < amount; i++)
  {
    const currentTags = [];
    for (let i = 0; i < 5; i++)
    {
      currentTags.push(possibleTags[Math.floor(Math.random() * possibleTags.length)]);
    } 
    data.push(currentTags);
  }
  return data;
}

const testAmount = 100;
const testSockets = makeTestSockets(testAmount);
const testTags = makeTestTags(testAmount);

describe('matchmaker', () => {
  afterEach(() => {
    matchMaker.queue = new Map();
    matchMaker.noTagQueue = null;
    matchMaker.tags = {};
    matchMaker.lastUsedTags = {};
    matchMaker.popular = [];
  });

  it('should_match_no_tags', () => {
    matchMaker.findMatch(testSockets[0]);
    const secondMatch = matchMaker.findMatch(testSockets[1]);
    expect(secondMatch.socket.id).toEqual(testSockets[0].id);
  });

  it('should_not_match_if_in_queue', () => {
    matchMaker.findMatch(testSockets[0]);
    matchMaker.findMatch(testSockets[1], testTags[1]);

    const firstCollision = matchMaker.findMatch(testSockets[0]);
    const secondCollision = matchMaker.findMatch(testSockets[1], testTags[1]);

    expect(firstCollision).toEqual(undefined);
    expect(secondCollision).toEqual(undefined);
  });

  it('should_match_by_tag', () => {
    matchMaker.findMatch(testSockets[0], testTags[0]);
    const match = matchMaker.findMatch(testSockets[1], testTags[0]);
    expect(match).toBeTruthy();
  });

  it('should_not_match_tag_and_no_tag', () => {
    matchMaker.findMatch(testSockets[0]);
    const match = matchMaker.findMatch(testSockets[1], testTags[1]);
    expect(match).toBeFalsy();
  });

  it('should_update_popular', () => {
    for (let i = 0; i < testAmount; i++)
    {
      matchMaker.findMatch(testSockets[i], testTags[i]);
    }
    console.log(matchMaker.tags);
    expect(Array.isArray(matchMaker.popularTags())).toBeTruthy();
  });
});
