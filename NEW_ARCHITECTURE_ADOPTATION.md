# New Architecture Adoption (Bookitallpartner)

Comprehensive snapshot of everything configured to run this app on React Native **New Architecture (Fabric + TurboModules)**. Use it as a checklist when cloning this setup into a new project.

## 1) Environment & Tooling (copy/paste)
- React Native `0.82.1`, React `19.1.1`, TypeScript `^5.8.3`, Hermes enabled.
- Node `>=20` (see `engines` in `package.json`).
- CLI: `@react-native-community/cli@20.0.0` (both Android/iOS platforms).
- Metro + NativeWind + SVG transformer wired.

Key root files to replicate:
```json
// package.json (essential parts)
{
  "name": "Bookitallpartner",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "android:release": "react-native run-android --mode=release",
    "ios": "react-native run-ios",
    "ios:release": "react-native run-ios --configuration Release",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "start": "react-native start",
    "start:reset": "react-native start --reset-cache",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "build:android:bundle": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res",
    "build:ios:bundle": "react-native bundle --platform ios --dev false --entry-file index.js --bundle-output ios/main.jsbundle --assets-dest ios",
    "clean": "cd android && ./gradlew clean && cd .. && cd ios && rm -rf build Pods Podfile.lock && cd ..",
    "clean:android": "cd android && ./gradlew clean && cd ..",
    "clean:ios": "cd ios && rm -rf build Pods Podfile.lock && cd .."
  },
  "engines": { "node": ">=20" }
}
```

## 2) Package Scripts (`package.json`)
- `android`, `android:release`, `ios`, `ios:release` – run platforms.
- Bundles: `build:android:bundle`, `build:ios:bundle`.
- Quality: `lint`, `lint:fix`, `type-check`, `test`, `test:watch`, `test:coverage`.
- Housekeeping: `start`, `start:reset`, `clean`, `clean:android`, `clean:ios`.

## 3) TypeScript & Babel (copy/paste)
`tsconfig.json`
```json
{
  "extends": "@react-native/typescript-config",
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-native",
    "moduleResolution": "bundler",
    "target": "esnext",
    "lib": ["esnext"],
    "baseUrl": ".",
    "types": ["nativewind/types"],
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", "**/*.d.ts", "src/**/*", "nativewind-env.d.ts"],
  "exclude": ["**/node_modules", "**/Pods", "**/__tests__", "**/__mocks__"]
}
```

`babel.config.js`
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@utils': './src/utils',
          '@types': './src/types',
        },
      },
    ],
  ],
};
```

## 4) Metro (`metro.config.js`)
```javascript
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json', 'mjs', 'cjs', 'svg'],
    assetExts: (defaultConfig.resolver?.assetExts || []).filter((ext) => ext !== 'js' && ext !== 'svg'),
  },
};

module.exports = withNativeWind(mergeConfig(defaultConfig, config), {
  input: './global.css',
});
```

## 5) React Native Config (`react-native.config.js`)
```javascript
/**
 * React Native Configuration
 * For New Architecture, let autolinking handle dependencies automatically
 */
