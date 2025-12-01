
# Dynamic Module Theming System

## Overview
This app now features a dynamic theming system where each module automatically uses its own accent color based on the homepage icon colors.

## Module Color Mapping

The following modules have their designated colors:

- **Agenda** → Blue (#4A90E2)
- **Taken** → Light Green (#7ED321)
- **Boodschappen** → Orange (#F5A623)
- **Financiën** → Green (#34C759)
- **Fotoboek** → Purple (#9013FE)
- **Maaltijden** → Pink (#FF6B9D)
- **Notities** → Orange (#F5A623)
- **Documenten** → Turquoise (#50E3C2)
- **Shop** → Mint/Turquoise (#50E3C2)
- **Profiel** → Grey (#999999)

## How It Works

### 1. ThemeContext (`contexts/ThemeContext.tsx`)
- Manages the current module's accent color
- Provides `useModuleTheme()` hook for accessing the current accent color
- Provides `useModuleColor(module)` hook for getting a specific module's color
- Exports `MODULE_COLORS` constant with all color mappings

### 2. ModuleHeader Component (`components/ModuleHeader.tsx`)
- Reusable header component that automatically uses the module's accent color
- Features:
  - Colored header bar with rounded bottom corners
  - White text for contrast
  - Semi-transparent back/add buttons
  - Title and optional subtitle

### 3. ThemedButton Component (`components/ThemedButton.tsx`)
- Reusable button component that uses the module's accent color
- Variants:
  - `primary`: Filled with accent color
  - `secondary`: Background color fill
  - `outline`: Transparent with accent color border
- Supports icons and custom styling

## Usage in Screens

### Setting the Module Theme
Each screen should set its module theme on mount:

```typescript
import { useModuleTheme, ModuleName } from '@/contexts/ThemeContext';

export default function MyModuleScreen() {
  const { setModule, accentColor } = useModuleTheme();
  
  useEffect(() => {
    setModule('agenda' as ModuleName); // Replace with your module name
  }, [setModule]);
  
  // Use accentColor for dynamic styling
  return (
    <View style={[styles.element, { backgroundColor: accentColor }]}>
      {/* ... */}
    </View>
  );
}
```

### Using ModuleHeader
```typescript
<ModuleHeader
  title="Module Title"
  subtitle="Optional subtitle"
  showBackButton={true}
  showAddButton={true}
  onAddPress={() => setShowModal(true)}
/>
```

### Using ThemedButton
```typescript
<ThemedButton
  title="Add Item"
  onPress={handleAdd}
  icon="plus"
  androidIcon="add"
  variant="primary"
/>
```

## What Gets Themed

### Automatically Themed Elements:
- ✅ Header bar background
- ✅ Primary buttons
- ✅ Checkboxes and selection indicators
- ✅ Progress bars
- ✅ Active tab indicators
- ✅ Icon backgrounds
- ✅ Chips and badges
- ✅ Accent highlights

### Stays Consistent:
- ✅ Background color (#F9F6F1 beige)
- ✅ Text colors (for readability)
- ✅ Card backgrounds (white)
- ✅ Secondary UI elements

## Adding New Modules

To add a new module with its own color:

1. **Add color to `MODULE_COLORS` in `contexts/ThemeContext.tsx`:**
```typescript
export const MODULE_COLORS = {
  // ... existing colors
  newModule: '#FF5733', // Your color
} as const;
```

2. **Update the module type:**
```typescript
export type ModuleName = keyof typeof MODULE_COLORS;
```

3. **In your screen, set the module:**
```typescript
useEffect(() => {
  setModule('newModule' as ModuleName);
}, [setModule]);
```

4. **Use ModuleHeader and ThemedButton components**

That's it! The theme system will automatically apply your color throughout the module.

## Design Principles

- **Consistency**: Background stays beige, text stays readable
- **Visual Hierarchy**: Accent colors guide attention to interactive elements
- **Accessibility**: High contrast between accent colors and text
- **Intuitive Navigation**: Users immediately recognize which module they're in
- **Extensibility**: Easy to add new modules with minimal code changes

## Technical Notes

- The theme context is provided at the root level in `app/_layout.tsx`
- Each screen is responsible for setting its own module theme
- The `accentColor` from `useModuleTheme()` can be used anywhere in the component
- For static references (like homepage icons), use `useModuleColor(moduleName)`
- All themed components gracefully fall back to default colors if theme is not set
