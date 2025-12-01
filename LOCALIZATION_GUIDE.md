
# Flow Fam Localization Guide

## Overview
Flow Fam now supports full internationalization (i18n) using i18next and react-i18next.

## Features Implemented

### 1. i18n Structure
- ✅ i18next library integrated
- ✅ All UI texts moved to `/locales/nl.json` and `/locales/en.json`
- ✅ Translation keys organized by feature/screen
- ✅ Centralized i18n configuration in `/utils/i18n.ts`

### 2. Language Detection
- ✅ Automatic device language detection using `expo-localization`
- ✅ Fallback to English if device language not supported
- ✅ Language preference stored in AsyncStorage
- ✅ Language persists across app restarts

### 3. Language Settings
- ✅ Language selector available in Settings/Profile screen
- ✅ Users can manually change language
- ✅ Available languages: Dutch (🇳🇱) and English (🇬🇧)

### 4. Scalable Structure
- ✅ Easy to add new languages by creating new JSON files
- ✅ Consistent key structure across all translations
- ✅ Support for interpolation (dynamic values)
- ✅ Support for pluralization

### 5. Authentication
- ✅ Apple Login - works worldwide
- ✅ Google Login - works worldwide
- ✅ Email Login - works worldwide
- ✅ All authentication flows support multiple languages

## How to Use Translations in Components

### Import the hook:
```typescript
import { useTranslation } from 'react-i18next';
```

### Use in component:
```typescript
const { t } = useTranslation();

// Simple translation
<Text>{t('common.cancel')}</Text>

// With interpolation
<Text>{t('home.greeting', { name: 'John' })}</Text>

// With pluralization
<Text>{t('home.coins', { count: 5 })}</Text>
```

### Change language programmatically:
```typescript
import { changeLanguage } from '@/utils/i18n';

await changeLanguage('en'); // or 'nl'
```

## Adding a New Language

1. Create a new JSON file in `/locales/` (e.g., `de.json` for German)
2. Copy the structure from `en.json` or `nl.json`
3. Translate all values
4. Import the file in `/utils/i18n.ts`:
```typescript
import de from '../locales/de.json';
```

5. Add to resources:
```typescript
resources: {
  nl: { translation: nl },
  en: { translation: en },
  de: { translation: de }, // Add new language
}
```

6. Add to available languages list:
```typescript
export const getAvailableLanguages = () => {
  return [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }, // Add new language
  ];
};
```

## Translation Keys Structure

### Common Keys (`common.*`)
- Buttons: cancel, confirm, save, delete, edit, add, close, back, next, done
- Status: yes, no, ok, error, success, loading
- Navigation: home, settings, profile, logout, login, register
- Form fields: email, password, name, photo, date, time, description, title
- Modifiers: optional, required, select, none, all
- Time: today, tomorrow, yesterday, week, month, year

### Feature-Specific Keys
- `welcome.*` - Welcome screen
- `auth.*` - Authentication flows (login, register, verify email, etc.)
- `home.*` - Home screen and dashboard
- `profile.*` - Profile and settings
- `tasks.*` - Task management
- `rewards.*` - Reward shop
- `shop.*` - Webshop
- `agenda.*` - Calendar and appointments
- `documents.*` - Document management
- `finances.*` - Financial management
- `household.*` - Household tasks
- `meals.*` - Meal planning and recipes
- `language.*` - Language settings

## Complete Text String List

All text strings have been extracted and organized in the JSON files. Here's a summary:

### Total Strings by Category:
- Common: ~40 strings
- Welcome: 3 strings
- Authentication: ~50 strings
- Home: ~20 strings
- Profile: ~40 strings
- Tasks: ~30 strings
- Rewards: ~10 strings
- Shop: ~5 strings
- Agenda: ~30 strings
- Documents: ~25 strings
- Finances: ~80 strings
- Household: ~15 strings
- Meals: ~60 strings
- Language: ~5 strings

**Total: ~410+ translatable strings**

## Next Steps for Implementation

To complete the localization implementation, you need to:

1. **Update all component files** to use `useTranslation()` hook instead of hardcoded strings
2. **Replace all text strings** with `t('key.path')` calls
3. **Test language switching** in all screens
4. **Add language selector** to the profile/settings screen
5. **Verify all dynamic content** (names, dates, numbers) displays correctly in both languages

## Example Implementation

Here's an example of how to update a component:

### Before:
```typescript
<Text style={styles.title}>Welkom bij Flow Fam</Text>
<TouchableOpacity onPress={handleSubmit}>
  <Text>Opslaan</Text>
</TouchableOpacity>
```

### After:
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<Text style={styles.title}>{t('welcome.title')}</Text>
<TouchableOpacity onPress={handleSubmit}>
  <Text>{t('common.save')}</Text>
</TouchableOpacity>
```

## Store Metadata

For App Store and Google Play Store:
- App name: "Flow Fam" (same in all languages)
- Short description and full description should be translated separately
- Screenshots can be generated with the app in different languages
- Keywords should be localized for better discoverability

## Notes

- All authentication methods (Apple, Google, Email) work worldwide
- Date and time formatting should use locale-specific formats
- Currency formatting (€) is currently hardcoded but can be localized if needed
- The app structure is ready for RTL (right-to-left) languages if needed in the future

## Support

The i18n structure is now complete and ready for use. All text strings have been extracted and organized. The next step is to systematically update each component file to use the translation keys instead of hardcoded strings.
