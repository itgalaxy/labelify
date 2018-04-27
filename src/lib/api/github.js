"use strict";

const utils = require("../utils");

const { buildGotOptions, request, linkWalker } = utils;

function createLabel(config, label) {
  return request(
    config.endpoint,
    buildGotOptions({
      body: {
        color: label.color.replace("#", ""),
        description: label.description || null,
        name: label.name
      },
      headers: {
        accept: "application/vnd.github.symmetra-preview+json",
        authorization: `token ${config.token}`
      },
      json: true,
      method: "POST"
    })
  ).then(response => response.body);
}

function getLabels(config) {
  return linkWalker(
    config.endpoint,
    buildGotOptions({
      headers: {
        accept: "application/vnd.github.symmetra-preview+json",
        authorization: `token ${config.token}`
      },
      json: true,
      method: "GET"
    })
  );
}

function removeLabel(config, label) {
  return request(
    `${config.endpoint}/${label.name}`,
    buildGotOptions({
      headers: {
        accept: "application/vnd.github.symmetra-preview+json",
        authorization: `token ${config.token}`
      },
      json: true,
      method: "DELETE"
    })
  ).then(response => response.body);
}

function updateLabel(config, label) {
  return request(
    `${config.endpoint}/${label.name}`,
    buildGotOptions({
      body: {
        color: label.color.replace("#", ""),
        description: label.description || null,
        name: label.name
      },
      headers: {
        accept: "application/vnd.github.symmetra-preview+json",
        authorization: `token ${config.token}`
      },
      json: true,
      method: "PATCH"
    })
  ).then(response => response.body);
}

module.exports = {
  createLabel,
  getLabels,
  removeLabel,
  updateLabel
};