module.exports = {
  project: {
    android: {
      sourceDir: './android',
      appName: 'app',
    },
    ios: {},
  },
  assets: ['./assets/fonts/'],
};
```

## 6) Entry Points
`index.js`
```javascript
import './global.css';
import { AppRegistry } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Hide native splash screen after React Native is registered
setTimeout(() => {
  RNBootSplash.hide({ fade: false }).catch(() => {});
}, 0);
setTimeout(() => {
  RNBootSplash.hide({ fade: false }).catch(() => {});
}, 50);
```

`App.tsx` (essentials)
```tsx
import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FlashMessage from 'react-native-flash-message';
import RNBootSplash from 'react-native-bootsplash';
import ErrorBoundary from './src/components/ErrorBoundary';
import SplashScreen from './src/components/SplashScreen';
import { RootNavigator } from './src/navigation';
import type { RootStackParamList } from './src/navigation/types';
import { userStorage } from './src/utils/storage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [shouldNavigateToSuccess, setShouldNavigateToSuccess] = useState(false);

  useLayoutEffect(() => {
    const hide = () => RNBootSplash.hide({ fade: false }).catch(() => {});
    const timeouts = [setTimeout(hide, 0), setTimeout(hide, 1), setTimeout(hide, 10), setTimeout(hide, 50), setTimeout(hide, 100)];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const userId = await userStorage.getUserId();
      const isOnBoardCompleted = await userStorage.getIsOnBoardCompleted();
      if (userId && isOnBoardCompleted) setShouldNavigateToSuccess(true);
    };
    checkOnboardingStatus();
  }, []);

  return (
    <ErrorBoundary onError={(error, info) => console.error('App Error:', error, info)}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {isSplashVisible ? (
          <SplashScreen onAnimationComplete={() => setIsSplashVisible(false)} />
        ) : (
          <AppContent shouldNavigateToSuccess={shouldNavigateToSuccess} />
        )}
        <FlashMessage position="bottom" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppContent({ shouldNavigateToSuccess }: { shouldNavigateToSuccess: boolean }) {
  const navigationRef = useRef(null);
  return (
    <RootNavigator
      ref={navigationRef}
      onReady={() => {}}
      initialAuthRoute={shouldNavigateToSuccess ? 'SuccessScreen' : 'GettingStarted'}
    />
  );
}

export default App;
```

## 7) Android New Architecture Setup (copy/paste)
`android/gradle.properties`
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
android.useAndroidX=true
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true
edgeToEdgeEnabled=false
org.gradle.caching=false
```

`android/settings.gradle`
```gradle
pluginManagement { includeBuild("../node_modules/@react-native/gradle-plugin") }
plugins { id("com.facebook.react.settings") }
extensions.configure(com.facebook.react.ReactSettingsExtension){ ex -> ex.autolinkLibrariesFromCommand() }
rootProject.name = 'Bookitallpartner'
include ':app'
includeBuild('../node_modules/@react-native/gradle-plugin')
```

`android/build.gradle` (root) — libc++ global patch
```gradle
buildscript {
    ext {
        buildToolsVersion = "36.0.0"
        minSdkVersion = 24
        compileSdkVersion = 36
        targetSdkVersion = 36
        ndkVersion = "27.1.12297006"
        kotlinVersion = "2.1.20"
    }
    repositories { google(); mavenCentral() }
    dependencies {
        classpath("com.android.tools.build:gradle")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
    }
}

apply plugin: "com.facebook.react.rootproject"

gradle.projectsEvaluated {
    subprojects { project ->
        def patchBuildNinja = { cxxDir ->
            if (cxxDir.exists()) {
                cxxDir.eachFileRecurse(groovy.io.FileType.FILES) { file ->
                    if (file.name == "build.ninja") {
                        def content = file.text
                        def newContent = content
                        if (content.contains("LINK_LIBRARIES") && content.contains("-latomic") && !content.contains("-lc++")) {
                            newContent = newContent.replaceAll(/(\s+)(-latomic)/, '$1 -lc++ $2')
                            if (newContent != content) {
                                file.text = newContent
                                println "✅ [${project.name}] Patched build.ninja to link libc++: ${file.path}"
                            }
                        }
                    }
                }
            }
        }
        project.tasks.matching { it.name.matches(".*configureCMake.*") }.configureEach { task ->
            doLast { patchBuildNinja(file("${project.projectDir}/.cxx")) }
        }
        project.tasks.matching { it.name.matches(".*buildCMake.*") }.configureEach { task ->
            doFirst { patchBuildNinja(file("${project.projectDir}/.cxx")) }
        }
    }
}
```

`android/app/build.gradle`
```gradle
apply plugin: "com.android.application"
apply plugin: "org.jetbrains.kotlin.android"
apply plugin: "com.facebook.react"

react { autolinkLibrariesWithApp() }

def enableProguardInReleaseBuilds = false
def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.+'

android {
    ndkVersion rootProject.ext.ndkVersion
    buildToolsVersion rootProject.ext.buildToolsVersion
    compileSdk rootProject.ext.compileSdkVersion

    namespace "com.bookitallpartner"
    defaultConfig {
        applicationId "com.bookitallpartner"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        ndk { abiFilters "armeabi-v7a", "arm64-v8a", "x86", "x86_64" }
    }
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
            debuggable true
        }
        release {
            signingConfig signingConfigs.debug
            minifyEnabled enableProguardInReleaseBuilds
            shrinkResources enableProguardInReleaseBuilds
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
            debuggable false
        }
    }
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}

afterEvaluate {
    def patchBuildNinja = { cxxDir ->
        if (cxxDir.exists()) {
            cxxDir.eachFileRecurse(groovy.io.FileType.FILES) { file ->
                if (file.name == "build.ninja") {
                    def content = file.text
                    def newContent = content
                    if (content.contains("LINK_LIBRARIES") && content.contains("-latomic") && !content.contains("-lc++")) {
                        newContent = newContent.replaceAll(/(\s+)(-latomic)/, '$1 -lc++ $2')
                        if (newContent != content) {
                            file.text = newContent
                            println "✅ Patched build.ninja to link libc++: ${file.path}"
                        }
                    }
                }
            }
        }
    }
    def patchAllCxxDirs = {
        def rootDir = file("${project.projectDir}/../..")
        patchBuildNinja(file("${project.projectDir}/.cxx"))
        def nodeModulesDir = file("${rootDir}/node_modules")
        if (nodeModulesDir.exists()) {
            nodeModulesDir.eachDir { moduleDir ->
                def moduleCxxDir = file("${moduleDir}/android/.cxx")
                patchBuildNinja(moduleCxxDir)
            }
        }
    }
    tasks.matching { it.name.matches(".*configureCMake.*") && it.project == project }.configureEach { task ->
        doLast { patchAllCxxDirs() }
    }
    tasks.matching { it.name.matches(".*buildCMake.*") }.configureEach { task ->
        doFirst {
            patchBuildNinja(file("${project.projectDir}/.cxx"))
            def nodeModulesDir = file("${project.projectDir}/../../node_modules")
            if (nodeModulesDir.exists()) {
                nodeModulesDir.eachDir { moduleDir ->
                    def moduleCxxDir = file("${moduleDir}/android/.cxx")
                    patchBuildNinja(moduleCxxDir)
                }
            }
        }
    }
}

dependencies {
    implementation("com.facebook.react:react-android")
    if (hermesEnabled.toBoolean()) {
        implementation("com.facebook.react:hermes-android")
    } else {
        implementation jscFlavor
    }
}
```

`android/app/src/main/AndroidManifest.xml`
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

  <application
    android:name=".MainApplication"
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:allowBackup="false"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="${usesCleartextTraffic}"
    android:supportsRtl="true">
    <activity
      android:name=".MainActivity"
      android:label="@string/app_name"
      android:theme="@style/BootTheme"
      android:configChanges="keyboard|keyboardHidden|orientation|screenLayout|screenSize|smallestScreenSize|uiMode"
      android:launchMode="singleTask"
      android:windowSoftInputMode="adjustResize"
      android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

`android/app/src/main/java/com/bookitallpartner/MainActivity.kt`
```kotlin
package com.bookitallpartner

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "Bookitallpartner"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
```

`android/app/src/main/java/com/bookitallpartner/MainApplication.kt`
```kotlin
package com.bookitallpartner

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {
  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList = PackageList(this).packages,
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
  }
}
```

## 8) iOS New Architecture Setup (copy/paste)
`ios/Podfile`
```ruby
# Resolve react_native_pods.rb with node to allow for hoisting
require Pod::Executable.execute_command('node', ['-p',
  'require.resolve(
    "react-native/scripts/react_native_pods.rb",
    {paths: [process.argv[1]]},
  )', __dir__]).strip

platform :ios, '16.0'
prepare_react_native_project!

linkage = ENV['USE_FRAMEWORKS']
if linkage != nil
  Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
  use_frameworks! :linkage => linkage.to_sym
end

target 'Bookitallpartner' do
  config = use_native_modules!

  use_react_native!(
    :path => config[:reactNativePath],
    :app_path => "#{Pod::Config.instance.installation_root}/.."
  )

  post_install do |installer|
    react_native_post_install(
      installer,
      config[:reactNativePath],
      :mac_catalyst_enabled => false,
    )
  end
end
```

`ios/Bookitallpartner/AppDelegate.swift`
```swift
import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Bookitallpartner",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
```

`ios/Bookitallpartner/Info.plist` (key parts)
```xml
<key>RCTNewArchEnabled</key>
<true/>
<key>UIAppFonts</key>
<array>
  <string>Manrope-ExtraLight.ttf</string>
  <string>Manrope-Light.ttf</string>
  <string>Manrope-Regular.ttf</string>
  <string>Manrope-Medium.ttf</string>
  <string>Manrope-SemiBold.ttf</string>
  <string>Manrope-Bold.ttf</string>
  <string>Manrope-ExtraBold.ttf</string>
</array>
<key>UILaunchStoryboardName</key>
<string>BootSplash</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs access to your location to find your business address.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Location is required for accurate business tracking and services.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>This app needs background location access to improve accuracy.</string>
```

## 9) Assets & Styling
- Fonts in `assets/fonts` linked via `react-native.config.js` and declared in `Info.plist`.
- Tailwind via NativeWind with `global.css` and `tailwind.config.js`.
- Bootsplash assets under `assets/bootsplash` with matching storyboard on iOS and theme on Android.

## 10) Verification & Usage
- Start Metro: `npm start` (or `npm start:reset`).
- Run: `npm run android` / `npm run ios`; Release: `npm run android:release` / `npm run ios:release`.
- Bundles: `npm run build:android:bundle`, `npm run build:ios:bundle`.
- Quality gates: `npm run lint`, `npm run type-check`, `npm test`.
- Confirm New Architecture:
  - Android: `android/gradle.properties` has `newArchEnabled=true`; build logs show `Patched build.ninja to link libc++`.
  - iOS: `Info.plist` `RCTNewArchEnabled=true`; Podfile uses `use_react_native!` (Fabric/TurboModules on).

## 11) Notes for Cloning to a New Project
- Update `applicationId`/`namespace` (Android) and bundle id (`PRODUCT_BUNDLE_IDENTIFIER`, `MARKETING_VERSION`) when copying.
- Replace debug keystore with real signing config; enable Proguard if required (`enableProguardInReleaseBuilds=true`).
- Regenerate `BootSplash` assets and themes if app name/colors change.
- Keep the libc++ patch blocks intact whenever adding native modules that use C++.
- Ensure new dependencies are New Architecture compatible; rerun `pod install` after native dep changes.

