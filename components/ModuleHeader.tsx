
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useModuleTheme } from '@/contexts/ThemeContext';
import { useFamily } from '@/contexts/FamilyContext';

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  onAddPress?: () => void;
  showAddButton?: boolean;
  addButtonIcon?: { ios: string; android: string };
  backgroundColor?: string;
}

export default function ModuleHeader({
  title,
  subtitle,
  onAddPress,
  showAddButton = false,
  addButtonIcon = { ios: 'plus', android: 'add' },
  backgroundColor,
}: ModuleHeaderProps) {
  const { accentColor } = useModuleTheme();
  const { currentUser } = useFamily();

  // Only show add button if user is a parent and showAddButton is true
  const shouldShowAddButton = showAddButton && currentUser?.role === 'parent' && onAddPress;

  return (
    <View style={[styles.container, backgroundColor ? { backgroundColor } : null]}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {shouldShowAddButton && (
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: accentColor }]}
          onPress={onAddPress}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name={addButtonIcon.ios}
            android_material_icon_name={addButtonIcon.android}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 16,
    backgroundColor: colors.softCream,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.darkBrown,
    fontFamily: 'Poppins_700Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
});
