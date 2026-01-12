# Firebase Cloud Messaging Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in your React Native app.

## Prerequisites

1. A Firebase account (create one at https://firebase.google.com/)
2. Your app's bundle identifier/package name:
   - Android: `com.bookitall` (from `android/app/build.gradle`)
   - iOS: Check in Xcode project settings

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable Google Analytics (optional but recommended)

## Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon (or "Add app")
2. Enter your package name: `com.bookitall`
3. Enter app nickname (optional): `BookItAll Android`
4. Enter SHA-1 (optional for now, needed for production)
5. Click "Register app"
6. **Download `google-services.json`**
7. Place the file in: `android/app/google-services.json`

### Getting SHA-1 for Android (Production)

For debug:
```bash
cd android
./gradlew signingReport
```

Look for SHA1 in the output under `Variant: debug`

For release keystore:
```bash
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Add SHA-1 in Firebase Console → Project Settings → Your Android App

## Step 3: Add iOS App to Firebase

1. In Firebase Console, click the iOS icon (or "Add app")
2. Enter your bundle ID (check in Xcode: `ios/bookitall.xcodeproj`)
3. Enter app nickname (optional): `BookItAll iOS`
4. Enter App Store ID (optional, can add later)
5. Click "Register app"
6. **Download `GoogleService-Info.plist`**
7. Open Xcode: `ios/bookitall.xcworkspace` (NOT .xcodeproj)
8. Drag and drop `GoogleService-Info.plist` into the `bookitall` folder in Xcode
9. Make sure "Copy items if needed" is checked
10. Make sure it's added to the `bookitall` target

## Step 4: Install iOS Pods

After adding the iOS app, run:

```bash
cd ios
pod install
cd ..
```

## Step 5: Enable Firebase Cloud Messaging API

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Enable "Cloud Messaging API (Legacy)" if prompted
3. For Android, ensure "Cloud Messaging API (V1)" is enabled in Google Cloud Console

## Step 6: Configure iOS Capabilities

1. Open `ios/bookitall.xcworkspace` in Xcode
2. Select the `bookitall` target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add "Push Notifications"
6. Add "Background Modes" and check "Remote notifications"

## Step 7: Verify Configuration

### Android
- ✅ `google-services.json` is in `android/app/`
- ✅ `android/build.gradle` has Google Services classpath
- ✅ `android/app/build.gradle` applies `com.google.gms.google-services` plugin
- ✅ Permissions are in `AndroidManifest.xml`

### iOS
- ✅ `GoogleService-Info.plist` is in Xcode project
- ✅ Pods are installed (`cd ios && pod install`)
- ✅ Push Notifications capability is enabled
- ✅ Background Modes → Remote notifications is enabled

## Step 8: Test the Setup

1. Build and run the app
2. Navigate to Dashboard screen
3. You should see the notification permission prompt
4. Grant permission
5. Check console logs for FCM token

## Troubleshooting

### Android Issues

**Error: "google-services.json not found"**
- Make sure the file is in `android/app/` (not `android/`)
- Clean and rebuild: `cd android && ./gradlew clean`

**Error: "Default FirebaseApp is not initialized"**
- Verify `google-services.json` is correct
- Check that Google Services plugin is applied in `build.gradle`

### iOS Issues

**Error: "No Firebase App '[DEFAULT]' has been created"**
- Verify `GoogleService-Info.plist` is in Xcode project
- Make sure it's added to the target
- Run `pod install` again

**Error: "APNs token not available"**
- Make sure Push Notifications capability is enabled
- Run on a real device (not simulator) for testing
- Check that you're signed in with a valid Apple Developer account

**Build Error: "No such module 'Firebase'"**
- Run `cd ios && pod install`
- Open `.xcworkspace` file, not `.xcodeproj`

## Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [React Native Firebase Documentation](https://rnfirebase.io/)
- [FCM Setup Guide](https://rnfirebase.io/messaging/usage)

## Next Steps

After setup is complete:
1. Test notification permission flow
2. Verify FCM token is generated
3. Test sending notifications from Firebase Console
4. Implement notification handlers in your app

