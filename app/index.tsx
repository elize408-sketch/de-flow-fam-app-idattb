
import { useEffect } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/styles/commonStyles';
import { getCurrentUser } from '@/utils/auth';
import { userHasFamily } from '@/utils/familyService';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      console.log('Checking authentication status...');
      
      // Check if user is authenticated
      const user = await getCurrentUser();
      
      if (!user) {
        console.log('No user found, redirecting to welcome');
        router.replace('/(auth)/welcome');
        return;
      }

      console.log('User authenticated:', user.id);

      // Check if user has a family
      const hasFamily = await userHasFamily(user.id);
      
      if (!hasFamily) {
        console.log('User has no family, redirecting to welcome');
        router.replace('/(auth)/welcome');
        return;
      }

      console.log('User has family, redirecting to home');
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('Error checking auth:', error);
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
