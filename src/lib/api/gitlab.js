"use strict";

const utils = require("../utils");

const { buildGotOptions, request, linkWalker } = utils;

function createLabel(config, label) {
  return request(
    config.endpoint,
    buildGotOptions({
      body: {
        color: label.color,
        description: label.description || null,
        name: label.name,
        priority: label.priority || null
      },
      headers: {
        "PRIVATE-TOKEN": config.token
      },
      json: true,
      method: "POST"
    })
  ).then(reponse => reponse.body);
}

function getLabels(config) {
  return linkWalker(
    config.endpoint,
    buildGotOptions({
      headers: {
        "PRIVATE-TOKEN": config.token
      },
      json: true,
      method: "GET"
    })
  );
}

function removeLabel(config, label) {
  return request(
    config.endpoint,
    buildGotOptions({
      body: {
        name: label.name
      },
      headers: {
        "PRIVATE-TOKEN": config.token
      },
      json: true,
      method: "DELETE"
    })
  ).then(response => response.body);
}

function updateLabel(config, label) {
  return request(
    config.endpoint,
    buildGotOptions({
      body: {
        color: label.color,
        description: label.description || null,
        name: label.name,
        priority: label.priority || null
      },
      headers: {
        "PRIVATE-TOKEN": config.token
      },
      json: true,
      method: "PUT"
    })
  ).then(response => response.body);
}

module.exports = {
  createLabel,
  getLabels,
  removeLabel,
  updateLabel
};
