# ElimuTrack Teacher - Android App (Kotlin + Jetpack Compose)

Native Android app for teachers to access ElimuTrack School Management System.

## Features
- Teacher authentication with credentials created by school administrator
- Dashboard with all teacher modules
- Material Design 3 UI with dark theme
- Jetpack Compose UI
- MVVM architecture with Hilt dependency injection
- Retrofit for API communication

## Building the App

### Prerequisites
- Android Studio Hedgehog or later
- Android SDK 34
- JDK 17

### Steps
1. Open Android Studio
2. Open the `ElimuTrackTeacher` folder as a project
3. Wait for Gradle sync to complete
4. Run on emulator or physical device

### Building APK
1. In Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s)
2. Or via command line: `./gradlew assembleDebug`
3. APK will be at: `app/build/outputs/apk/debug/app-debug.apk`

## API Configuration
The app connects to: `https://site-4457d1964dd64e19ba7fec208a2066ee.freebuff.page`

To change the server URL, edit `app/src/main/java/com/elimutrack/teacher/di/NetworkModule.kt`

## Login
Teachers log in with the username and password created by the school administrator from the web dashboard.
