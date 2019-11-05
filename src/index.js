"use strict";

const apiResolver = require("./lib/api");
const utils = require("./lib/utils");

const { getToken, getProjectMeta, loadConfig, hexRegExp } = utils;

function labelify(options = {}) {
  let { labels = [], config = {} } = options;

  return Promise.resolve()
    .then(() => {
      const configLoader = Promise.resolve();

      if (Object.keys(labels).length === 0 || options.configFile) {
        return configLoader.then(() =>
          loadConfig({
            configFile: options.configFile
          }).then(loadedConfig => {
            if (!loadedConfig) {
              return {};
            }

            const loadedConfigValues = loadedConfig.config;

            if (loadedConfigValues.labels) {
              ({ labels } = loadedConfig.config);
            }

            if (loadedConfigValues.config) {
              config = Object.assign({}, loadedConfigValues.config, config);
            }

            return loadedConfig;
          })
        );
      }

      return configLoader;
    })
    .then(() => {
      if (labels.length === 0) {
        throw new Error("You should have more than 0 labels");
      }

      if (!config.token) {
        config.token = getToken();
      }

      if (!config.token && !config.api) {
        throw new Error("Token is required");
      }

      // eslint-disable-next-line promise/no-return-wrap
      return Promise.resolve();
    })
    .then(() => {
      if (!config.api) {
        return getProjectMeta(config).then(meta => {
          config.platform = meta.platform;
          config.endpoint = meta.endpoint;
          config.api = apiResolver(config.platform);

          return config;
        });
      }

      return config;
    })
    .then(() => {
      const duplicateLabels = labels.filter(
        (s1, pos, arr) => arr.findIndex(s2 => s2.name === s1.name) !== pos
      );

      if (duplicateLabels.length > 0) {
        const duplicateLabelsString = duplicateLabels.reduce(
          (previousValue, currentValue, index) =>
            `${previousValue}${index !== 0 ? "," : ""} "${currentValue.name}"`,
          ""
        );

        throw new Error(`Found duplicate ${duplicateLabelsString} label(s)`);
      }

      return Promise.resolve()
        .then(() => config.api.list(config))
        .then(existingLabels => {
          const requests = [];
          const skipToOverlap = [];
          const added = [];
          const removed = [];
          const updated = [];

          if (!existingLabels) {
            throw new Error("API server doesn't return list of labels");
          }

          labels.forEach(label => {
            const pickedLabel = existingLabels.find(
              existingLabel => existingLabel.name === label.name
            );

            if (!label.name) {
              throw new Error("Name is required for label");
            }

            if (!label.color) {
              throw new Error(`Color is required for "${label.name}" label`);
            }

            if (!label.color.startsWith("#")) {
              label.color = `#${label.color}`;
            }

            if (!hexRegExp.test(label.color)) {
              throw new Error(`Invalid hex value for "${label.name}" label`);
            }

            if (label.priority && label.priority < 0) {
              throw new Error(
                `Priority for "${label.name}" label must be equal 0 or greater`
              );
            }

            if (!pickedLabel) {
              requests.push(
                config.api.create(config, label).then(responseBody => {
                  added.push(responseBody);

                  return responseBody;
                })
              );

              return;
            }

            skipToOverlap.push(label.name);

            if (!pickedLabel.color.startsWith("#")) {
              pickedLabel.color = `#${pickedLabel.color}`;
            }

            const needUpdate =
              label.color !== pickedLabel.color ||
              (label.description || "") !== (pickedLabel.description || "") ||
              (label.priority ? parseInt(label.priority, 10) : null) !==
                (pickedLabel.priority
                  ? parseInt(pickedLabel.priority, 10)
                  : null);

            if (!needUpdate) {
              return;
            }

            requests.push(
              config.api.update(config, label).then(response => {
                updated.push(response);

                return response;
              })
            );
          });

          if (config.overlap) {
            existingLabels
              .filter(
                existingLabel => !skipToOverlap.includes(existingLabel.name)
              )
              .forEach(existingLabel => {
                requests.push(
                  config.api.remove(config, existingLabel).then(response => {
                    removed.push(existingLabel);

                    return response;
                  })
                );
              });
          }

          return Promise.all(requests).then(() => ({
            added,
            removed,
            updated
          }));
        });
    });
}

module.exports = labelify;
