import 'react-native-get-random-values';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { FamilyProvider } from '@/contexts/FamilyContext';
import { WidgetProvider } from '@/contexts/WidgetContext';
import { ModuleThemeProvider } from '@/contexts/ThemeContext';
import { 
  Poppins_400Regular, 
  Poppins_600SemiBold, 
  Poppins_700Bold 
} from '@expo-google-fonts/poppins';
import { 
  Nunito_400Regular, 
  Nunito_600SemiBold, 
  Nunito_700Bold 
} from '@expo-google-fonts/nunito';
import '@/utils/i18n'; // Initialize i18n

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useRNColorScheme();
  const [loaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ModuleThemeProvider>
        <FamilyProvider>
          <WidgetProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="formsheet" options={{ presentation: 'formSheet', headerShown: false }} />
              <Stack.Screen name="transparent-modal" options={{ presentation: 'transparentModal', headerShown: false }} />
              <Stack.Screen 
                name="(tabs)/shopping/add-item" 
                options={{ 
                  presentation: 'modal', 
                  headerShown: false 
                }} 
              />
            </Stack>
          </WidgetProvider>
        </FamilyProvider>
      </ModuleThemeProvider>
    </ThemeProvider>
  );
}
