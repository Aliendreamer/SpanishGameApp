#!/usr/bin/env bash
# Builds a profile with plain Gradle — no Expo account or EAS involved.
#   scripts/build-gradle.sh development|preview|production
# development → debug-signed dev-client APK; preview → release APK; production → release AAB.
# Release builds are signed with the upload key from credentials.json (git-crypt encrypted), passed
# to Gradle as ORG_GRADLE_PROJECT_* variables that plugins/with-release-signing.js wires into
# android/app/build.gradle. (Expo's EAS signing script, AndroidConfig.EasBuild, fails on Gradle 9:
# "too late to set storeFilePath" — so it is not used here.)
set -euo pipefail

profile="${1:-}"
case "$profile" in
  development) task=assembleDebug; artifact=app/build/outputs/apk/debug/app-debug.apk; ext=apk ;;
  preview) task=assembleRelease; artifact=app/build/outputs/apk/release/app-release.apk; ext=apk ;;
  production) task=bundleRelease; artifact=app/build/outputs/bundle/release/app-release.aab; ext=aab ;;
  *) echo "usage: $0 development|preview|production" >&2; exit 2 ;;
esac

cd "$(dirname "$0")/.."

# Gradle reads the app config outside Expo CLI, which normally sets NODE_ENV.
if [ "$profile" = development ]; then export NODE_ENV=development; else export NODE_ENV=production; fi

if [ "$profile" != development ]; then
  if [ ! -f credentials.json ]; then
    echo "credentials.json not found — download the upload key with 'pnpm eas credentials' first" >&2
    exit 1
  fi
  # One read that fails (and stops the script) if any field is missing or empty.
  keystore=$(jq -er '.android.keystore
    | [.keystorePath, .keystorePassword, .keyAlias, .keyPassword]
    | if all(. != null and . != "") then @tsv else error("credentials.json: android.keystore is incomplete") end' \
    credentials.json)
  IFS=$'\t' read -r store_file store_password key_alias key_password <<<"$keystore"
  # Gradle maps ORG_GRADLE_PROJECT_* to project properties; unlike -P arguments, environment
  # variables do not show up in the process list.
  export ORG_GRADLE_PROJECT_SPANISH_UPLOAD_STORE_FILE="$PWD/$store_file"
  export ORG_GRADLE_PROJECT_SPANISH_UPLOAD_STORE_PASSWORD="$store_password"
  export ORG_GRADLE_PROJECT_SPANISH_UPLOAD_KEY_ALIAS="$key_alias"
  export ORG_GRADLE_PROJECT_SPANISH_UPLOAD_KEY_PASSWORD="$key_password"
fi

pnpm expo prebuild --platform android --clean --no-install
(cd android && ./gradlew "$task")

mkdir -p build
cp "android/$artifact" "build/$profile.$ext"
echo "Built build/$profile.$ext"
