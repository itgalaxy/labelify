"use strict";

const os = require("os");
const path = require("path");
const nock = require("nock");
const utils = require("../utils");
const pkg = require("../../../package");

const {
  buildGotOptions,
  hexRegExp,
  request,
  getLinks,
  getPlatformAndEndpoint,
  getModulePath,
  getToken,
  linkWalker,
  getProjectMeta,
  resolveRepositoryURL,
  loadConfig
} = utils;

const fixturesDir = path.resolve(__dirname, "fixtures");
const configsDir = path.join(fixturesDir, "configs");

describe("utils", () => {
  it("should success execute request", () => {
    expect.assertions(1);

    nock("https://labelify.com")
      .get("/")
      .reply(200, "Hello world!");

    return request("https://labelify.com", {}).then(result => {
      expect(result.body).toBe("Hello world!");

      return result;
    });
  });

  it("should success build got options", () => {
    expect.assertions(5);

    expect(buildGotOptions()).toEqual({
      headers: {
        "user-agent": `labelify/${pkg.version} (https://github.com/itgalaxy/labelify)`
      }
    });

    expect(buildGotOptions({})).toEqual({
      headers: {
        "user-agent": `labelify/${pkg.version} (https://github.com/itgalaxy/labelify)`
      }
    });

    expect(buildGotOptions({ foo: "bar" })).toEqual({
      foo: "bar",
      headers: {
        "user-agent": `labelify/${pkg.version} (https://github.com/itgalaxy/labelify)`
      }
    });

    expect(buildGotOptions({ headers: {} })).toEqual({
      headers: {
        "user-agent": `labelify/${pkg.version} (https://github.com/itgalaxy/labelify)`
      }
    });

    expect(buildGotOptions({ headers: { foo: "bar" } })).toEqual({
      headers: {
        foo: "bar",
        "user-agent": `labelify/${pkg.version} (https://github.com/itgalaxy/labelify)`
      }
    });
  });

  it("should success get links", () => {
    expect.assertions(2);

    expect(getLinks("")).toMatchSnapshot();
    expect(
      getLinks(
        '<https://api.github.com/repositories/131302483/labels?page=2>; rel="next", ' +
          '<https://api.github.com/repositories/131302483/labels?page=2>; rel="last"\n' +
          '<https://api.github.com/repositories/131302483/labels?page=1>; rel="prev", ' +
          '<https://api.github.com/repositories/131302483/labels?page=1>; rel="first"'
      )
    ).toMatchSnapshot();
  });

  it("should success get module path", () => {
    expect.assertions(3);

    expect(
      path.relative(process.cwd(), getModulePath("not-exists", "resolve-from"))
    ).toMatchSnapshot();
    expect(
      path.relative(
        process.cwd(),
        getModulePath("node_modules", "resolve-from")
      )
    ).toMatchSnapshot();
    expect(() => getModulePath("foo", "bar")).toThrowErrorMatchingSnapshot();
  });

  it("should success get platform and endpoint for github", () =>
    expect(
      getPlatformAndEndpoint("https://github.com/itgalaxy/labelify.git")
    ).toMatchSnapshot());

  it("should success get platform and endpoint for github (git)", () =>
    expect(
      getPlatformAndEndpoint("git+https://github.com/111/222.git")
    ).toMatchSnapshot());

  it("should success get platform and endpoint for github (git shortcut)", () =>
    expect(getPlatformAndEndpoint("github:111/222")).toMatchSnapshot());

  it("should success get platform and endpoint for gitlab", () =>
    expect(
      getPlatformAndEndpoint("https://gitlab.com/itgalaxy/labelify.git")
    ).toMatchSnapshot());

  it("should success get platform and endpoint for gitlab (git shortcut)", () =>
    expect(getPlatformAndEndpoint("gitlab:111/222")).toMatchSnapshot());

  it("should success get platform and endpoint for github (self-hosted)", () =>
    expect(
      getPlatformAndEndpoint(
        "https://github.yourcompany.com/itgalaxy/labelify.git",
        {
          platform: "github"
        }
      )
    ).toMatchSnapshot());

  it("should success get platform and endpoint for github (self-hosted with nonstandard protocol)", () =>
    expect(
      getPlatformAndEndpoint("ssh://git@mydomain.com/abc/def", {
        platform: "github"
      })
    ).toMatchSnapshot());

  it("should success get platform and endpoint for gitlab (self-hosted)", () =>
    expect(
      getPlatformAndEndpoint(
        "https://gitlab.company.com/itgalaxy/labelify.git",
        {
          platform: "gitlab"
        }
      )
    ).toMatchSnapshot());

  it("should success get platform and endpoint for gitlab (self-hosted with nonstandard protocol)", () =>
    expect(
      getPlatformAndEndpoint("ssh://git@mydomain.com/abc/def", {
        platform: "gitlab"
      })
    ).toMatchSnapshot());

  it("should success get platform and endpoint for custom platform and custom endpoint", () =>
    expect(
      getPlatformAndEndpoint(
        "https://my.custom.platform.com/itgalaxy/labelify.git",
        {
          endpoint: "https://my.custom.platform.com/custom/api/url",
          platform: "github"
        }
      )
    ).toMatchSnapshot());

  it("should success get platform and endpoint for custom platform and custom endpoint (2)", () =>
    expect(
      getPlatformAndEndpoint(
        "https://my.custom.platform.com/itgalaxy/labelify.git",
        {
          endpoint: "https://my.custom.platform.com/custom/api/url",
          platform: "gitlab"
        }
      )
    ).toMatchSnapshot());

  it("should success get platform and endpoint (shortcut syntax)", () =>
    expect(
      getPlatformAndEndpoint("github:itgalaxy/labelify")
    ).toMatchSnapshot());

  it("should throw error when repository URL doesn't contains user", () =>
    expect(() =>
      getPlatformAndEndpoint("https://gitlab.company.com", {
        platform: "gitlab"
      })
    ).toThrowErrorMatchingSnapshot());

  it("should throw error when repository URL doesn't contains project", () =>
    expect(() =>
      getPlatformAndEndpoint("https://gitlab.company.com/user", {
        platform: "gitlab"
      })
    ).toThrowErrorMatchingSnapshot());

  it("should throw error when repository URL is not passed", () =>
    expect(() => getPlatformAndEndpoint()).toThrowErrorMatchingSnapshot());

  it("should throw error when repository URL is not supported", () =>
    expect(() =>
      getPlatformAndEndpoint("https://v8.googlecode.com/svn/trunk/")
    ).toThrowErrorMatchingSnapshot());

  it("should throw error when repository URL is not supported (2)", () =>
    expect(() =>
      getPlatformAndEndpoint("bitbucket:user/repo")
    ).toThrowErrorMatchingSnapshot());

  it("should throw error when repository URL is self hosted platform without 'platform' option", () =>
    expect(() =>
      getPlatformAndEndpoint(
        "https://github.yourcompany.com/itgalaxy/labelify.git"
      )
    ).toThrowErrorMatchingSnapshot());

  it("should success resolve repository URL in package.json with string repository field", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(
      path.join(fixturesDir, "package-json-with-string-repository-field")
    );

    return expect(
      resolveRepositoryURL().then(repositoryURL => {
        process.chdir(oldProcessCwd);

        return repositoryURL;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success resolve repository URL in package.json with object repository field", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(
      path.join(fixturesDir, "package-json-with-object-repository-field")
    );

    return expect(
      resolveRepositoryURL().then(repositoryURL => {
        process.chdir(oldProcessCwd);

        return repositoryURL;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should throw the error when `package.json` don't have repository field", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(
      path.join(fixturesDir, "package-json-without-repository-field")
    );

    return expect(
      resolveRepositoryURL().catch(error => {
        process.chdir(oldProcessCwd);

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw the error when `package.json` contain broken repository object field", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(
      path.join(fixturesDir, "package-json-with-broken-object-repository-field")
    );

    return expect(
      resolveRepositoryURL().catch(error => {
        process.chdir(oldProcessCwd);

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw error when `package.json` doesn't found", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir("/tmp");

    return expect(
      resolveRepositoryURL().catch(error => {
        process.chdir(oldProcessCwd);

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should success get project meta", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(path.join(fixturesDir));

    return expect(
      getProjectMeta().then(projectMeta => {
        process.chdir(oldProcessCwd);

        return projectMeta;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success get project meta (2)", () => {
    expect.assertions(1);

    return expect(
      getProjectMeta({
        endpoint: "https://api.github.com/repos/itgalaxy/labelify/labels",
        platform: "github"
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success get token", () => {
    expect.assertions(4);

    expect(typeof getToken()).toBe("undefined");

    process.env.TOKEN = "TOKEN";

    expect(getToken()).toBe(process.env.TOKEN);

    delete process.env.TOKEN;

    process.env.GITHUB_TOKEN = "GITHUB_TOKEN";

    expect(getToken()).toBe(process.env.GITHUB_TOKEN);

    delete process.env.GITHUB_TOKEN;

    process.env.GITLAB_TOKEN = "GITLAB_TOKEN";

    expect(getToken()).toBe(process.env.GITLAB_TOKEN);

    delete process.env.GITLAB_TOKEN;
  });

  it("should success execute hex regexp", () => {
    expect.assertions(7);

    expect(hexRegExp.test("#fff")).toBe(true);
    expect(hexRegExp.test("#ffffff")).toBe(true);
    expect(hexRegExp.test("#FFF")).toBe(true);
    expect(hexRegExp.test("#FFFFFF")).toBe(true);
    expect(hexRegExp.test("FFFFFF")).toBe(false);
    expect(hexRegExp.test("#f")).toBe(false);
    expect(hexRegExp.test("#fffffff")).toBe(false);
  });

  it("should success walk on the links", () => {
    expect.assertions(1);

    const url = "https://labelify.com";

    nock(url)
      .get("/")
      .reply(200, "Page 1!", {
        link: `<${url}?page=2>; rel="next",
        <${url}?page=2>; rel="last"
        <${url}?page=1>; rel="prev",
        <${url}?page=1>; rel="first"`
      });

    nock(url)
      .get("/?page=2")
      .reply(200, "Page 2!", {
        link: `<${url}?page=2>; rel="last"
        <${url}?page=1>; rel="prev",
        <${url}?page=1>; rel="first"`
      });

    return expect(linkWalker(url)).resolves.toMatchSnapshot();
  });

  it("should success build config", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "simple");

    process.chdir(configDir);

    return expect(
      loadConfig().then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should return null when can't load config", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();

    process.chdir(os.tmpdir());

    return expect(
      loadConfig().then(config => {
        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config using 'configFile' option", () => {
    expect.assertions(1);

    const configDir = path.join(configsDir, "simple");

    return expect(
      loadConfig({
        configFile: path.join(configDir, "labelify.config.js")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config with package 'extends'", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "package-extends");

    process.chdir(configDir);

    return expect(
      loadConfig().then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config with package 'extends' and 'configFile' option", () => {
    expect.assertions(1);

    const configDir = path.join(configsDir, "package-extends");

    return expect(
      loadConfig({
        configFile: path.join(configDir, "labelify.config.js")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build with relative path 'extends'", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "relative-path-extends");

    process.chdir(configDir);

    return expect(
      loadConfig().then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build with absolute path 'extends'", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "absolute-path-extends");

    process.chdir(configDir);

    return expect(
      loadConfig().then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build with relative path 'extends' and 'configFile' option", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "relative-path-extends");

    process.chdir(configDir);

    return expect(
      loadConfig({
        configFile: path.join(configDir, "labelify.config.js")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build with absolute path 'extends' and 'configFile' option", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "absolute-path-extends");

    process.chdir(configDir);

    return expect(
      loadConfig({
        configFile: path.join(configDir, "labelify.config.js")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config with array of 'extends'", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "array-extends");

    process.chdir(configDir);

    return expect(
      loadConfig().then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config using 'configBase' option", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "config-base");

    process.chdir(configDir);

    return expect(
      loadConfig({
        configBasedir: path.join(configDir, "custom-directory")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should success build config using 'configFile' and 'configBase' options", () => {
    expect.assertions(1);

    const oldProcessCwd = process.cwd();
    const configDir = path.join(configsDir, "config-base");

    process.chdir(configDir);

    return expect(
      loadConfig({
        configBasedir: path.join(configDir, "custom-directory"),
        configFile: path.join(configDir, "labelify.config.js")
      }).then(config => {
        config.filepath = path.relative(process.cwd(), config.filepath);

        process.chdir(oldProcessCwd);

        return config;
      })
    ).resolves.toMatchSnapshot();
  });

  it("should throw error when config not found using `configFile` option", () => {
    expect.assertions(1);

    return expect(
      loadConfig({
        configFile: "not-found"
      }).catch(error => {
        error.message = error.message.replace(`${process.cwd()}/`, "");

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it("should throw error when extended config not found using `configFile` option", () => {
    expect.assertions(1);

    const configDir = path.join(configsDir, "config-base");

    return expect(
      loadConfig({
        configFile: path.join(configDir, "labelify.config.js")
      }).catch(error => {
        error.message = error.message.replace(`${process.cwd()}/`, "");

        throw error;
      })
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
