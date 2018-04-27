"use strict";

const gitlabAPI = require("./gitlab");
const githubAPI = require("./github");

module.exports = platform => {
  let lowerApi = null;

  switch (platform) {
    case "github":
      lowerApi = {
        create: githubAPI.createLabel,
        // FMI: Should return response
        list: githubAPI.getLabels,
        remove: githubAPI.removeLabel,
        update: githubAPI.updateLabel
      };
      break;
    case "gitlab":
      lowerApi = {
        create: gitlabAPI.createLabel,
        // FMI: Should return response
        list: gitlabAPI.getLabels,
        remove: gitlabAPI.removeLabel,
        update: gitlabAPI.updateLabel
      };
      break;
    // no default
  }

  return lowerApi;
};
