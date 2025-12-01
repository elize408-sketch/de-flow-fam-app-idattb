
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

interface IconOption {
  ios: string;
  android: string;
  label: string;
  isCustom?: boolean;
  customImage?: any;
}

const TASK_ICONS: IconOption[] = [
  { ios: 'bed', android: 'bed', label: 'Bed opmaken' },
  { ios: 'toothbrush', android: 'brush', label: 'Tanden poetsen', isCustom: true, customImage: require('@/assets/images/37e069f3-3725-4165-ba07-912d50e9b6e8.png') },
  { ios: 'checkmark-shirt', android: 'checkroom', label: 'Kleding klaarleggen' },
  { ios: 'basket', android: 'shopping-basket', label: 'Kleding in wasmand' },
  { ios: 'backpack', android: 'school', label: 'Schooltas pakken' },
  { ios: 'bag', android: 'shopping-bag', label: 'Schooltas uitpakken' },
  { ios: 'book', android: 'book', label: 'Huiswerk' },
  { ios: 'toy-brick', android: 'toys', label: 'Kamer opruimen' },
  { ios: 'toys', android: 'toys', label: 'Speelgoed' },
  { ios: 'restaurant', android: 'restaurant', label: 'Eten' },
  { ios: 'checkmark', android: 'check', label: 'Vinkje' },
  { ios: 'star', android: 'star', label: 'Ster' },
  { ios: 'heart', android: 'favorite', label: 'Hart' },
  { ios: 'house', android: 'home', label: 'Huis' },
  { ios: 'bicycle', android: 'directions-bike', label: 'Fiets' },
  { ios: 'football', android: 'sports-soccer', label: 'Voetbal' },
  { ios: 'music-note', android: 'music-note', label: 'Muziek' },
  { ios: 'paintbrush', android: 'palette', label: 'Tekenen' },
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
  { ios: 'mop', android: 'cleaning-services', label: 'Dweilen' },
  { ios: 'vacuum', android: 'cleaning-services', label: 'Stofzuigen', isCustom: true, customImage: require('@/assets/images/5909fa62-4c76-4792-b108-111136b86331.png') },
  { ios: 'toilet', android: 'wc', label: 'WC schoonmaken', isCustom: true, customImage: require('@/assets/images/97bb7a71-d598-4d4d-870c-ec7d07fa8cc0.png') },
];

const SCHEDULE_ICONS: IconOption[] = [
  { ios: 'book', android: 'school', label: 'School' },
  { ios: 'toys', android: 'toys', label: 'BSO' },
  { ios: 'water', android: 'pool', label: 'Zwemles' },
  { ios: 'football', android: 'sports-soccer', label: 'Voetbal' },
  { ios: 'music-note', android: 'music-note', label: 'Muziekles' },
  { ios: 'bicycle', android: 'directions-bike', label: 'Fietsen' },
  { ios: 'paintbrush', android: 'palette', label: 'Tekenen' },
  { ios: 'basketball', android: 'sports-basketball', label: 'Sport' },
  { ios: 'book-open', android: 'menu-book', label: 'Lezen' },
  { ios: 'house', android: 'home', label: 'Thuis' },
  { ios: 'person', android: 'person', label: 'Afspraak' },
  { ios: 'gift', android: 'cake', label: 'Feestje' },
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  type?: 'task' | 'household' | 'schedule';
  taskName?: string;
}

const suggestIcon = (taskName: string, type: 'task' | 'household' | 'schedule'): string => {
  const name = taskName.toLowerCase();
  
  const keywords: { [key: string]: string } = {
    'tanden': 'brush',
    'poetsen': 'brush',
    'tandenborstel': 'brush',
    'bed': 'bed',
    'opmaken': 'bed',
    'kleding': 'checkroom',
    'kleren': 'checkroom',
    'wasmand': 'shopping-basket',
    'was': 'shopping-basket',
    'schooltas': 'school',
    'rugtas': 'school',
    'tas': 'school',
    'school': 'school',
    'huiswerk': 'book',
    'leren': 'book',
    'kamer': 'toys',
    'opruimen': 'toys',
    'speelgoed': 'toys',
    'eten': 'restaurant',
    'maaltijd': 'restaurant',
    'dweilen': 'cleaning-services',
    'dweil': 'cleaning-services',
    'stofzuigen': 'cleaning-services',
    'stofzuiger': 'cleaning-services',
    'schoonmaken': 'auto-awesome',
    'schoon': 'auto-awesome',
    'afval': 'delete',
    'vuilnis': 'delete',
    'keuken': 'kitchen',
    'badkamer': 'shower',
    'wc': 'wc',
    'toilet': 'wc',
    'planten': 'eco',
    'tuin': 'eco',
    'auto': 'directions-car',
    'klussen': 'build',
    'repareren': 'handyman',
    'ophangen': 'construction',
    'bso': 'toys',
    'zwemles': 'pool',
    'zwemmen': 'pool',
    'voetbal': 'sports-soccer',
    'muziek': 'music-note',
  };
  
  for (const [keyword, iconName] of Object.entries(keywords)) {
    if (name.includes(keyword)) {
      return iconName;
    }
  }
  
  if (type === 'schedule') return 'school';
  if (type === 'household') return 'home';
  return 'check';
};

export default function IconPicker({ selectedIcon, onSelectIcon, type = 'task', taskName = '' }: IconPickerProps) {
  let icons = TASK_ICONS;
  if (type === 'household') icons = HOUSEHOLD_ICONS;
  if (type === 'schedule') icons = SCHEDULE_ICONS;
  
  React.useEffect(() => {
    if (taskName && taskName.trim().length > 2 && !selectedIcon) {
      const suggested = suggestIcon(taskName, type);
      onSelectIcon(suggested);
    }
  }, [taskName, type, selectedIcon, onSelectIcon]);

  const handleIconPress = useCallback((iconAndroid: string) => {
    console.log('Icon pressed:', iconAndroid);
    onSelectIcon(iconAndroid);
  }, [onSelectIcon]);

  const renderIcon = useCallback((icon: IconOption, isActive: boolean) => {
    const iconColor = isActive ? colors.card : colors.text;
    
    if (icon.isCustom && icon.customImage) {
      return (
        <Image
          source={icon.customImage}
          style={[
            styles.customIconImage,
            { tintColor: iconColor }
          ]}
          resizeMode="contain"
        />
      );
    }
    
    return (
      <IconSymbol
        ios_icon_name={icon.ios}
        android_material_icon_name={icon.android as any}
        size={28}
        color={iconColor}
      />
    );
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Kies een icoon:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {icons.map((icon, index) => {
          const isSelected = selectedIcon === icon.android;
          return (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[
                  styles.iconButton,
                  isSelected && styles.iconButtonSelected,
                ]}
                onPress={() => handleIconPress(icon.android)}
                activeOpacity={0.7}
              >
                {renderIcon(icon, isSelected)}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
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
    gap: 10,
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconButtonSelected: {
    backgroundColor: colors.vibrantOrange,
    borderColor: colors.highlight,
  },
  customIconImage: {
    width: 28,
    height: 28,
  },
});
