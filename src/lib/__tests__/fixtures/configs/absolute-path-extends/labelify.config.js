"use strict";

const path = require("path");

module.exports = {
  config: {
    token: "IT IS INSECURITY, BETTER USE `process.env.TOKEN`"
  },
  extends: path.resolve(__dirname, "./labelify-extended.config"),
  labels: [
    {
      color: "#aaaaaa",
      name: "0"
    }
  ]
};
