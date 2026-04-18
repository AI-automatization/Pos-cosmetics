const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;

// pnpm fix: root node_modules/@expo/vector-icons → expo@55 (wrong for this expo@54 app).
// Force resolution from the expo@54-compatible pnpm store entry.
const EXPO54_PNPM_MODULES = path.resolve(
  monorepoRoot,
  'node_modules/.pnpm/@expo+vector-icons@15.1.1_expo-font@14.0.11_expo@54.0.33_react-native@0.81.5_@babel+cor_578ada966b57244f0fb5b55de8754f09/node_modules',
);

// pnpm fix: force single React instance via extraNodeModules (direct alias, highest priority)
// resolveRequest couldn't override symlink-local resolution inside pnpm virtual store.
// extraNodeModules creates hard aliases that Metro applies before ANY path resolution.
const MOBILE_NODE_MODULES = path.resolve(projectRoot, 'node_modules');
const EXPO_MODULES_CORE_V3 = path.resolve(
  monorepoRoot,
  'node_modules/.pnpm/expo-modules-core@3.0.29_react-native@0.81.5_@babel+core@7.29.0_@types+react@19.1.17_react@19.1.0__react@19.1.0/node_modules/expo-modules-core',
);

// Deduplicate React + expo-modules-core (native build uses v3 for rn@0.81.5)
config.resolver.extraNodeModules = {
  'react':                 path.resolve(MOBILE_NODE_MODULES, 'react'),
  'react-native':          path.resolve(MOBILE_NODE_MODULES, 'react-native'),
  'react/jsx-runtime':     path.resolve(MOBILE_NODE_MODULES, 'react', 'jsx-runtime'),
  'react/jsx-dev-runtime': path.resolve(MOBILE_NODE_MODULES, 'react', 'jsx-dev-runtime'),
  'expo-modules-core':     EXPO_MODULES_CORE_V3,
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // For @expo/vector-icons, resolve from the expo@54-compatible pnpm entry first
  if (moduleName === '@expo/vector-icons' || moduleName.startsWith('@expo/vector-icons/')) {
    return context.resolveRequest(
      { ...context, nodeModulesPaths: [EXPO54_PNPM_MODULES, ...context.nodeModulesPaths] },
      moduleName,
      platform,
    );
  }
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
