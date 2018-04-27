"use strict";

const githubAPI = require("../github");
const nock = require("nock");

const { createLabel, getLabels, removeLabel, updateLabel } = githubAPI;

describe("github api", () => {
  const url = "https://api.github.com";
  const projectID = "itgalaxy/labelify";
  const endpointPart = `/repos/${projectID}/labels`;
  const endpoint = `${url}${endpointPart}`;
  const config = { endpoint, token: "token" };

  it("should success create the label", () => {
    expect.assertions(1);

    nock(url)
      .post(endpointPart)
      .reply(201, {
        color: "fff",
        default: false,
        description: "description",
        id: 1,
        name: "name",
        url: `${endpoint}/name`
      });

    return expect(
      createLabel(config, {
        color: "#fff",
        description: "description",
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success create the label without description", () => {
    expect.assertions(1);

    nock(url)
      .post(endpointPart)
      .reply(201, {
        color: "fff",
        default: false,
        description: null,
        id: 1,
        name: "name",
        url: `${endpoint}/name`
      });

    return expect(
      createLabel(config, {
        color: "#fff",
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success get labels", () => {
    expect.assertions(1);

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "fff",
          default: false,
          description: "description",
          id: 1,
          name: "name",
          url: `${endpoint}/name`
        },
        {
          color: "fff",
          default: false,
          description: "other description",
          id: 2,
          name: "other-name",
          url: `${endpoint}/other-name`
        }
      ]);

    return expect(getLabels(config)).resolves.toMatchSnapshot();
  });

  it("should success remove the label", () => {
    expect.assertions(1);

    nock(url)
      .delete(`${endpointPart}/name`)
      .reply(204, "");

    return expect(
      removeLabel(config, {
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update the label", () => {
    expect.assertions(1);

    nock(url)
      .patch(`${endpointPart}/name`)
      .reply(200, {
        color: "000",
        default: false,
        description: "other-description",
        id: 1,
        name: "name",
        url: `${endpoint}/name`
      });

    return expect(
      updateLabel(config, {
        color: "fff",
        description: "description",
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update the label without description", () => {
    expect.assertions(1);

    nock(url)
      .patch(`${endpointPart}/name`)
      .reply(200, {
        color: "000",
        default: false,
        description: null,
        id: 1,
        name: "name",
        url: `${endpoint}/name`
      });

    return expect(
      updateLabel(config, {
        color: "#fff",
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });
});
