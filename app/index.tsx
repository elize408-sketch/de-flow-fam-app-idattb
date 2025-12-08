
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { getCurrentUser, getCurrentSession } from '@/utils/auth';
import { userHasFamily } from '@/utils/familyService';

const LANGUAGE_SELECTED_KEY = '@flow_fam_language_selected';
const MAX_CHECK_TIME = 5000; // 5 seconds max for auth check

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState('Checking authentication...');

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    const timeoutId = setTimeout(() => {
      console.error('Auth check timeout - redirecting to welcome');
      setDebugInfo('Timeout - redirecting...');
      router.replace('/(auth)/welcome');
      setIsChecking(false);
    }, MAX_CHECK_TIME);

    try {
      console.log('=== Starting authentication check ===');
      setDebugInfo('Checking language selection...');
      
      // Check if language has been selected
      const languageSelected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      console.log('Language selected:', languageSelected);
      
      if (!languageSelected) {
        console.log('Language not selected, showing welcome screen');
        clearTimeout(timeoutId);
        setDebugInfo('Redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }
      
      setDebugInfo('Checking user session...');
      
      // Check if user has a session
      const session = await getCurrentSession();
      console.log('Session exists:', !!session);
      
      if (!session) {
        console.log('No session found, redirecting to welcome');
        clearTimeout(timeoutId);
        setDebugInfo('No session - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }

      setDebugInfo('Getting user details...');
      
      // Get user details
      const user = await getCurrentUser();
      console.log('User found:', !!user, user?.id);
      
      if (!user) {
        console.log('No user found despite having session, redirecting to welcome');
        clearTimeout(timeoutId);
        setDebugInfo('No user found - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }

      console.log('User authenticated:', user.id);
      setDebugInfo('Checking family membership...');

      // Check if user has a family
      const hasFamily = await userHasFamily(user.id);
      console.log('User has family:', hasFamily);
      
      clearTimeout(timeoutId);
      
      if (!hasFamily) {
        console.log('User has no family, redirecting to welcome');
        setDebugInfo('No family found - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }

      console.log('User has family, redirecting to home');
      setDebugInfo('Redirecting to home...');
      setTimeout(() => {
        router.replace('/(tabs)/(home)');
        setIsChecking(false);
      }, 100);
    } catch (error) {
      console.error('Error checking auth:', error);
      clearTimeout(timeoutId);
      setDebugInfo(`Error: ${error}`);
      setTimeout(() => {
        router.replace('/(auth)/welcome');
        setIsChecking(false);
      }, 1000);
    }
  };

  if (!isChecking) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.debugText}>{debugInfo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  debugText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
