
#!/usr/bin/env bash

set -euo pipefail

echo "🔧 Running pre-install hook..."

# Ensure we're in the project root
cd "$EAS_BUILD_WORKINGDIR" || exit 1

echo "✅ Pre-install hook completed"
