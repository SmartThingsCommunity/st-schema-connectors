'use strict';

const { lambda } = require("st-schema");
const SleepNumberBedSchemaConnector = require('./connector');

const connector = new SleepNumberBedSchemaConnector();

module.exports.handler = lambda({
	discoveryRequest: async function (event, response) {
						if (connector.accessTokenIsValid(event.authentication.token, response)) {
							return connector.discoveryCallback(event.authentication.token, response)
						}	
					},
    commandRequest: async function (event, response) {
						if (connector.accessTokenIsValid(event.authentication.token, response)) {
							return connector.commandCallback(event.authentication.token, response, event.devices)
						}
					},
    stateRefreshRequest: async function (event, response) {
						if (connector.accessTokenIsValid(event.authentication.token, response)) {
							return connector.stateRefreshCallback(event.authentication.token, response)
						}
					}
});
