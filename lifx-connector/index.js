"use strict";

const requestConfig = require("./requestConfig.json");
const commandCapabilityMappings = require("./commandCapabilityMappings.json");
const { lambda, partnerHelper } = require("st-schema");
const stPartnerHelper = new partnerHelper(requestConfig, commandCapabilityMappings);

async function discoveryRequest(request, response) {
  const results = await stPartnerHelper.requestBuilder("discoveryRequest", request.authentication.token, null, { "debug": true });
  for (let result of results) {
    const device = response.addDevice(result.id, result.label, _getDeviceHandler(result.product.capabilities));
    device.manufacturerName(result.product.company).modelName(result.product.name).hwVersion(result.product.identifier).roomName(result.location.name).addGroup(result.group.name);
  }
}

async function commandRequest(request, response) {
  const deviceMap = new Map();
  const lightStates = request.devices.map(({ externalDeviceId, commands }) => {
    const newState = {
      selector: externalDeviceId
    };
    deviceMap.set(externalDeviceId, response.addDevice(externalDeviceId));
    commands.forEach((command) => {
      switch (command.capability) {
        case "st.switchLevel":
          newState.brightness = command.arguments[0] / 100;
          break;
        case "st.switch":
          newState.power = command.command;
          break;
        case "st.colorTemperature":
          newState.color = "kelvin:" + command.arguments[0];
          break;
        case "st.colorControl":
          newState.color = "hue:" + command.arguments[0].hue * 3.6 + " saturation:" + command.arguments[0].saturation / 100
          break;
        default:
          console.log("Unknown capability: " + command.capability);
          return;
      }
    });
    return newState;
  });
  let results = await stPartnerHelper.requestBuilder("commandRequest", request.authentication.token, {"states" : lightStates}, {"debug": true})
  for (let result of results.results) {    //lifx api does not return state back in response
    if (result.results[0].status !== "ok" || !deviceMap.get(result.results[0].id)) { continue; }
    let device = deviceMap.get(result.results[0].id);
    stPartnerHelper.mapSTCommandsToState(device, request.devices[0].commands)
  }
}

async function stateRefreshRequest(request, response) {
  let deviceMap = new Map();
  request.devices.map(({ externalDeviceId }) => {
    deviceMap.set(externalDeviceId, response.addDevice(externalDeviceId));
  });

  let results = await stPartnerHelper.requestBuilder("stateRefreshRequest", request.authentication.token, null, {"debug": true});
  for (let result of results) {
    let device = deviceMap.get(result.id);
    if (!device) { continue; }
    stPartnerHelper.mapPartnerToSTCapability(device, result)
  }
}

module.exports.handler = lambda({
  discoveryRequest,
  commandRequest,
  stateRefreshRequest
});

function _getDeviceHandler(lifxCapabilities) {
  if (lifxCapabilities.has_color) {
    return "c2c-rgbw-color-bulb"
  } else {
    return "c2c-color-temperature-bulb"
  }
}
