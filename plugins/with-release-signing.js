// Config plugin: sign release builds with the upload key in the generated android/ project.
// `expo prebuild` regenerates android/, so the signing config is re-applied on every prebuild.
// Values arrive as SPANISH_UPLOAD_* Gradle properties, which scripts/build-gradle.sh sets through
// ORG_GRADLE_PROJECT_* environment variables — never written to disk or shown in the process list.
// Without them, release builds keep the debug key.
const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = "project.hasProperty('SPANISH_UPLOAD_STORE_FILE')";

const RELEASE_SIGNING_CONFIG = `        release {
            if (${MARKER}) {
                storeFile file(SPANISH_UPLOAD_STORE_FILE)
                storePassword SPANISH_UPLOAD_STORE_PASSWORD
                keyAlias SPANISH_UPLOAD_KEY_ALIAS
                keyPassword SPANISH_UPLOAD_KEY_PASSWORD
            }
        }
`;

const RELEASE_BUILD_TYPE =
  /(\n {8}release \{\n(?: {12}\/\/.*\n)*) {12}signingConfig signingConfigs\.debug\n/;

function addReleaseSigning(gradle) {
  if (gradle.includes(MARKER)) return gradle;
  if (!gradle.includes('    signingConfigs {\n') || !RELEASE_BUILD_TYPE.test(gradle)) {
    throw new Error(
      'with-release-signing: signingConfigs / release buildType not found in app/build.gradle — ' +
        'the Expo template changed; update plugins/with-release-signing.js',
    );
  }
  return gradle
    .replace('    signingConfigs {\n', `    signingConfigs {\n${RELEASE_SIGNING_CONFIG}`)
    .replace(
      RELEASE_BUILD_TYPE,
      `$1            signingConfig ${MARKER} ? signingConfigs.release : signingConfigs.debug\n`,
    );
}

const withReleaseSigning = (config) =>
  withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = addReleaseSigning(mod.modResults.contents);
    return mod;
  });

module.exports = withReleaseSigning;
module.exports.addReleaseSigning = addReleaseSigning;
