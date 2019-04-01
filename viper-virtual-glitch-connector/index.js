"use strict";
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

let discoveryResponse = require("./discoveryResponse.json");
const refreshResponse = require("./refreshResponse.json");
const { partnerHelper, CommandResponse } = require("st-schema");
const stPartnerHelper = new partnerHelper({}, {});

function discoveryRequest(requestId) {
  discoveryResponse.headers.requestId = requestId
  console.log(discoveryResponse);
  return discoveryResponse
}

function commandRequest(request) {
  let response = new CommandResponse(request.headers.requestId)
  request.body.devices.map(({ externalDeviceId, deviceCookie, commands }) => {
    const device = response.addDevice(externalDeviceId, deviceCookie);
    stPartnerHelper.mapSTCommandsToState(device, commands)
  });
  console.log("response: %j", response);
  return response;
}

function stateRefreshRequest(request) {
  let response = { "headers": { "schema": "st-schema", "version": "1.0", "interactionType": "stateRefreshResponse", "requestId": "abc-123-456" }, "deviceState": [] };
  request.body.devices.map(({ externalDeviceId, deviceCookie }) => {
    console.log("externalDeviceId: ", externalDeviceId);
    let deviceResponse = refreshResponse[externalDeviceId];
    response.deviceState.push(deviceResponse)
    console.log("deviceResponse: ", deviceResponse);
  });
  
  console.log(response);
  return response;
}

function grantCallbackAccess(request) {
  console.log("grantCallbackAccess token is:", request.callbackAuthentication.code)
  console.log("grantCallbackAccess clientId is:", request.callbackAuthentication.clientId)
  return {};
}


// Renders the homepage
app.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(discoveryResponse));
  res.end();
});


// [START Action]
app.post('/', function (req, res) {
  console.log('Request received: ' + JSON.stringify(req.body));
  
  let response
  const { headers, authentication, devices } = req;
  const { interactionType1, requestId } = headers;
  const interactionType = req.body.headers.interactionType;
  console.log("request type: ", interactionType);
  try {
    switch (interactionType) {
      case "discoveryRequest":
        response = discoveryRequest(req.headers.requestId)
        break;
      case "commandRequest":
        response = commandRequest(req)
        break;
      case "stateRefreshRequest":
        response = stateRefreshRequest(req)
        break;
      case "grantCallbackAccess":
        response = grantCallbackAccess(req)
        break;
      default:
        response = "error. not supported interactionType" + interactionType
        console.log(response);
        break;
    }
  } catch (ex) {
    console.log("failed with ex", ex)
  }

  res.send(response);

});


if (module === require.main) {
  // [START server]
  let server = app.listen(process.env.PORT || 3000, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;