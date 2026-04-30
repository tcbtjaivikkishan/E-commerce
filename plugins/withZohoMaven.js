// plugins/withZohoMaven.js
// Expo config plugin to inject Zoho maven repository into build.gradle
const { withProjectBuildGradle } = require("expo/config-plugins");

module.exports = function withZohoMaven(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language === "groovy") {
      const contents = mod.modResults.contents;
      // Add Zoho maven repo if not already present
      if (!contents.includes("maven.zohodl.com")) {
        mod.modResults.contents = contents.replace(
          /mavenCentral\(\)\n(\s*)\}/,
          `mavenCentral()\n$1    maven { url 'https://maven.zohodl.com' }\n$1}`
        );
      }
    }
    return mod;
  });
};
