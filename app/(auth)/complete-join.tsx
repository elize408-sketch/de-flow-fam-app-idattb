
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { addFamilyMember } from '@/utils/familyService';
import { getCurrentUser } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

export default function CompleteJoinScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const familyId = params.familyId as string;
  const [loading, setLoading] = useState(true);

  const completeJoin = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert(t('common.error'), 'Geen gebruiker gevonden');
        router.replace('/(auth)/welcome');
        return;
      }

      if (!familyId) {
        Alert.alert(t('common.error'), 'Geen gezin geselecteerd');
        router.replace('/(auth)/welcome');
        return;
      }

      // Generate fallback name if not provided
      const userName = name || 
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.email?.split('@')[0] || 
        'Ouder';

      console.log('Completing join with name:', userName);

      const memberResult = await addFamilyMember(
        familyId,
        user.id,
        userName,
        'parent',
        colors.accent
      );

      if (!memberResult.success) {
        Alert.alert(t('common.error'), memberResult.error || 'Kon je niet toevoegen aan het gezin');
        router.replace('/(auth)/welcome');
        return;
      }

      setLoading(false);
      
      Alert.alert(
        t('auth.joinFamily.welcome'),
        t('auth.joinFamily.welcomeMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              router.replace('/(tabs)/(home)');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Complete join error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het toevoegen aan het gezin');
      router.replace('/(auth)/welcome');
    }
  }, [name, familyId, router, t]);

  useEffect(() => {
    completeJoin();
  }, [completeJoin]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.text}>{t('auth.joinFamily.addingToFamily')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
});
