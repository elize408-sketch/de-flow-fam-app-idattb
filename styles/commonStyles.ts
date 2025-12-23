
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Official Flow Fam Color Palette - Standardized
export const colors = {
  // Primary Flow Fam Colors
  warmOrange: '#f08a48',        // Primary brand color (CTA / focus)
  beige: '#cfa692',             // Secondary neutral (warm beige / sand)
  softCream: '#f4eae1',         // Background light (soft cream)
  darkBrown: '#4c3b34',         // Text dark (warm dark brown, not black)
  lightGrey: '#f5f5f5',         // Background white
  
  // Semantic mappings
  background: '#FFFFFF',        // Main background (white)
  backgroundAlt: '#f4eae1',     // Alternative background (soft cream)
  text: '#4c3b34',              // Primary text (dark brown)
  textSecondary: '#8a7a72',     // Secondary text (lighter brown)
  primary: '#f08a48',           // Primary buttons (warm orange)
  secondary: '#cfa692',         // Secondary buttons (beige)
  accent: '#f08a48',            // Accent color (warm orange)
  card: '#f5f5f5',              // Card background (light grey)
  cardAlt: '#FFFFFF',           // Alternative card (white)
  highlight: '#f08a48',         // Highlights (warm orange)
  shadow: 'rgba(76, 59, 52, 0.12)',  // Shadows (dark brown with transparency)
  border: 'rgba(76, 59, 52, 0.15)',  // Borders (dark brown with transparency)
  
  // Function colors (subtle accents only - not dominant)
  accentBlue: '#4A90E2',        // Agenda accent
  accentGreen: '#7ED321',       // Tasks accent
  accentOrange: '#f08a48',      // Boodschappen accent
  accentGreenAlt: '#34C759',    // Financiën accent
  accentRed: '#e53f59',         // Fotoboek accent
  accentPurple: '#9013FE',      // Contactboek accent
  
  // Legacy support (for gradual migration)
  vibrantPink: '#e53f59',
  vibrantBlue: '#4A90E2',
  vibrantGreen: '#7ED321',
  vibrantOrange: '#f08a48',
  vibrantPurple: '#9013FE',
  vibrantTeal: '#50E3C2',
  vibrantRed: '#e53f59',
  
  // Status colors (muted)
  success: '#7ED321',
  error: '#e53f59',
  warning: '#f08a48',
  info: '#4A90E2',
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
    backgroundColor: colors.cardAlt,
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
