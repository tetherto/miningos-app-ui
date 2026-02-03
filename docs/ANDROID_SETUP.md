# Android Emulator Setup Guide

This document explains how to run the MiningOS app on an Android emulator using Capacitor.

## Prerequisites

### 1. Install Android Studio

Download and install [Android Studio](https://developer.android.com/studio) for your operating system.

### 2. Install Android SDK

During Android Studio installation, or via **Settings > Languages & Frameworks > Android SDK**:

1. Install the latest **Android SDK Platform** (e.g., Android 14 / API level 34)
2. Install **Android SDK Build-Tools**
3. Install **Android SDK Command-line Tools**
4. Install **Android Emulator**

### 3. Set Environment Variables

Add these to your shell profile (`~/.bashrc`, `~/.zshrc`, or equivalent):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

Reload your shell:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### 4. Create an Android Virtual Device (AVD)

1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click **Create Device**
4. Select a device (e.g., Pixel 6)
5. Select a system image (e.g., API 34)
6. Click **Finish**

## Running the App

### Quick Start

```bash
# Build the web app and sync to Android
npm run android:build

# Open in Android Studio (recommended for first time)
npm run android:open

# Or run directly on emulator/connected device
npm run android:run
```

### Step-by-Step Process

#### 1. Build the Web App

Build the web app for production:
```bash
npm run build
```

Or build with mock data (for demo/testing):
```bash
npm run build:demo
```

#### 2. Sync to Android

Copy the built web assets to the Android project:
```bash
npm run android:sync
```

#### 3. Open in Android Studio

```bash
npm run android:open
```

This opens the `android/` folder in Android Studio where you can:
- Run the app on an emulator
- Build an APK
- Configure signing for release builds

#### 4. Run on Emulator

From the command line (if you have an emulator or device connected):
```bash
npm run android:run
```

Or from Android Studio:
1. Select a device from the device dropdown
2. Click the **Run** button (green play icon)

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run android:sync` | Sync web assets to Android project |
| `npm run android:open` | Open Android project in Android Studio |
| `npm run android:run` | Build and run on connected device/emulator |
| `npm run android:build` | Build web app + sync to Android |

## Live Reload During Development

For development with live reload:

1. Start the Vite dev server:
   ```bash
   npm start
   ```

2. Update `capacitor.config.ts` to point to your dev server:
   ```typescript
   const config: CapacitorConfig = {
     // ... other config
     server: {
       url: 'http://YOUR_LOCAL_IP:3030',
       cleartext: true,
     },
   };
   ```

3. Sync and run:
   ```bash
   npm run android:sync
   npm run android:run
   ```

**Note:** Replace `YOUR_LOCAL_IP` with your machine's local IP address (e.g., `192.168.1.100`). The emulator cannot access `localhost` directly.

## Troubleshooting

### "ANDROID_HOME is not set"

Make sure you've set the environment variables as described in Prerequisites step 3.

### "No connected devices"

1. Ensure an emulator is running (start one from Android Studio's Device Manager)
2. Or connect a physical device with USB debugging enabled

### Build fails with Java errors

Ensure you have JDK 17+ installed and set as default:
```bash
java -version
```

If not, install via Android Studio or manually:
```bash
# macOS (using Homebrew)
brew install openjdk@17

# Ubuntu/Debian
sudo apt install openjdk-17-jdk
```

### App shows blank screen

1. Check the browser console in Android Studio's Logcat for JavaScript errors
2. Ensure the web build completed successfully
3. Try rebuilding: `npm run android:build`

### Network requests fail

For development with a backend:
1. Ensure your backend is accessible from the emulator
2. Use your machine's local IP instead of `localhost`
3. Check that `android:allowMixedContent` is enabled in `capacitor.config.ts`

## Building for Release

### Generate Signed APK

1. Open in Android Studio: `npm run android:open`
2. Go to **Build > Generate Signed Bundle / APK**
3. Select **APK**
4. Create or select a keystore
5. Choose **release** build variant
6. Click **Finish**

The APK will be in `android/app/release/`

### Generate App Bundle (for Play Store)

1. Open in Android Studio: `npm run android:open`
2. Go to **Build > Generate Signed Bundle / APK**
3. Select **Android App Bundle**
4. Follow the signing steps
5. Click **Finish**

## Project Structure

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── assets/
│   │       │   └── public/     # Web app files (synced from build/)
│   │       ├── java/           # Native Android code
│   │       └── res/            # Android resources (icons, etc.)
│   ├── build.gradle            # App-level Gradle config
│   └── proguard-rules.pro      # ProGuard rules
├── gradle/                     # Gradle wrapper
└── build.gradle                # Project-level Gradle config
```

## Capacitor Configuration

The app is configured via `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.miningos.app',
  appName: 'MiningOS',
  webDir: 'build',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Android Emulator Documentation](https://developer.android.com/studio/run/emulator)
