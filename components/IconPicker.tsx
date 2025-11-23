
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface IconOption {
  ios: string;
  android: string;
  label: string;
}

const TASK_ICONS: IconOption[] = [
  { ios: 'bed', android: 'bed', label: 'Bed opmaken' },
  { ios: 'water-drop', android: 'water-drop', label: 'Tanden poetsen' },
  { ios: 'checkmark-shirt', android: 'checkroom', label: 'Kleding klaarleggen' },
  { ios: 'tshirt', android: 'dry-cleaning', label: 'Kleding in wasmand' },
  { ios: 'backpack', android: 'school', label: 'Schooltas pakken' },
  { ios: 'bag', android: 'shopping-bag', label: 'Schooltas uitpakken' },
  { ios: 'book', android: 'book', label: 'Huiswerk' },
  { ios: 'sparkles', android: 'auto-awesome', label: 'Kamer opruimen' },
  { ios: 'toys', android: 'toys', label: 'Speelgoed' },
  { ios: 'restaurant', android: 'restaurant', label: 'Eten' },
  { ios: 'checkmark', android: 'check', label: 'Vinkje' },
  { ios: 'star', android: 'star', label: 'Ster' },
  { ios: 'heart', android: 'favorite', label: 'Hart' },
  { ios: 'house', android: 'home', label: 'Huis' },
  { ios: 'bicycle', android: 'directions-bike', label: 'Fiets' },
  { ios: 'football', android: 'sports-soccer', label: 'Voetbal' },
  { ios: 'music-note', android: 'music-note', label: 'Muziek' },
  { ios: 'paintbrush', android: 'brush', label: 'Tekenen' },
  { ios: 'leaf', android: 'eco', label: 'Natuur' },
  { ios: 'sun', android: 'wb-sunny', label: 'Zon' },
  { ios: 'moon', android: 'nightlight', label: 'Slapen' },
  { ios: 'cloud', android: 'cloud', label: 'Weer' },
  { ios: 'trash', android: 'delete', label: 'Afval' },
  { ios: 'cart', android: 'shopping-cart', label: 'Boodschappen' },
  { ios: 'gift', android: 'card-giftcard', label: 'Cadeau' },
  { ios: 'camera', android: 'camera-alt', label: 'Foto' },
  { ios: 'phone', android: 'phone', label: 'Telefoon' },
  { ios: 'envelope', android: 'email', label: 'Brief' },
];

const HOUSEHOLD_ICONS: IconOption[] = [
  { ios: 'house', android: 'home', label: 'Huis' },
  { ios: 'trash', android: 'delete', label: 'Afval' },
  { ios: 'sparkles', android: 'auto-awesome', label: 'Schoonmaken' },
  { ios: 'washer', android: 'local-laundry-service', label: 'Was' },
  { ios: 'refrigerator', android: 'kitchen', label: 'Keuken' },
  { ios: 'shower', android: 'shower', label: 'Badkamer' },
  { ios: 'bed', android: 'bed', label: 'Slaapkamer' },
  { ios: 'sofa', android: 'weekend', label: 'Woonkamer' },
  { ios: 'leaf', android: 'eco', label: 'Planten' },
  { ios: 'car', android: 'directions-car', label: 'Auto' },
  { ios: 'dog', android: 'pets', label: 'Huisdier' },
  { ios: 'cart', android: 'shopping-cart', label: 'Boodschappen' },
  { ios: 'hammer', android: 'build', label: 'Klussen' },
  { ios: 'wrench', android: 'handyman', label: 'Repareren' },
  { ios: 'screwdriver', android: 'construction', label: 'Ophangen' },
  { ios: 'paintbrush', android: 'format-paint', label: 'Schilderen' },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  type?: 'task' | 'household';
}

export default function IconPicker({ selectedIcon, onSelectIcon, type = 'task' }: IconPickerProps) {
  const icons = type === 'household' ? HOUSEHOLD_ICONS : TASK_ICONS;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kies een icoon:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {icons.map((icon, index) => (
          <React.Fragment key={index}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedIcon === icon.android && styles.iconButtonSelected,
              ]}
              onPress={() => onSelectIcon(icon.android)}
            >
              <IconSymbol
                ios_icon_name={icon.ios}
                android_material_icon_name={icon.android as any}
                size={28}
                color={selectedIcon === icon.android ? colors.card : colors.text}
              />
              <Text style={[
                styles.iconLabel,
                selectedIcon === icon.android && styles.iconLabelSelected,
              ]}>
                {icon.label}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    paddingVertical: 5,
  },
  iconButton: {
    width: 70,
    height: 70,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.highlight,
  },
  iconLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  iconLabelSelected: {
    color: colors.card,
    fontWeight: '600',
  },
});
