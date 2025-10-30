const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// 🔹 Configuración para soportar SVG como componentes
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
config.resolver.sourceExts.push("svg");

// 🔹 Exporta la configuración combinada con NativeWind
module.exports = withNativeWind(config, { input: "./src/app/global.css" });
