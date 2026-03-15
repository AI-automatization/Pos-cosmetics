const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Force Metro to use compiled CommonJS output for react-native-screens
// to avoid TypeScript codegen errors in Fabric components
config.resolver = config.resolver || {};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-screens' || moduleName.startsWith('react-native-screens/')) {
    const subPath = moduleName.replace('react-native-screens', '');
    const resolved = path.resolve(
      projectRoot,
      'node_modules/react-native-screens/lib/commonjs',
      subPath ? subPath.replace(/^\//, '') : 'index.js',
    );
    try {
      require.resolve(resolved);
      return { filePath: resolved, type: 'sourceFile' };
    } catch {
      // fallback
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

// Strip 'multipart/mixed' Accept header from bundle requests so Metro serves
// a plain JS bundle instead of a multipart delta bundle.
// This fixes the MultipartStreamReader ProtocolException on Windows in RN 0.83
// where CRLF multipart boundaries cause "Expected leading [0-9a-fA-F]" crash.
config.server = config.server || {};
const _enhance = config.server.enhanceMiddleware;
config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  const mid = _enhance ? _enhance(metroMiddleware, metroServer) : metroMiddleware;
  return (req, res, next) => {
    if (req.headers && req.headers.accept) {
      req.headers.accept = req.headers.accept
        .replace(/multipart\/mixed\s*,?\s*/g, '')
        .trim() || 'application/javascript';
    }
    return mid(req, res, next);
  };
};

module.exports = config;
