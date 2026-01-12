/**
 * @format
 */

import 'react-native-gesture-handler';
import './global.css';
import { AppRegistry } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Hide native splash screen after React Native is registered
const hide = () => RNBootSplash.hide({ fade: false }).catch(() => {});
setTimeout(hide, 0);
setTimeout(hide, 50);
