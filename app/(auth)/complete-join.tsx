
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { addFamilyMember } from '@/utils/familyService';
import { getCurrentUser } from '@/utils/auth';

export default function CompleteJoinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const familyId = params.familyId as string;
  const [loading, setLoading] = useState(true);

  const completeJoin = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert('Fout', 'Geen gebruiker gevonden');
        router.replace('/(auth)/welcome');
        return;
      }

      if (!familyId) {
        Alert.alert('Fout', 'Geen gezin geselecteerd');
        router.replace('/(auth)/welcome');
        return;
      }

      const memberResult = await addFamilyMember(
        familyId,
        user.id,
        name,
        'parent',
        colors.accent
      );

      if (!memberResult.success) {
        Alert.alert('Fout', memberResult.error || 'Kon je niet toevoegen aan het gezin');
        router.replace('/(auth)/welcome');
        return;
      }

      setLoading(false);
      
      Alert.alert(
        'Welkom! 🎉',
        'Je bent succesvol toegevoegd aan het gezin.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/profile');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Complete join error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het toevoegen aan het gezin');
      router.replace('/(auth)/welcome');
    }
  }, [name, familyId, router]);

  useEffect(() => {
    completeJoin();
  }, [completeJoin]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.text}>Je wordt toegevoegd aan het gezin...</Text>
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
