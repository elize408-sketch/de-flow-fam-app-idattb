export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: "nl.flowfam.gezinsapp",
    usesAppleSignIn: true,
  },
  extra: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  },
});
