"use strict";

const fs = require("fs");
const path = require("path");
const url = require("url");
const cosmiconfig = require("cosmiconfig");
const got = require("got");
const pkgUp = require("pkg-up");
const hostedGitInfo = require("hosted-git-info");
const resolveFrom = require("resolve-from");

const pkg = require("../../package.json");
const hexRegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
const protocolToRepresentationMap = {
  "git+ssh": "sshurl",
  "git+https": "https",
  ssh: "sshurl",
  git: "git"
};

function request(endpoint, options) {
  return got(endpoint, options);
}

function buildGotOptions(options = {}) {
  if (!options.headers) {
    options.headers = {};
  }

  options.headers["user-agent"] = `labelify/${
    pkg.version
  } (https://github.com/itgalaxy/labelify)`;

  return options;
}

function getLinks(link) {
  const links = {};

  // link format:
  // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
  link.replace(/<([^>]*)>;\s*rel="([\w]*)"/g, (m, uri, type) => {
    links[type] = uri;
  });

  return links;
}

function getModulePath(basedir, lookup) {
  let modulePath = resolveFrom.silent(basedir, lookup);

  if (!modulePath) {
    modulePath = resolveFrom.silent(process.cwd(), lookup);
  }

  if (!modulePath) {
    throw new Error(
      `Could not find "${lookup}" extends. Do you need a \`configBasedir\`?`
    );
  }

  return modulePath;
}

