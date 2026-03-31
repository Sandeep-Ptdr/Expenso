const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/dist/metro/index.js");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./src/global.css",
});
