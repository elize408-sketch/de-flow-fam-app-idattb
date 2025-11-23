
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
  description: string;
  weatherCode: number;
}

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  icon: string;
  condition: string;
}

interface WeatherWidgetProps {
  compact?: boolean;
  onPress?: () => void;
}

export default function WeatherWidget({ compact = false, onPress }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => {
    getWeather();
  }, []);

  const getWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Locatie toegang geweigerd');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch weather data with 7-day forecast
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
      );
      
      const data = await response.json();
      
      if (data.current_weather) {
        const weatherCode = data.current_weather.weathercode;
        const temp = Math.round(data.current_weather.temperature);
        const weatherInfo = getWeatherInfo(weatherCode);
        
        setWeather({
          temp,
          condition: weatherInfo.condition,
          icon: weatherInfo.icon,
          description: weatherInfo.description,
          weatherCode,
        });

        // Process forecast data
        if (data.daily) {
          const forecastData: ForecastDay[] = [];
          for (let i = 0; i < 7; i++) {
            const weatherCode = data.daily.weathercode[i];
            const weatherInfo = getWeatherInfo(weatherCode);
            forecastData.push({
              date: data.daily.time[i],
              maxTemp: Math.round(data.daily.temperature_2m_max[i]),
              minTemp: Math.round(data.daily.temperature_2m_min[i]),
              weatherCode,
              icon: weatherInfo.icon,
              condition: weatherInfo.condition,
            });
          }
          setForecast(forecastData);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Weather fetch error:', err);
      setError('Kon weer niet ophalen');
      setLoading(false);
    }
  };

  const getWeatherInfo = (code: number) => {
    if (code === 0) return { condition: 'Helder', icon: 'wb-sunny', description: 'Mooi weer!' };
    if (code <= 3) return { condition: 'Bewolkt', icon: 'cloud', description: 'Een beetje bewolkt' };
    if (code <= 48) return { condition: 'Mistig', icon: 'cloud', description: 'Mistig weer' };
    if (code <= 67) return { condition: 'Regen', icon: 'water-drop', description: 'Neem een paraplu mee!' };
    if (code <= 77) return { condition: 'Sneeuw', icon: 'ac-unit', description: 'Het sneeuwt!' };
    if (code <= 82) return { condition: 'Regen', icon: 'water-drop', description: 'Regenachtig' };
    if (code <= 86) return { condition: 'Sneeuw', icon: 'ac-unit', description: 'Sneeuwbuien' };
    return { condition: 'Onweer', icon: 'flash-on', description: 'Onweer mogelijk' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Vandaag';
    if (date.toDateString() === tomorrow.toDateString()) return 'Morgen';
    
    return date.toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) {
    return compact ? (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>...</Text>
      </View>
    ) : (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Weer ophalen...</Text>
      </View>
    );
  }

  if (error || !weather) {
    return compact ? (
      <View style={styles.compactContainer}>
        <Text style={styles.compactText}>☁️</Text>
      </View>
    ) : (
      <View style={styles.container}>
        <Text style={styles.errorText}>☁️ Weer niet beschikbaar</Text>
      </View>
    );
  }

  if (compact) {
    return (
      <>
        <TouchableOpacity 
          style={styles.compactContainer}
          onPress={() => setShowForecast(true)}
        >
          <IconSymbol
            ios_icon_name={weather.icon}
            android_material_icon_name={weather.icon}
            size={24}
            color={colors.text}
          />
          <Text style={styles.compactTemp}>{weather.temp}°</Text>
        </TouchableOpacity>

        <Modal
          visible={showForecast}
          transparent
          animationType="slide"
          onRequestClose={() => setShowForecast(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowForecast(false)}
          >
            <View style={styles.forecastModal}>
              <Text style={styles.forecastTitle}>Weersvoorspelling</Text>
              
              <ScrollView style={styles.forecastScroll}>
                {forecast.map((day, index) => (
                  <React.Fragment key={index}>
                    <View style={styles.forecastDay}>
                      <Text style={styles.forecastDate}>{formatDate(day.date)}</Text>
                      <View style={styles.forecastWeather}>
                        <IconSymbol
                          ios_icon_name={day.icon}
                          android_material_icon_name={day.icon}
                          size={32}
                          color={colors.text}
                        />
                        <Text style={styles.forecastCondition}>{day.condition}</Text>
                      </View>
                      <View style={styles.forecastTemps}>
                        <Text style={styles.forecastMaxTemp}>{day.maxTemp}°</Text>
                        <Text style={styles.forecastMinTemp}>{day.minTemp}°</Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowForecast(false)}
              >
                <Text style={styles.closeButtonText}>Sluiten</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => setShowForecast(true)}
    >
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
      <Text style={styles.hint}>💡 Tik voor volledige voorspelling</Text>
    </TouchableOpacity>
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
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
    elevation: 2,
    gap: 6,
  },
  compactText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
  },
  compactTemp: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  forecastModal: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    boxShadow: `0px 8px 24px ${colors.shadow}`,
    elevation: 5,
  },
  forecastTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  forecastScroll: {
    maxHeight: 400,
  },
  forecastDay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  forecastDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },
  forecastWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 2,
  },
  forecastCondition: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'Nunito_400Regular',
  },
  forecastTemps: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  forecastMaxTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Poppins_700Bold',
  },
  forecastMinTemp: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  closeButton: {
    backgroundColor: colors.accent,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.card,
    fontFamily: 'Poppins_600SemiBold',
  },
});
