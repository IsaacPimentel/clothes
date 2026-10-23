const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb', 'gltf', 'bin');
// MediaPipe incluye importaciones dinámicas internas en sus bundles ESM/CJS;
// este paquete solo se consume en navegador desde poseDetection.ts.
config.resolver.blockList = [/node_modules[\\/]@mediapipe[\\/]tasks-vision[\\/]vision_bundle\.(mjs|cjs|js)$/];

module.exports = config;
