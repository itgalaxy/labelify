"use strict";

const os = require("os");
const path = require("path");
const nock = require("nock");
const labelify = require("..");

describe("labelify", () => {
  it("should success create/update/remove labels", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        },
        {
          color: "bbbbbb",
          default: false,
          description: "b",
          id: 2,
          name: "b",
          url: `${endpoint}/b`
        },
        {
          color: "cccccc",
          default: false,
          description: "other description",
          id: 3,
          name: "c",
          url: `${endpoint}/c`
        },
        {
          color: "dddddd",
          default: false,
          description: "D",
          id: 4,
          name: "d",
          url: `${endpoint}/d`
        }
      ])
      .patch(`${endpointPart}/b`)
      .reply(200, {
        color: "ababab",
        default: false,
        description: "b",
        id: 2,
        name: "b",
        url: `${endpoint}/b`
      })
      .patch(`${endpointPart}/c`)
      .reply(200, {
        color: "cccccc",
        default: false,
        description: "CC",
        id: 2,
        name: "c",
        url: `${endpoint}/c`
      })
      .post(endpointPart)
      .reply(201, {
        color: "eeeeee",
        default: false,
        description: "E",
        id: 5,
        name: "e",
        url: `${endpoint}/e`
      })
      .post(endpointPart)
      .reply(201, {
        color: "ffffff",
        default: false,
        description: "F",
        id: 6,
        name: "f",
        url: `${endpoint}/f`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          },
          // Change color
          {
            color: "#ababab",
            description: "B",
            name: "b"
          },
          // Change description
          {
            color: "#cccccc",
            description: "CC",
            name: "c"
          },
          // Should create new
          {
            color: "#eeeeee",
            description: "E",
            name: "e"
          },
          // Should create new without `#` in color
          {
            color: "ffffff",
            description: "F",
            name: "f"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - color", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "a",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "bbbbbb",
        default: false,
        description: "A",
        id: 1,
        name: "a",
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#bbbbbb",
            description: "A",
            name: "a"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - description", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "a",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "Description",
        id: 1,
        name: "a",
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "Description",
            name: "a"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - description (1)", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "Description",
        id: 1,
        name: "a",
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            name: "a"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - priority (integer)", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "a",
          id: 1,
          name: "a",
          priority: 10,
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "Description",
        id: 1,
        name: "a",
        priority: 20,
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "Description",
            name: "a",
            priority: 20
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - priority (string)", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "a",
          id: 1,
          name: "a",
          priority: 10,
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "Description",
        id: 1,
        name: "a",
        priority: 20,
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "Description",
            name: "a",
            priority: "20"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success update label - priority (server doesn't contain field)", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "a",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "Description",
        id: 1,
        name: "a",
        priority: 20,
        url: `${endpoint}/a`
      });

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "Description",
            name: "a",
            priority: 20
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success change labels with `configFile` option", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "fff",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        },
        {
          color: "fff",
          default: false,
          description: "B",
          id: 2,
          name: "b",
          url: `${endpoint}/b`
        }
      ])
      .patch(`${endpointPart}/a`)
      .reply(200, {
        color: "aaaaaa",
        default: false,
        description: "a",
        id: 1,
        name: "a",
        url: `${endpoint}/a`
      })
      .patch(`${endpointPart}/b`)
      .reply(200, {
        color: "bbbbbb",
        default: false,
        description: "b",
        id: 2,
        name: "b",
        url: `${endpoint}/b`
      });

    return expect(
      labelify({
        configFile: path.join(__dirname, "fixtures/custom-config.js")
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success change labels with `overlap` options", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        },
        {
          color: "bbbbbb",
          default: false,
          description: "b",
          id: 2,
          name: "b",
          url: `${endpoint}/b`
        }
      ])
      .delete(`${endpointPart}/b`)
      .reply(204, "");

    return expect(
      labelify({
        config: {
          overlap: true,
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should prefer config from call instead config file", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        },
        {
          color: "bbbbbb",
          default: false,
          description: "b",
          id: 2,
          name: "b",
          url: `${endpoint}/b`
        }
      ])
      .delete(`${endpointPart}/b`)
      .reply(204, "");

    return expect(
      labelify({
        config: {
          overlap: true,
          token: "other_unknown_token"
        },
        configFile: path.join(__dirname, "fixtures/overlap-config.js")
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success support custom api", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            create(config, label) {
              return Promise.resolve(label);
            },
            list() {
              return [
                {
                  color: "#aaaaaa",
                  description: "a",
                  name: "a"
                },
                {
                  color: "#bbbbbb",
                  description: "b",
                  name: "b"
                },
                {
                  color: "#aaaaaa",
                  description: "c",
                  name: "c"
                }
              ];
            },
            remove(config, label) {
              return Promise.resolve(label);
            },
            update(config, label) {
              return Promise.resolve(label);
            }
          },
          overlap: true
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          },
          {
            color: "#bbbbbb",
            description: "b",
            name: "b"
          },
          {
            color: "#dddddd",
            description: "d",
            name: "d"
          }
        ]
      })
    ).resolves.toMatchSnapshot();
  });

  it("should throw the error when options are empty", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(os.tmpdir());

    return expect(
      labelify().catch(error => {
        process.chdir(oldProcessCwd);

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when api error occurred - 'list' api call", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            list() {
              return null;
            }
          }
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when api error occurred - 'list' api call (1)", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            list() {
              throw new Error("API server problem");
            }
          }
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when api error occurred - 'create' api call", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            create() {
              throw new Error("API server problem");
            },
            list() {
              return [];
            }
          }
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when api error occurred - 'remove' api call", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            list() {
              return [
                {
                  color: "#aaaaaa",
                  description: "A",
                  name: "a"
                },
                {
                  color: "#bbbbbb",
                  description: "B",
                  name: "b"
                }
              ];
            },
            remove() {
              throw new Error("API server problem");
            }
          },
          overlap: true
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "A",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when api error occurred - 'update' api call", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          api: {
            list() {
              return [
                {
                  color: "#aaaaaa",
                  description: "A",
                  name: "a"
                }
              ];
            },
            update() {
              throw new Error("API server problem");
            }
          },
          overlap: true
        },
        labels: [
          {
            color: "#aaaaaa",
            description: "a",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw error when label without name", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ]);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when label without color", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ]);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when label has invalid hex", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ]);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#invalid",
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when label has priority hex", () => {
    expect.assertions(1);

    const url = "https://api.github.com";
    const projectID = "itgalaxy/labelify";
    const endpointPart = `/repos/${projectID}/labels`;
    const endpoint = `${url}${endpointPart}`;

    nock(url)
      .get(endpointPart)
      .reply(200, [
        {
          color: "aaaaaa",
          default: false,
          description: "A",
          id: 1,
          name: "a",
          url: `${endpoint}/a`
        }
      ]);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            color: "#aaaaaa",
            name: "a",
            priority: -10
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error without token", () =>
    expect(
      labelify({
        labels: [
          {
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot());

  it("should throw the error on empty labels", () =>
    expect(
      labelify({
        configFile: path.join(__dirname, "fixtures/empty-labels-config.js"),
        labels: []
      })
    ).rejects.toThrowErrorMatchingSnapshot());

  it("should throw the error on duplicate labels", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            name: "a"
          },
          {
            name: "a"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error on duplicate labels (2)", () => {
    expect.assertions(1);

    return expect(
      labelify({
        config: {
          token: "unknown_token"
        },
        labels: [
          {
            name: "a"
          },
          {
            name: "a"
          },
          {
            name: "b"
          },
          {
            name: "b"
          }
        ]
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
