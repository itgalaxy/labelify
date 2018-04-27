"use strict";

const apiResolver = require("..");
const githubAPI = require("../github");
const gitlabAPI = require("../gitlab");

describe("api resolved", () => {
  it("should resolve github api", () => {
    expect.assertions(4);

    const api = apiResolver("github");

    expect(api.create).toBe(githubAPI.createLabel);
    expect(api.list).toBe(githubAPI.getLabels);
    expect(api.remove).toBe(githubAPI.removeLabel);
    expect(api.update).toBe(githubAPI.updateLabel);
  });

  it("should resolve githab api", () => {
    expect.assertions(4);

    const api = apiResolver("gitlab");

    expect(api.create).toBe(gitlabAPI.createLabel);
    expect(api.list).toBe(gitlabAPI.getLabels);
    expect(api.remove).toBe(gitlabAPI.removeLabel);
    expect(api.update).toBe(gitlabAPI.updateLabel);
  });

  it("should resolve 'null' for unknown platform", () => {
    expect.assertions(1);

    const api = apiResolver("unknown");

    expect(api).toBeNull();
  });
});
