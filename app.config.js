export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier: "nl.flowfam.gezinsapp",
    usesAppleSignIn: true,
  },
  extra: {
    SUPABASE_URL: "https://iykrwfgfdpnlfmdexrpr.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a3J3ZmdmZHBubGZtZGV4cnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTA4ODIsImV4cCI6MjA3OTYyNjg4Mn0.e2KS_hzDwXb-oGPQW7tC6g70Wo5CDMVb61gGVqPiYTIY",
  },
});
