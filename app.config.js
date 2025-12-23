
export default ({ config }) => ({
  ...config,

  name: "Flow Fam",
  slug: "flow-fam",
  version: "1.0.6",
  orientation: "portrait",

  icon: "./assets/images/ad140c28-4e3a-4941-a32b-028b482df723.png",
  userInterfaceStyle: "automatic",

  splash: {
    image: "./assets/images/ad140c28-4e3a-4941-a32b-028b482df723.png",
    resizeMode: "contain",
    backgroundColor: "#F9F6F1",
  },

  scheme: "flowfam",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "nl.flowfam.gezinsapp",
    deploymentTarget: "16.0",
    buildNumber: "2",
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleDisplayName: "Flow Fam",
      CFBundleName: "FlowFam",
    },
  },

  android: {
    package: "nl.flowfam.gezinsapp",
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: "./assets/images/ad140c28-4e3a-4941-a32b-028b482df723.png",
      backgroundColor: "#F9F6F1",
    },
    edgeToEdgeEnabled: true,
  },

  web: {
    favicon: "./assets/images/ad140c28-4e3a-4941-a32b-028b482df723.png",
    bundler: "metro",
  },

  plugins: [
    "expo-font",
    "expo-router",
    "expo-web-browser",
    [
      "@react-native-google-signin/google-signin",
      {
        iosUrlScheme:
          "com.googleusercontent.apps.143b077c-c9bc-49ad-8f27-0180e47a6e1a",
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "16.0",
          useFrameworks: "static",
          flipper: false,
        },
        android: {
          compileSdkVersion: 34,
          targetSdkVersion: 34,
          minSdkVersion: 23,
        },
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    newArchEnabled: false,
  },

  extra: {
    ...(config.extra ?? {}),
    router: {},
    eas: {
      projectId: "143b077c-c9bc-49ad-8f27-0180e47a6e1a",
    },
  },
});
