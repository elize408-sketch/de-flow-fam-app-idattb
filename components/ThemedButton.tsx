
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useModuleTheme } from '@/contexts/ThemeContext';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  icon?: string;
  androidIcon?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function ThemedButton({
  title,
  onPress,
  icon,
  androidIcon,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}: ThemedButtonProps) {
  const { accentColor } = useModuleTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.warmOrange };
      case 'secondary':
        return { 
          backgroundColor: colors.beige,
        };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderWidth: 2, 
          borderColor: colors.warmOrange,
        };
      case 'destructive':
        return { backgroundColor: colors.error };
      default:
        return { backgroundColor: colors.warmOrange };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.warmOrange;
      case 'destructive':
        return '#FFFFFF';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <IconSymbol
          ios_icon_name={icon}
          android_material_icon_name={androidIcon || icon}
          size={20}
          color={getTextColor()}
        />
      )}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
  },
  disabled: {
    opacity: 0.5,
  },
});
