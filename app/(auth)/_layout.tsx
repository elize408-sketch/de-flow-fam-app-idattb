
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="create-family" />
      <Stack.Screen name="join-family" />
      <Stack.Screen name="login" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="setup-family" />
      <Stack.Screen name="add-family-members" />
      <Stack.Screen name="complete-join" />
    </Stack>
  );
}
