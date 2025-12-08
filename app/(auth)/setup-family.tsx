
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { createFamily, addFamilyMember } from '@/utils/familyService';
import { getCurrentUser } from '@/utils/auth';
import { useTranslation } from 'react-i18next';

export default function SetupFamilyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const [loading, setLoading] = useState(true);

  const setupFamily = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert(t('common.error'), 'Geen gebruiker gevonden');
        router.replace('/(auth)/welcome');
        return;
      }

      // Generate fallback name if not provided
      const userName = name || 
        user.user_metadata?.full_name || 
        user.user_metadata?.name || 
        user.email?.split('@')[0] || 
        'Ouder';

      console.log('Setting up family with name:', userName);

      // Create family
      const familyResult = await createFamily();
      
      if (!familyResult.success || !familyResult.family) {
        Alert.alert(t('common.error'), familyResult.error || 'Kon geen gezin aanmaken');
        router.replace('/(auth)/welcome');
        return;
      }

      // Add user as parent
      const memberResult = await addFamilyMember(
        familyResult.family.id,
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
      
      // Show family code and navigate to add family members screen
      Alert.alert(
        t('auth.createFamily.familyCreated'),
        t('auth.createFamily.familyCodeMessage', { code: familyResult.family.family_code }),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              // Navigate to add family members screen instead of home
              console.log('Navigating to add-family-members screen...');
              router.replace('/(auth)/add-family-members');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Setup family error:', error);
      Alert.alert(t('common.error'), 'Er ging iets mis bij het aanmaken van het gezin');
      router.replace('/(auth)/welcome');
    }
  }, [name, router, t]);

  useEffect(() => {
    setupFamily();
  }, [setupFamily]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.text}>{t('auth.setupFamily.creatingFamily')}</Text>
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
