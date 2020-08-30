const MAX_ID = Number.MAX_SAFE_INTEGER;

function createId()
{
  return Math.floor(Math.random() * MAX_ID);
}

module.exports = createId;
