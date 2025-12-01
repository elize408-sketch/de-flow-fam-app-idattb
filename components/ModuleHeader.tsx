
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useModuleTheme } from '@/contexts/ThemeContext';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  showAddButton?: boolean;
  onAddPress?: () => void;
  backRoute?: string;
}

export default function ModuleHeader({
  title,
  subtitle,
  showBackButton = true,
  showAddButton = false,
  onAddPress,
  backRoute = '/(tabs)/(home)',
}: ModuleHeaderProps) {
  const router = useRouter();
  const { accentColor } = useModuleTheme();

  return (
    <View style={[styles.headerRow, { backgroundColor: accentColor }]}>
      {showBackButton ? (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push(backRoute as any)}
        >
          <IconSymbol
            ios_icon_name="house"
            android_material_icon_name="home"
            size={24}
            color={colors.card}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      
      {showAddButton && onAddPress ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
        >
          <IconSymbol
            ios_icon_name="plus"
            android_material_icon_name="add"
            size={24}
            color={colors.card}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.card,
    marginTop: 5,
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
    opacity: 0.9,
  },
});
