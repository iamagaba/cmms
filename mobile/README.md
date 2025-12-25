# CMMS Mobile Technician App

A React Native mobile application for field technicians to manage work orders, assets, and inventory in the field.

## Project Structure

```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── common/         # Common components (LoadingSpinner, ErrorBoundary)
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components organized by feature
│   │   ├── auth/          # Authentication screens
│   │   ├── dashboard/     # Dashboard screens
│   │   ├── workorders/    # Work order screens
│   │   ├── assets/        # Asset management screens
│   │   └── profile/       # Profile and settings screens
│   ├── services/          # API services and business logic
│   ├── store/             # State management (Zustand)
│   ├── theme/             # Theme configuration
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── test/              # Test setup and utilities
├── android/               # Android-specific files (generated)
├── ios/                   # iOS-specific files (generated)
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (>= 18)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install iOS dependencies (macOS only):
   ```bash
   cd ios && pod install && cd ..
   ```

### Configuration

The app is pre-configured to use the same Supabase instance as the web application. The configuration includes:

- **Supabase URL**: `https://ohbcjwshjvukitbmyklx.supabase.co`
- **Secure Token Storage**: Uses React Native Keychain for sensitive data
- **Automatic Token Refresh**: Handles token expiration automatically
- **Biometric Authentication**: Supports Face ID/Touch ID/Fingerprint

### Running the App

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

#### Start Metro Bundler
```bash
npm start
```

## Development

### Code Style

The project uses ESLint and Prettier for code formatting. Run:

```bash
npm run lint
```

### Testing

Run tests with:

```bash
npm test
```

### Type Checking

Run TypeScript type checking:

```bash
npm run typecheck
```

## Features Implemented

### ✅ Phase 1: Foundation
- [x] Project setup with TypeScript and React Native
- [x] Authentication with Supabase integration
- [x] Biometric authentication support
- [x] Secure token storage with automatic refresh
- [x] Network connectivity monitoring
- [x] Bottom tab navigation
- [x] Error boundaries and loading states
- [x] Theme configuration matching web app
- [x] Comprehensive testing setup

### 🚧 In Progress
- Work order management
- Location services
- Parts and inventory management
- Asset management with QR scanning

### 📋 Planned
- Push notifications
- Performance metrics
- Emergency handling
- Comprehensive testing

## Architecture

The app follows a feature-based architecture with:

- **Navigation**: React Navigation 6 with bottom tabs
- **State Management**: TanStack Query for server state, Zustand for local state
- **UI Components**: React Native Paper with Material Design 3
- **Authentication**: Supabase Auth with secure token storage
- **Backend**: Existing Supabase infrastructure from web app

## Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Ensure TypeScript strict mode compliance

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx react-native start --reset-cache`
2. **iOS build issues**: Clean build folder in Xcode or run `cd ios && xcodebuild clean`
3. **Android build issues**: Clean project with `cd android && ./gradlew clean`

### Dependencies

If you encounter dependency issues:

1. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
2. For iOS: `cd ios && rm -rf Pods && pod install`
3. Reset Metro cache: `npx react-native start --reset-cache`