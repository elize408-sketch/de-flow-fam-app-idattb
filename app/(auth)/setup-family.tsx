
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { createFamily, addFamilyMember } from '@/utils/familyService';
import { getCurrentUser } from '@/utils/auth';
import { Alert } from 'react-native';

export default function SetupFamilyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const name = params.name as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupFamily();
  }, []);

  const setupFamily = async () => {
    try {
      const user = await getCurrentUser();
      
      if (!user) {
        Alert.alert('Fout', 'Geen gebruiker gevonden');
        router.replace('/(auth)/welcome');
        return;
      }

      // Create family
      const familyResult = await createFamily();
      
      if (!familyResult.success || !familyResult.family) {
        Alert.alert('Fout', familyResult.error || 'Kon geen gezin aanmaken');
        router.replace('/(auth)/welcome');
        return;
      }

      // Add user as parent
      const memberResult = await addFamilyMember(
        familyResult.family.id,
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
      
      // Show family code
      Alert.alert(
        'Gezin aangemaakt! 🎉',
        `Je gezinscode is: ${familyResult.family.family_code}\n\nDeel deze code met andere gezinsleden zodat zij kunnen deelnemen.`,
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
      console.error('Setup family error:', error);
      Alert.alert('Fout', 'Er ging iets mis bij het aanmaken van het gezin');
      router.replace('/(auth)/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.text}>Je gezin wordt aangemaakt...</Text>
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
