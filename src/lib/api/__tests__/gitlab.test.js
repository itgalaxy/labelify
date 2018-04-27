"use strict";

const gitlabAPI = require("../gitlab");
const nock = require("nock");

const { createLabel, getLabels, removeLabel, updateLabel } = gitlabAPI;

describe("github api", () => {
  const url = "https://gitlab.com";
  const projectID = "itgalaxy%2Flabelify";
  const endpointPart = `/api/v4/projects/${projectID}/labels`;
  const endpoint = `${url}${endpointPart}`;
  const config = { endpoint, token: "token" };

  it("should success create the label", () => {
    expect.assertions(1);

    nock(url)
      .post(endpointPart)
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#fff",
        default: false,
        description: "description",
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        priority: 10,
        subscribed: false,
        url: `${endpoint}/name`
      });

    return expect(
      createLabel(config, {
        color: "#fff",
        description: "description",
        name: "name",
        priority: 10
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success create the label without description", () => {
    expect.assertions(1);

    nock(url)
      .post(endpointPart)
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#fff",
        default: false,
        description: null,
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        priority: 10,
        subscribed: false,
        url: `${endpoint}/name`
      });

    return expect(
      createLabel(config, {
        color: "#fff",
        name: "name",
        priority: 10
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success create the label without priority", () => {
    expect.assertions(1);

    nock(url)
      .post(endpointPart)
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#fff",
        default: false,
        description: "description",
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        priority: null,
        subscribed: false,
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

  it("should success get labels", () => {
    expect.assertions(1);

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          // eslint-disable-next-line camelcase
          closed_issues_count: 0,
          color: "#fff",
          default: false,
          description: "description",
          id: 1,
          name: "name",
          // eslint-disable-next-line camelcase
          open_issues_count: 0,
          // eslint-disable-next-line camelcase
          open_merge_requests_count: 0,
          priority: null,
          subscribed: false,
          url: `${endpoint}/name`
        },
        {
          // eslint-disable-next-line camelcase
          closed_issues_count: 0,
          color: "#fff",
          default: false,
          description: "other description",
          id: 2,
          name: "other-name",
          // eslint-disable-next-line camelcase
          open_issues_count: 0,
          // eslint-disable-next-line camelcase
          open_merge_requests_count: 0,
          priority: null,
          subscribed: false,
          url: `${endpoint}/other-name`
        }
      ]);

    return expect(getLabels(config)).resolves.toMatchSnapshot();
  });

  it("should success remove the label", () => {
    expect.assertions(1);

    nock(url)
      .delete(endpointPart, body => {
        if (body.name) {
          return true;
        }

        return false;
      })
      .reply(200, "");

    return expect(
      removeLabel(config, {
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update the label", () => {
    expect.assertions(1);

    nock(url)
      .put(endpointPart, body => {
        if (body.name) {
          return true;
        }

        return false;
      })
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#000",
        default: false,
        description: "other-description",
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        // eslint-disable-next-line camelcase
        open_merge_requests_count: 0,
        priority: 10,
        subscribed: false,
        url: `${endpoint}/name`
      });

    return expect(
      updateLabel(config, {
        color: "#fff",
        description: "description",
        name: "name",
        priority: 10
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update the label without description", () => {
    expect.assertions(1);

    nock(url)
      .put(endpointPart, body => {
        if (body.name) {
          return true;
        }

        return false;
      })
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#000",
        default: false,
        description: null,
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        // eslint-disable-next-line camelcase
        open_merge_requests_count: 0,
        priority: 10,
        subscribed: false,
        url: `${endpoint}/name`
      });

    return expect(
      updateLabel(config, {
        color: "#fff",
        name: "name",
        priority: 10
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update the label without priority", () => {
    expect.assertions(1);

    nock(url)
      .put(endpointPart, body => {
        if (body.name) {
          return true;
        }

        return false;
      })
      .reply(200, {
        // eslint-disable-next-line camelcase
        closed_issues_count: 0,
        color: "#000",
        default: false,
        description: "description",
        id: 1,
        name: "name",
        // eslint-disable-next-line camelcase
        open_issues_count: 0,
        // eslint-disable-next-line camelcase
        open_merge_requests_count: 0,
        priority: null,
        subscribed: false,
        url: `${endpoint}/name`
      });

    return expect(
      updateLabel(config, {
        color: "#fff",
        description: "description",
        name: "name"
      })
    ).resolves.toMatchSnapshot();
  });
});
