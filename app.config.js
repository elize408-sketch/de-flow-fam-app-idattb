export default ({ config }) => ({
  expo: {
    ...config,

    name: "Flow Fam",
    slug: "flow-fam",
    version: "1.0.6",
    scheme: "flowfam",

    ios: {
      ...config.ios,
      bundleIdentifier: "nl.flowfam.gezinsapp",
      supportsTablet: true,
      deploymentTarget: "16.0",
      usesAppleSignIn: true,
      infoPlist: {
        ...(config.ios?.infoPlist ?? {}),
        ITSAppUsesNonExemptEncryption: false,
        CFBundleDisplayName: "Flow Fam",
        CFBundleName: "FlowFam",
      },
    },

    android: {
      ...config.android,
      package: "nl.flowfam.gezinsapp",
      versionCode: 1,
    },

    plugins: [
      ...(config.plugins ?? []),
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
        },
      ],
    ],
    extra: {
  ...(config.extra ?? {}),
  eas: {
    projectId: "143b077c-c9bc-49ad-8f27-0180e47a6e1a",
  },
  SUPABASE_URL: "https://iykrwfgfdpnlfmdexrpr.supabase.co",
  SUPABASE_ANON_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3J3ZmdmZHBubGZtZGV4cnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTA4ODIsImV4cCI6MjA3OTYyNjg4Mn0.e2KS_hzDwXb-oGPQW7tC6g70Wo5CDMVb61gGVqPiYTI",
},
