# SubSave - Subscription Management App

A modern React Native app built with Expo, TypeScript, and React Native Paper for managing subscription services.

## Features

- 🎨 **Modern UI**: Built with React Native Paper and Material Design 3
- 🌙 **Dark/Light Theme**: Automatic theme switching with manual override
- 📱 **Cross-Platform**: Works on iOS, Android, and Web
- 🗂️ **Vault Management**: Organize subscriptions into vaults
- 📊 **Dashboard**: Overview of all subscriptions and spending
- 🔔 **Notifications**: Stay updated with billing reminders
- ⚙️ **Settings**: Customize your app experience

## Screens

- **Login**: Authentication screen with email/password
- **Dashboard**: Main screen showing subscription vaults
- **Vault Detail**: Detailed view of subscriptions in a vault
- **Add Subscription**: Form to add new subscriptions
- **Notifications**: Billing reminders and app notifications
- **Settings**: Theme, notifications, and account settings

## Tech Stack

- **Expo**: React Native development platform
- **TypeScript**: Type-safe JavaScript
- **Expo Router**: File-based routing
- **React Native Paper**: Material Design components
- **React Native Safe Area Context**: Safe area handling

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platforms:
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

## Project Structure

```
app/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── TextInput.tsx
│   └── index.ts
├── screens/            # Screen components
├── utils/              # Utilities and theme
│   ├── theme.ts
│   └── theme-context.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── (tabs)/             # Tab navigation screens
│   ├── dashboard.tsx
│   ├── notifications.tsx
│   ├── settings.tsx
│   └── _layout.tsx
├── _layout.tsx         # Root layout
├── index.tsx           # Entry point
├── login.tsx           # Login screen
├── vaultDetail.tsx     # Vault detail screen
└── addSubscription.tsx # Add subscription screen
```

## Components

### Wrapper Components

- **Button**: Customizable button with variants (primary, secondary, outlined, text)
- **Card**: Flexible card component with different styles (elevated, outlined, filled)
- **TextInput**: Enhanced text input with Material Design styling

### Theme System

The app supports both light and dark themes with automatic system detection:

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Easy-on-eyes dark interface
- **Auto Mode**: Follows system theme preference

## Development

The app uses Expo Router for navigation with file-based routing. Each screen is a separate file in the `app` directory, and the routing structure follows the file hierarchy.

### Adding New Screens

1. Create a new file in the appropriate directory
2. Export a default React component
3. The route will be automatically available based on the file path

### Styling

The app uses React Native Paper's theming system. Access the current theme using the `useTheme` hook:

```typescript
import { useTheme } from '@/utils/theme-context';

const { theme, isDark, setThemeMode } = useTheme();
```

## License

MIT License - see LICENSE file for details.
