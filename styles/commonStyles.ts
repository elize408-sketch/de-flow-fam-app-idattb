
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Official Flow Fam Color Palette
export const colors = {
  // Primary Flow Fam Colors
  redPink: '#e53f59',           // red/pink - primary accent
  beige: '#cfa692',             // soft beige-rose - secondary accent
  warmOrange: '#f08a48',        // warm orange - primary buttons
  softCream: '#f4eae1',         // soft cream - backgrounds
  darkBrown: '#4c3b34',         // dark brown - text
  lightGrey: '#f5f5f5',         // light grey - cards/surfaces
  
  // Semantic mappings
  background: '#f4eae1',        // soft cream
  text: '#4c3b34',              // dark brown
  textSecondary: '#8a7a72',     // lighter brown for secondary text
  primary: '#e53f59',           // red/pink
  secondary: '#cfa692',         // soft beige-rose
  accent: '#f08a48',            // warm orange
  card: '#f5f5f5',              // light grey
  highlight: '#e53f59',         // red/pink for highlights
  shadow: 'rgba(76, 59, 52, 0.12)',  // dark brown with transparency
  
  // Additional UI colors derived from palette
  vibrantPink: '#e53f59',       // red/pink
  vibrantBlue: '#4A90E2',       // Keep for specific modules
  vibrantGreen: '#7ED321',      // Keep for specific modules
  vibrantOrange: '#f08a48',     // warm orange
  vibrantPurple: '#9013FE',     // Keep for specific modules
  vibrantTeal: '#50E3C2',       // Keep for specific modules
  vibrantRed: '#e53f59',        // red/pink
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.warmOrange,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.beige,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10,
    fontFamily: 'Poppins_700Bold',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: 'Nunito_400Regular',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    width: '100%',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 3,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: colors.accent,
  },
});
