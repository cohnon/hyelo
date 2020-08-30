const config = require('../../config');
const express = require('express');
const helmet = require('helmet');
const path = require('path');

function createServer()
{
  const app = express();

  // middleware
  app.use(express.static(path.join(__dirname, '..', '..', '..', 'public')));
  app.use(helmet());

  // routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', '..', 'public', 'index.html'));
  });

  const server = app.listen(config.PORT, () => {
    console.log(`http://localhost:${config.PORT}`);
  });

  return server;
}

module.exports = createServer;
