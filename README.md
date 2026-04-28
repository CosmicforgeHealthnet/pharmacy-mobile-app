# Pharmacy Mobile App 💊

A modern React Native mobile application built with Expo for managing pharmaceutical services. Users can order medicines, consult with healthcare professionals, and manage their health conveniently.

## Features

- **Onboarding Flow**: Beautiful animated onboarding screens with smooth transitions
- **Authentication**: Secure login and registration system
- **Theme System**: Customizable light/dark mode with primary color (#272EA7)
- **Responsive UI**: Mobile-first design with reusable components
- **Modern Components**: Button, Input, and other UI components with consistent styling

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet with custom theme system
- **Storage**: AsyncStorage + Secure Store for data persistence
- **Icons**: Expo Vector Icons (Ionicons)

## Project Structure

```
src/
├── app/                 # Navigation & routing
│   ├── (auth)/         # Authentication routes
│   ├── (tabs)/         # Main app routes
│   ├── onboarding.tsx  # Onboarding screen
│   ├── index.tsx       # Entry point with bootstrap logic
│   └── _layout.tsx     # Root layout
├── core/               # Core functionality
│   ├── api/           # API client setup
│   ├── auth/          # Authentication logic
│   ├── hooks/         # Custom hooks
│   ├── providers/     # Context providers
│   ├── socket/        # WebSocket connections
│   └── storage/       # Storage management
├── features/          # Feature modules
│   ├── authentication/
│   ├── onboarding/
│   └── ...
├── shared/            # Shared resources
│   ├── components/    # Reusable components
│   ├── constants/     # App constants & theme
│   └── hooks/         # Shared hooks
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Install additional packages if needed:
   ```bash
   npm install expo-secure-store
   ```

### Running the App

Start the development server:

```bash
npm start
```

Then open the app in:

- **Expo Go**: Scan the QR code with Expo Go app
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i`
- **Web**: Press `w`

## Theme System

The app uses a centralized theme system with customizable colors:

```typescript
Colors = {
  primary: "#272EA7",
  text: "#030303",
  background: "#FFFFFF",
  inputBackground: "#F5F5F5",
  placeholder: "#8F90A4",
};
```

Access theme colors in components:

```typescript
const { colors } = Colors[colorScheme ?? "light"];
```

## Key Components

### Button

Versatile button component with multiple variants:

- **Primary**: Theme color background
- **Secondary**: Bordered style
- **Outline**: Transparent with border

### Input

Form input with built-in validation:

- Theme-aware styling
- Label support
- Error messages
- Icon support

### DotIndicator

Beautiful animated dot indicator for carousels and onboarding.

## Development

### File Structure

- `src/app/`: Navigation routes
- `src/features/`: Feature-specific code
- `src/shared/`: Reusable components and utilities
- `src/core/`: Core app functionality

### Adding New Features

1. Create feature folder in `src/features/`
2. Structure: `components/`, `hooks/`, `services/`, `types/`, `utils/`
3. Import and use in routes

### Styling

- Use StyleSheet from React Native
- Access theme colors from `Colors` constant
- Create responsive designs using flexbox

## Build & Deployment

### EAS Build

Build for production:

```bash
eas build --platform ios
eas build --platform android
```

### Deployment

Configure in `eas.json` and deploy to app stores.

## Environment Setup

Create `.env` file with API endpoints:

```
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_SOCKET_URL=your_socket_url
```

## Troubleshooting

### Port Already in Use

If port 8081 is busy, Expo will prompt to use 8082 instead.

### Clear Cache

```bash
npm start --clear
```

### Reset Project

```bash
npm run reset-project
```

## Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Guide](https://docs.expo.dev/router/introduction/)

## Support

For issues or questions, please check the project documentation or contact the development team.

---

Happy coding! 🚀
