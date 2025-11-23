
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  description: string;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Locatie toegang geweigerd');
        setLoading(false);
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch weather data from Open-Meteo (free, no API key needed)
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`
      );
      
      const data = await response.json();
      
      if (data.current_weather) {
        const weatherCode = data.current_weather.weathercode;
        const temp = Math.round(data.current_weather.temperature);
        
        // Map weather codes to conditions
        const weatherInfo = getWeatherInfo(weatherCode);
        
        setWeather({
          temp,
          condition: weatherInfo.condition,
          icon: weatherInfo.icon,
          description: weatherInfo.description,
        });
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Kon weer niet ophalen');
      setLoading(false);
    }
  };

  const getWeatherInfo = (code: number) => {
    // WMO Weather interpretation codes
    if (code === 0) return { condition: 'Helder', icon: 'wb-sunny', description: 'Mooi weer!' };
    if (code <= 3) return { condition: 'Bewolkt', icon: 'cloud', description: 'Een beetje bewolkt' };
    if (code <= 48) return { condition: 'Mistig', icon: 'cloud', description: 'Mistig weer' };
    if (code <= 67) return { condition: 'Regen', icon: 'water-drop', description: 'Neem een paraplu mee!' };
    if (code <= 77) return { condition: 'Sneeuw', icon: 'ac-unit', description: 'Het sneeuwt!' };
    if (code <= 82) return { condition: 'Regen', icon: 'water-drop', description: 'Regenachtig' };
    if (code <= 86) return { condition: 'Sneeuw', icon: 'ac-unit', description: 'Sneeuwbuien' };
    return { condition: 'Onweer', icon: 'flash-on', description: 'Onweer mogelijk' };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Weer ophalen...</Text>
      </View>
    );
  }

  if (error || !weather) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>☁️ Weer niet beschikbaar</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.weatherContent}>
        <IconSymbol
          ios_icon_name={weather.icon}
          android_material_icon_name={weather.icon}
          size={40}
          color={colors.text}
        />
        <View style={styles.weatherInfo}>
          <Text style={styles.temp}>{weather.temp}°C</Text>
          <Text style={styles.condition}>{weather.condition}</Text>
        </View>
      </View>
      <Text style={styles.description}>{weather.description}</Text>
      <Text style={styles.hint}>💡 Leg je kleding klaar voor morgen!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  weatherContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherInfo: {
    marginLeft: 15,
  },
  temp: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  condition: {
    fontSize: 16,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Nunito_400Regular',
  },
  hint: {
    fontSize: 12,
    color: colors.accent,
    fontStyle: 'italic',
    fontFamily: 'Nunito_400Regular',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
});
