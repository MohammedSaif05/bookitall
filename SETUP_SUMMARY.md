# Firebase Setup Summary

## ✅ What Has Been Done

### 1. Permissions Added

**Android (`android/app/src/main/AndroidManifest.xml`):**
- ✅ `POST_NOTIFICATIONS` permission (Android 13+)
- ✅ `WAKE_LOCK` permission (for FCM)
- ✅ `VIBRATE` permission (for notifications)

**iOS (`ios/bookitall/Info.plist`):**
- ✅ `UIBackgroundModes` with `remote-notification` (for background notifications)

### 2. Firebase Configuration Added

**Android (`android/build.gradle`):**
- ✅ Google Services classpath: `com.google.gms:google-services:4.4.2`

**Android (`android/app/build.gradle`):**
- ✅ Applied `com.google.gms.google-services` plugin

### 3. Code Implementation
- ✅ Notification permission utilities
- ✅ Device info utilities
- ✅ Device registration API
- ✅ Dashboard integration

## 📋 What You Need to Do

### Step 1: Get Firebase Configuration Files

#### For Android - `google-services.json`:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Click "Add app" → Select Android icon
4. Enter package name: `com.bookitall`
5. Download `google-services.json`
6. **Place it here:** `android/app/google-services.json`

**File location:**
```
bookitall/
└── android/
    └── app/
        └── google-services.json  ← Place here
```

#### For iOS - `GoogleService-Info.plist`:

1. In Firebase Console, click "Add app" → Select iOS icon
2. Enter Bundle ID (check in Xcode or it's usually `com.bookitall`)
3. Download `GoogleService-Info.plist`
4. **Add to Xcode project:**
   - Open `ios/bookitall.xcworkspace` in Xcode (NOT .xcodeproj)
   - Drag and drop the file into the `bookitall` folder
   - Make sure "Copy items if needed" is checked
   - Make sure it's added to the `bookitall` target

**File location:**
```
bookitall/
└── ios/
    └── bookitall/
        └── GoogleService-Info.plist  ← Add via Xcode
```

### Step 2: Install iOS Pods

After adding `GoogleService-Info.plist`, run:

```bash
cd ios
pod install
cd ..
```

**Important:** Always open `ios/bookitall.xcworkspace` (NOT `.xcodeproj`) after running pod install.

### Step 3: Enable iOS Capabilities in Xcode

1. Open `ios/bookitall.xcworkspace` in Xcode
2. Select the `bookitall` target
3. Go to "Signing & Capabilities" tab
4. Click "+ Capability"
5. Add **"Push Notifications"**
6. Add **"Background Modes"** and check **"Remote notifications"**

### Step 4: Enable Firebase Cloud Messaging API

1. Go to Firebase Console → Your Project
2. Go to Project Settings → Cloud Messaging
3. Enable "Cloud Messaging API (Legacy)" if prompted
4. For Android, also enable "Cloud Messaging API (V1)" in [Google Cloud Console](https://console.cloud.google.com/)

### Step 5: Get SHA-1 for Android (Optional but Recommended)

For debug builds:
```bash
cd android
./gradlew signingReport
```

Look for SHA1 in the output. Add it to Firebase Console:
- Firebase Console → Project Settings → Your Android App → Add SHA certificate fingerprint

### Step 6: Test the Setup

1. Clean and rebuild:
   ```bash
   # Android
   cd android && ./gradlew clean && cd ..
   
   # iOS
   cd ios && pod install && cd ..
   ```

2. Run the app:
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   ```

3. Navigate to Dashboard screen
4. You should see notification permission prompt
5. Grant permission
6. Check console for FCM token

## 🔍 Verification Checklist

### Android:
- [ ] `google-services.json` is in `android/app/` folder
- [ ] `android/build.gradle` has Google Services classpath
- [ ] `android/app/build.gradle` applies Google Services plugin
- [ ] Permissions are in `AndroidManifest.xml`
- [ ] App builds without errors

### iOS:
- [ ] `GoogleService-Info.plist` is in Xcode project
- [ ] Pods are installed (`cd ios && pod install`)
- [ ] Push Notifications capability is enabled
- [ ] Background Modes → Remote notifications is enabled
- [ ] App builds without errors

## 🐛 Common Issues & Solutions

### Android: "google-services.json not found"
- Make sure file is in `android/app/` (not `android/`)
- Clean build: `cd android && ./gradlew clean`

### iOS: "No Firebase App '[DEFAULT]' has been created"
- Verify `GoogleService-Info.plist` is in Xcode project
- Make sure it's added to the target
- Run `pod install` again

### iOS: "No such module 'Firebase'"
- Run `cd ios && pod install`
- Open `.xcworkspace` file, NOT `.xcodeproj`

### iOS: Push notifications not working
- Make sure Push Notifications capability is enabled
- Test on real device (simulator has limitations)
- Check Apple Developer account is valid

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [FCM Setup Guide](https://rnfirebase.io/messaging/usage)

## 🎯 Next Steps After Setup

1. Test notification permission flow
2. Verify FCM token is generated (check console logs)
3. Test sending notifications from Firebase Console
4. Implement notification handlers (foreground/background)

---

**Note:** The detailed setup guide is in `FIREBASE_SETUP_GUIDE.md`

