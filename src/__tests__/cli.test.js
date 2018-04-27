"use strict";

const execa = require("execa");
const path = require("path");

const labelifyCLI = path.resolve(__dirname, "../../bin/labelify.js");

describe("labelify", () => {
  it("should output version", () =>
    expect(
      execa("node", [labelifyCLI, "-v"]).then(result => result.stdout)
    ).resolves.toMatchSnapshot());

  it("should output version (2)", () =>
    expect(
      execa("node", [labelifyCLI, "--version"]).then(result => result.stdout)
    ).resolves.toMatchSnapshot());

  it("should output help", () =>
    expect(
      execa("node", [labelifyCLI, "-h"]).then(result => result.stdout)
    ).resolves.toMatchSnapshot());

  it("should output help (2)", () =>
    expect(
      execa("node", [labelifyCLI, "--help"]).then(result => result.stdout)
    ).resolves.toMatchSnapshot());
});