function parseGitUrl(giturl) {
  if (typeof giturl !== "string") {
    // eslint-disable-next-line no-param-reassign
    giturl = String(giturl);
  }

  const matched = giturl.match(
    /^([^@]+)@([^:/]+):[/]?((?:[^/]+[/])?[^/]+?)(?:[.]git)?(#.*)?$/
  );

  if (!matched) {
    // eslint-disable-next-line node/no-deprecated-api
    return url.parse(giturl);
  }

  return {
    protocol: "git+ssh:",
    slashes: true,
    auth: matched[1],
    host: matched[2],
    port: null,
    hostname: matched[2],
    hash: matched[4],
    search: null,
    query: null,
    pathname: `/${matched[3]}`,
    path: `/${matched[3]}`,
    href: `git+ssh://${matched[1]}@${matched[2]}/${matched[3]}${matched[4] ||
      ""}`
  };
}

function protocolToRepresentation(protocol) {
  if (protocol.substr(-1) === ":") {
    // eslint-disable-next-line no-param-reassign
    protocol = protocol.slice(0, -1);
  }

  return protocolToRepresentationMap[protocol] || protocol;
}

function getPlatformAndEndpoint(repositoryURL, options = {}) {
  const info = hostedGitInfo.fromUrl(repositoryURL);

  const platform = options.platform ? options.platform : info && info.type;

  if (!platform) {
    throw new Error(
      `Can't resolve your platform. Please use 'platform' options or add 'repository' field to 'package.json'`
    );
  }

  // The variable `info` is undefined when it is self-hosted URL.
  const isSelfHosted = !info;

  let endpoint = options.endpoint ? options.endpoint : null;

  if (endpoint) {
    return {
      endpoint,
      isSelfHosted,
      platform
    };
  }

  let protocol = null;
  let host = null;
  let user = null;
  let project = null;

  if (isSelfHosted) {
    const parsedRepositoryURL = parseGitUrl(repositoryURL);
    const matched = parsedRepositoryURL.path.match(
      /^[/]([^/]+)[/]([^/]+?)(?:[.]git|[/])?$/
    );

    const defaultProtocolRepresentation = protocolToRepresentation(
      parsedRepositoryURL.protocol
    );

    protocol = /https?/.test(defaultProtocolRepresentation)
      ? defaultProtocolRepresentation
      : "https";
    ({ host } = parsedRepositoryURL);

    if (matched && matched[1] !== null) {
      user = decodeURIComponent(matched[1].replace(/^:/, ""));
    } else {
      throw new Error(
        `Can't resolve 'user' from 'repository' field in 'package.json'. Please correct 'repository' field.`
      );
    }

    if (matched && matched[2]) {
      project = decodeURIComponent(matched[2]);
    } else {
      throw new Error(
        `Can't resolve 'project' from 'repository' field in 'package.json'. Please correct 'repository' field.`
      );
    }
  } else {
    ({ default: protocol, domain: host, user, project } = info);
  }

  switch (platform) {
    case "github":
      if (isSelfHosted) {
        endpoint = `${protocol}://${host}/repos/${user}/${project}/labels`;
      } else {
        endpoint = `https://api.github.com/repos/${user}/${project}/labels`;
      }

      break;
    case "gitlab":
      if (isSelfHosted) {
        endpoint = `${protocol}://${host}/api/v4/projects/${user}%2F${project}/labels`;
      } else {
        endpoint = `https://gitlab.com/api/v4/projects/${user}%2F${project}/labels`;
      }

      break;
    default:
      throw new Error(
        isSelfHosted
          ? "Looks you use self host platform, please use 'platform' options"
          : `Unsupported '${platform}' platform`
      );
  }

  return {
    endpoint,
    isSelfHosted,
    platform
  };
}

function resolveRepositoryURL() {
  return Promise.resolve()
    .then(() => pkgUp())
    .then(
      filePath =>
        new Promise((resolve, reject) => {
          if (!filePath) {
            throw new Error(
              "Can't find 'package.json'. Please use 'platform' and 'endpoint' options"
            );
          }

          fs.readFile(filePath, (error, data) => {
            if (error) {
              return reject(error);
            }

            return resolve(JSON.parse(data.toString()));
          });
        })
    )
    .then(pj => {
      const { repository } = pj;

      if (!repository) {
        throw new Error(
          "Can't find 'repository' field in 'package.json'. Please use 'platform' and 'endpoint' options"
        );
      }

      let repositoryURL = null;

      if (typeof repository === "string") {
        repositoryURL = repository;
      } else {
        repositoryURL = repository.url;
      }

      if (!repositoryURL) {
        throw new Error(
          "Field 'repository' in 'package.json' contain invalid value"
        );
      }

      return repositoryURL;
    });
}

function getProjectMeta(options = {}) {
  if (options.platform && options.endpoint) {
    return Promise.resolve({
      endpoint: options.endpoint,
      platform: options.platform
    });
  }

  return Promise.resolve()
    .then(() => resolveRepositoryURL())
    .then(repositoryURL => getPlatformAndEndpoint(repositoryURL, options));
}

function getToken() {
  return (
    process.env.TOKEN || process.env.GITHUB_TOKEN || process.env.GITLAB_TOKEN
  );
}

function linkWalker(requestedURL, options = {}, list = []) {
  return request(requestedURL, options).then(response => {
    // eslint-disable-next-line no-param-reassign
    list = list.concat(response.body);

    if (response.headers && response.headers.link) {
      const links = getLinks(response.headers.link);

      if (links.next) {
        return linkWalker(links.next, options, list);
      }
    }

    return list;
  });
}

function mergeConfigs(originConfig, extendedConfig) {
  const labelsMerger = {};

  if (originConfig.labels || extendedConfig.labels) {
    labelsMerger.labels = [];

    if (originConfig.labels) {
      labelsMerger.labels = labelsMerger.labels.concat(originConfig.labels);
    }

    if (extendedConfig.labels) {
      labelsMerger.labels = labelsMerger.labels.concat(extendedConfig.labels);
    }
  }

  return Object.assign({}, originConfig, extendedConfig, labelsMerger);
}

function augmentConfigExtended(cosmiconfigResultArg) {
  const cosmiconfigResult = cosmiconfigResultArg;

  if (!cosmiconfigResult) {
    return Promise.resolve(null);
  }

  return Promise.resolve()
    .then(() =>
      // eslint-disable-next-line no-use-before-define
      extendConfig(
        cosmiconfigResult.config,
        path.dirname(cosmiconfigResult.filepath || "")
      )
    )
    .then(augmentedConfig => ({
      config: augmentedConfig,
      filepath: cosmiconfigResult.filepath
    }));
}

function loadExtendedConfig(config, configDir, extendLookup) {
  const extendPath = getModulePath(configDir, extendLookup);

  return cosmiconfig(null, {
    transform: (...args) => augmentConfigExtended(...args)
  }).load(extendPath);
}

function extendConfig(config, configDir) {
  if (typeof config.extends === "undefined") {
    return Promise.resolve(config);
  }

  const normalizedExtends = Array.isArray(config.extends)
    ? config.extends
    : [config.extends];

  const { extends: extendsProp, ...originalWithoutExtends } = config;

  const loadExtends = normalizedExtends.reduce(
    (resultPromise, extendLookup) =>
      resultPromise.then(resultConfig =>
        loadExtendedConfig(resultConfig, configDir, extendLookup).then(
          extendResult => {
            if (!extendResult) {
              return resultConfig;
            }

            return mergeConfigs(resultConfig, extendResult.config);
          }
        )
      ),
    Promise.resolve(originalWithoutExtends)
  );

  return loadExtends.then(resultConfig => {
    const {
      // eslint-disable-next-line no-shadow
      extends: extendsProp,
      labels,
      ...originalWithoutLabelsAndExtends
    } = config;

    return mergeConfigs(resultConfig, originalWithoutLabelsAndExtends);
  });
}

function augmentConfigFull(cosmiconfigResultArg, options) {
  const cosmiconfigResult = cosmiconfigResultArg; // Lock in for Flow

  if (!cosmiconfigResult) {
    return Promise.resolve(null);
  }

  const { config, filepath } = cosmiconfigResult;
  const configDir = options.configBasedir || path.dirname(filepath || "");

  return Promise.resolve()
    .then(() => extendConfig(config, configDir))
    .then(augmentedConfig => ({
      config: augmentedConfig,
      filepath: cosmiconfigResult.filepath
    }));
}

function loadConfig(options = {}) {
  let configPath = null;
  let searchPath = process.cwd();

  if (options.configFile) {
    configPath = path.resolve(process.cwd(), options.configFile);
    searchPath = null;
  }

  const configExplorer = cosmiconfig("labelify");
  const searchForConfig = configPath
    ? configExplorer.load(configPath)
    : configExplorer.search(searchPath);

  return Promise.resolve()
    .then(() => searchForConfig)
    .then(cosmiconfigResultArg =>
      augmentConfigFull(cosmiconfigResultArg, options)
    );
}

module.exports = {
  buildGotOptions,
  getLinks,
  getModulePath,
  getPlatformAndEndpoint,
  getProjectMeta,
  getToken,
  hexRegExp,
  linkWalker,
  loadConfig,
  request,
  resolveRepositoryURL
};
