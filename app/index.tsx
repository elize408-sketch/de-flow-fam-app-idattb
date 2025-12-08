
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/styles/commonStyles';
import { getCurrentUser, getCurrentSession } from '@/utils/auth';
import { userHasFamily } from '@/utils/familyService';

const LANGUAGE_SELECTED_KEY = '@flow_fam_language_selected';
const MAX_CHECK_TIME = 10000; // 10 seconds max for auth check

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    console.log('=== APP INDEX - AUTH CHECK START ===');
    console.log('Timestamp:', new Date().toISOString());
    
    const timeoutId = setTimeout(() => {
      console.error('⏱️ AUTH CHECK TIMEOUT - redirecting to welcome');
      setDebugInfo('Timeout - redirecting to welcome...');
      router.replace('/(auth)/welcome');
      setIsChecking(false);
    }, MAX_CHECK_TIME);

    try {
      console.log('[1/5] Checking language selection...');
      setDebugInfo('Checking language selection...');
      
      // Check if language has been selected
      const languageSelected = await AsyncStorage.getItem(LANGUAGE_SELECTED_KEY);
      console.log('[1/5] Language selected:', languageSelected);
      
      if (!languageSelected) {
        console.log('❌ Language not selected - showing welcome screen');
        clearTimeout(timeoutId);
        setDebugInfo('No language selected - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }
      
      console.log('[2/5] Checking user session...');
      setDebugInfo('Checking user session...');
      
      // Check if user has a session
      const session = await getCurrentSession();
      console.log('[2/5] Session exists:', !!session);
      
      if (!session) {
        console.log('❌ No session found - redirecting to welcome');
        clearTimeout(timeoutId);
        setDebugInfo('No session - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }

      console.log('[3/5] Getting user details...');
      setDebugInfo('Getting user details...');
      
      // Get user details
      const user = await getCurrentUser();
      console.log('[3/5] User found:', !!user, 'User ID:', user?.id);
      
      if (!user) {
        console.log('❌ No user found despite having session - redirecting to welcome');
        clearTimeout(timeoutId);
        setDebugInfo('No user found - redirecting to welcome...');
        setTimeout(() => {
          router.replace('/(auth)/welcome');
          setIsChecking(false);
        }, 100);
        return;
      }

      console.log('✅ User authenticated:', user.id);
      console.log('[4/5] Checking family membership...');
      setDebugInfo('Checking family membership...');

      // Check if user has a family
      const hasFamily = await userHasFamily(user.id);
      console.log('[4/5] User has family:', hasFamily);
      
      clearTimeout(timeoutId);
      
      if (!hasFamily) {
        console.log('❌ User has NO family - redirecting to add-family-members');
        console.log('[5/5] Navigation target: /(auth)/add-family-members');
        setDebugInfo('No family found - redirecting to setup...');
        setTimeout(() => {
          router.replace('/(auth)/add-family-members');
          setIsChecking(false);
        }, 100);
        return;
      }

      console.log('✅ User HAS family - redirecting to home');
      console.log('[5/5] Navigation target: /(tabs)/(home)');
      setDebugInfo('Family found - redirecting to home...');
      setTimeout(() => {
        router.replace('/(tabs)/(home)');
        setIsChecking(false);
      }, 100);
      
    } catch (error) {
      console.error('=== APP INDEX - AUTH CHECK ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      clearTimeout(timeoutId);
      setDebugInfo(`Error: ${error}`);
      
      // On error, redirect to welcome after showing error briefly
      setTimeout(() => {
        console.log('Redirecting to welcome after error...');
        router.replace('/(auth)/welcome');
        setIsChecking(false);
      }, 1000);
    } finally {
      console.log('=== APP INDEX - AUTH CHECK END ===');
    }
  };

  if (!isChecking) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.debugText}>{debugInfo}</Text>
      <Text style={styles.debugSubtext}>
        If this takes too long, the app will redirect automatically
      </Text>
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
    paddingHorizontal: 20,
  },
  debugText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
  debugSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
});
