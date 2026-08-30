const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");
const sharedNodeModules = path.resolve(
  workspaceRoot,
  "packages/shared/node_modules",
);
const sharedSource = path.resolve(workspaceRoot, "packages/shared/src");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // TypeScript source uses emitted-style `.js` specifiers. Metro does not
  // resolve an explicit `.js` suffix to the corresponding `.ts` file, so
  // let its normal platform/source-extension ordering handle those imports.
  const normalizedModuleName =
    moduleName.startsWith(".") && moduleName.endsWith(".js")
      ? moduleName.slice(0, -3)
      : moduleName;

  return context.resolveRequest(context, normalizedModuleName, platform);
};
config.resolver.extraNodeModules = {
  "@ebtest/shared": sharedSource,
  "@ukladjs/core": path.resolve(sharedNodeModules, "@ukladjs/core"),
  "@ukladjs/persist": path.resolve(sharedNodeModules, "@ukladjs/persist"),
  "@react-native-async-storage/async-storage": path.resolve(
    projectRoot,
    "node_modules/@react-native-async-storage/async-storage",
  ),
  react: path.resolve(projectRoot, "node_modules/react"),
  "react-native": path.resolve(projectRoot, "node_modules/react-native"),
  "react-native-safe-area-context": path.resolve(
    projectRoot,
    "node_modules/react-native-safe-area-context",
  ),
  "react-native-svg": path.resolve(
    projectRoot,
    "node_modules/react-native-svg",
  ),
};

module.exports = config;
