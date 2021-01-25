'use strict';

require('dotenv').config();
const express = require('express')

const SleepNumberBedSchemaConnector = require('./connector');
const connector = new SleepNumberBedSchemaConnector();

connector.enableEventLogging(2)
connector.discoveryHandler(connector.discoveryCallback)
connector.stateRefreshHandler(connector.stateRefreshCallback)
connector.commandHandler(connector.commandCallback)

const PORT = process.env.PORT || 3000

const server = express();
server.use(express.json());

server.post('/', (req, res) => {
  if (connector.accessTokenIsValid(req.body.authentication.token, res)) {
    connector.handleHttpCallback(req, res)
  }
});

server.listen(PORT);
console.log(`Server listening on http://127.0.0.1:${PORT}`);