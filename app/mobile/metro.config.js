const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../');
const sharedPath = path.resolve(projectRoot, '../../packages/shared/src');
const rootNodeModules = path.resolve(projectRoot, '../../node_modules');

const config = {
  projectRoot: projectRoot,
  resetCache: true,
  watchFolders: [
    monorepoRoot,
    rootNodeModules
  ],
  resolver: {
    extraNodeModules: new Proxy({}, {
      get: (_, name) => {
        if (name === 'shared') return sharedPath;
        return path.join(rootNodeModules, name);
      }
    }),
    platforms: ['ios', 'android', 'native', 'web'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'],
    nodeModulesPaths: [rootNodeModules],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
