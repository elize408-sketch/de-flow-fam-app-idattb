
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import * as Font from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import { colors } from '@/styles/commonStyles';
import { FamilyProvider } from '@/contexts/FamilyContext';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.primary,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.primary,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Poppins_400Regular,
          Poppins_600SemiBold,
          Poppins_700Bold,
          Nunito_400Regular,
          Nunito_600SemiBold,
          Nunito_700Bold,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FamilyProvider>
      <ThemeProvider value={CustomLightTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Modal',
            }}
          />
          <Stack.Screen
            name="formsheet"
            options={{
              presentation: 'formSheet',
              headerShown: true,
              title: 'Form Sheet',
            }}
          />
          <Stack.Screen
            name="transparent-modal"
            options={{
              presentation: 'transparentModal',
              animation: 'fade',
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </FamilyProvider>
  );
}
