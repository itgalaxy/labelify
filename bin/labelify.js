"use strict";

// eslint-disable-next-line node/no-unpublished-require
const labelify = require("../src");
const meow = require("meow");
const path = require("path");
const resolveFrom = require("resolve-from");

const pkg = require("../package");

const meowOptions = {
  autoHelp: false,
  autoVersion: false,
  flags: {
    config: {
      default: false,
      type: "string"
    },
    "config-basedir": {
      type: "string"
    },
    endpoint: {
      alias: "e",
      type: "string"
    },
    help: {
      alias: "h",
      type: "boolean"
    },
    overlap: {
      alias: "o",
      type: "boolean"
    },
    platform: {
      alias: "p",
      type: "string"
    },
    version: {
      alias: "v",
      type: "boolean"
    }
  },
  help: `
    Usage: labelify [options]
    
    Options:
      --config
        Path to a specific configuration file (JSON, YAML, or CommonJS), or the
        name of a module in node_modules that points to one. If no --config
        argument is provided, "labelify" will search for configuration files in
        the following places, in this order:
          - a labelify property in package.json
          - a .labelify file (with or without filename extension:
            .json, .yaml, .yml, and .js are available)
          - a labelify.config.js file exporting a JS object
        The search will begin in the working directory and move up the directory
        tree until a configuration file is found.
        
      --config-basedir
        An absolute path to the directory that relative paths defining "extends"
        are *relative to*. Only necessary if these values are relative paths.
        
      --overlap, -o
        Removes all labels which are not in configuration from the repository.

      --platform, -p
        Type of platform where your store repository.
        Use platform option only when you have self hosted solution.
        
      --endpoint, -e
        Endpoint for your API.
        Use endpoint option only when you have nonstandard API URL fro your platform.

      --version, -v
        Show the currently installed version of labelify.
  `,
  pkg
};
const optionsBase = {
  config: {}
};

const cli = meow(meowOptions);

if (cli.flags.config) {
  // Should check these possibilities:
  //   a. name of a node_module
  //   b. absolute path
  //   c. relative path relative to `process.cwd()`.
  // If none of the above work, we'll try a relative path starting
  // in `process.cwd()`.
  optionsBase.configFile =
    resolveFrom.silent(process.cwd(), cli.flags.config) ||
    path.join(process.cwd(), cli.flags.config);
}

if (cli.flags.configBasedir) {
  optionsBase.configBasedir = path.isAbsolute(cli.flags.configBasedir)
    ? cli.flags.configBasedir
    : path.resolve(process.cwd(), cli.flags.configBasedir);
}

if (cli.flags.help || cli.flags.h) {
  cli.showHelp(0);

  return;
}

if (cli.flags.version || cli.flags.v) {
  cli.showVersion();

  return;
}

if (cli.flags.overlap) {
  optionsBase.config.overlap = true;
}

if (cli.flags.platform) {
  optionsBase.config.platform = cli.flags.platform;
}

if (cli.flags.endpoint) {
  optionsBase.config.endpoint = cli.flags.endpoint;
}

Promise.resolve()
  .then(() => labelify(optionsBase))
  .then(result => {
    const { added, removed, updated } = result;

    if (added.length === 0 && updated.length === 0 && removed.length === 0) {
      process.stdout.write("No labels have changed.\n");

      return result;
    }

    if (added.length > 0) {
      process.stdout.write("Created labels:\n");

      added.forEach(label => {
        process.stdout.write(`  - ${label.name}\n`);
      });
    }

    if (updated.length > 0) {
      process.stdout.write("Updated labels:\n");

      updated.forEach(label => {
        process.stdout.write(`  - ${label.name}\n`);
      });
    }

    if (removed.length > 0) {
      process.stdout.write("Removed labels:\n");

      removed.forEach(label => {
        process.stdout.write(`  - ${label.name}\n`);
      });
    }

    return result;
  })
  .catch(error => {
    console.log(error.stack); // eslint-disable-line no-console

    const exitCode = typeof error.code === "number" ? error.code : 1;

    process.exit(exitCode); // eslint-disable-line no-process-exit
  });
