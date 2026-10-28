# ElimuTrack Teacher Android App

This app wraps the ElimuTrack web app for teachers to use on their Android phones. The admin creates teacher logins on the web dashboard, and teachers use those same credentials to log in on the mobile app.

## Features
- Teacher login with school credentials (created by admin)
- All teacher functions: Attendance, Marksbook, Lesson Plans, Schemes of Work, Timetable, Record of Work, Progress, Fees, etc.
- Role-based - only shows modules assigned by admin
- Class-restricted - only sees classes assigned to them
- Works offline-aware (connects to your deployed server)

## Prerequisites
1. [Node.js](https://nodejs.org/) installed
2. [Android Studio](https://developer.android.com/studio) installed
3. Android SDK configured
4. Java JDK 17

## Building the APK

### Option 1: Using Android Studio (Recommended)

1. Install dependencies:
```bash
npm install
```

2. Build the web app:
```bash
npm run build
```

3. Add Android platform (first time only):
```bash
npx cap add android
```

4. Sync Capacitor:
```bash
npx cap sync android
```

5. Open in Android Studio:
```bash
npx cap open android
```

6. In Android Studio:
   - Wait for Gradle sync to complete
   - Connect your Android phone via USB with USB debugging enabled, or use an emulator
   - Click Run (green play button) to install on device
   - Or Build > Build Bundle(s)/APK(s) > Build APK(s) to generate APK

### Option 2: Command Line Build

After syncing:
```bash
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

For release APK:
```bash
./gradlew assembleRelease
```

## Configuration

The app is configured to connect to:
- Production: `https://site-4457d1964dd64e19ba7fec208a2066ee.freebuff.page`

To change the server URL, edit `capacitor.config.ts` and run `npx cap sync android` again.

## Installation on Teachers' Phones

1. Build the APK using Android Studio
2. Transfer the APK to teachers' phones (via WhatsApp, email, or USB)
3. On Android, allow installation from unknown sources
4. Install and open the app
5. Teachers login with the username/password created by the admin

## Notes
- The app uses the same backend as the web app
- Admin still manages teachers from the web dashboard (PC)
- Teachers can use either the web app or this Android app
- All data syncs in real-time through the same server
