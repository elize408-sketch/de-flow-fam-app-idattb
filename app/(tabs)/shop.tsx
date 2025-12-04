
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';
import ModuleHeader from '@/components/ModuleHeader';

export default function ShopScreen() {
  const router = useRouter();
  const { setModule, accentColor } = useModuleTheme();

  // Set module theme on mount - use purple color
  useEffect(() => {
    setModule('shop' as ModuleName);
  }, [setModule]);

  const handleOpenShop = async () => {
    const url = 'https://www.flowfam.nl';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Fout', `Kan de URL niet openen: ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <ModuleHeader
        title="🛍️ Shop"
        subtitle="Flow Fam Webshop"
      />

      <View style={styles.content}>
        <Text style={styles.shopTitle}>Welkom bij de Flow Fam Shop!</Text>
        <Text style={styles.shopDescription}>
          Ontdek onze collectie producten die je helpen om meer rust, structuur en verbinding in je gezinsleven te brengen.
        </Text>

        <TouchableOpacity
          style={[styles.shopButton, { backgroundColor: accentColor }]}
          onPress={handleOpenShop}
        >
          <IconSymbol
            ios_icon_name="cart"
            android_material_icon_name="shopping-cart"
            size={24}
            color={colors.card}
          />
          <Text style={styles.shopButtonText}>Bezoek de webshop</Text>
        </TouchableOpacity>

        <Text style={styles.shopUrl}>www.flowfam.nl</Text>
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
    paddingBottom: 100,
  },
  shopTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Poppins_700Bold',
  },
  shopDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
    fontFamily: 'Nunito_400Regular',
  },
  shopButton: {
    borderRadius: 25,
    paddingHorizontal: 40,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
    marginBottom: 20,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.card,
    fontFamily: 'Poppins_700Bold',
  },
  shopUrl: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
});
