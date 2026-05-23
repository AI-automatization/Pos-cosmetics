const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;

const MOBILE_NODE_MODULES = path.resolve(projectRoot, 'node_modules');

// pnpm monorepo: deduplicate React + react-native to app-local versions
config.resolver.extraNodeModules = {
  'react':                 path.resolve(MOBILE_NODE_MODULES, 'react'),
  'react-native':          path.resolve(MOBILE_NODE_MODULES, 'react-native'),
  'react/jsx-runtime':     path.resolve(MOBILE_NODE_MODULES, 'react', 'jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(MOBILE_NODE_MODULES, 'react', 'jsx-dev-runtime'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // pnpm fix: AppEntry.js tries `../../App` from virtual store path
  if (moduleName === '../../App') {
    return {
      filePath: path.resolve(projectRoot, 'src/App.tsx'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
