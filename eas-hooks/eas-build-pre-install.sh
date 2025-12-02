
#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Running pre-install hook..."

cd "$EAS_BUILD_WORKINGDIR" || exit 1

if [ -d "ios" ]; then
  echo "🧹 Cleaning iOS build artifacts..."
  rm -rf ios/Pods
  rm -f ios/Podfile.lock
  rm -rf ios/build
  rm -rf ios/*.xcworkspace
  rm -rf ios/*.xcodeproj
fi

echo "✅ Pre-install hook completed"
