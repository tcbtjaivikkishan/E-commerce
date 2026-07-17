// plugins/withZohoMaven.js
// Expo config plugin to inject Zoho maven repository into build.gradle
const { withProjectBuildGradle } = require("expo/config-plugins");

const ZOHO_MAVEN_REPO = "maven { url 'https://maven.zohodl.com' }";

function hasZohoRepoInAllprojects(contents) {
  const allprojectsBlock = contents.match(/allprojects\s*\{[\s\S]*?\n\}/);
  return allprojectsBlock && allprojectsBlock[0].includes("maven.zohodl.com");
}

module.exports = function withZohoMaven(config) {
  return withProjectBuildGradle(config, (mod) => {
    if (mod.modResults.language === "groovy") {
      const contents = mod.modResults.contents;
      if (!hasZohoRepoInAllprojects(contents)) {
        mod.modResults.contents = contents.replace(
          /(allprojects\s*\{\s*repositories\s*\{)/,
          `$1\n    ${ZOHO_MAVEN_REPO}`
        );
      }
    }
    return mod;
  });
};
