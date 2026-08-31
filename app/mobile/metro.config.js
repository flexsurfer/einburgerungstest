const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const appRoot = __dirname;
const monorepoRoot = path.resolve(appRoot, '../../');
const sharedPath = path.resolve(appRoot, '../../packages/shared/src');
const sharedNodeModules = path.resolve(
  appRoot,
  '../../packages/shared/node_modules',
);
const rootNodeModules = path.resolve(appRoot, '../../node_modules');

const config = {
  // Shared UI assets live outside app/mobile. Using the workspace as Metro's
  // root prevents invalid asset URLs such as /assets/../../packages/...
  projectRoot: monorepoRoot,
  resetCache: true,
  watchFolders: [appRoot, rootNodeModules],
  resolver: {
    // TypeScript source uses emitted-style `.js` specifiers. Metro does not
    // resolve an explicit `.js` suffix to the corresponding `.ts` file, so
    // let its normal platform/source-extension ordering handle those imports.
    resolveRequest: (context, moduleName, platform) => {
      const normalizedModuleName =
        moduleName.startsWith('.') && moduleName.endsWith('.js')
          ? moduleName.slice(0, -3)
          : moduleName;

      return context.resolveRequest(
        context,
        normalizedModuleName,
        platform,
      );
    },
    extraNodeModules: new Proxy(
      {},
      {
        get: (_, name) => {
          if (name === '@ebtest/shared') return sharedPath;
          if (name === '@ukladjs/core' || name === '@ukladjs/persist') {
            return path.join(sharedNodeModules, name);
          }
          return path.join(rootNodeModules, name);
        },
      },
    ),
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
