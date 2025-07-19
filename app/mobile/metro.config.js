const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedPath = path.resolve(projectRoot, '../../packages/shared/src');
const rootNodeModules = path.resolve(projectRoot, '../../node_modules');

const config = {
  watchFolders: [
    path.resolve(projectRoot, '../../packages/shared'),
    rootNodeModules
  ],
  resolver: {
    extraNodeModules: new Proxy({}, {
      get: (_, name) => {
        if (name === 'shared') return sharedPath;
        return path.join(rootNodeModules, name);
      }
    })
  }
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
