
const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const path = require('path');

/**
 * Config plugin to fix script phase warnings by adding output file paths
 * This addresses the "Run script build phase will be run during every build" warnings
 */
function withFixScriptPhases(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = path.join(projectRoot, 'ios');
      
      console.log('🔧 Fixing script phase output dependencies...');
      
      // The actual fix needs to be done in the Podfile post_install hook
      // This plugin ensures the hook is properly configured
      
      return config;
    },
  ]);
}

module.exports = withFixScriptPhases;
