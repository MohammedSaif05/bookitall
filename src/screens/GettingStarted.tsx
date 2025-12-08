import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { fonts, typography } from '../theme/fonts';

type Props = NativeStackScreenProps<RootStackParamList, 'GettingStarted'>;

const GettingStarted = ({ navigation }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Getting Started</Text>
      <Text style={styles.subtitle}>Welcome to Bookitall (New Architecture)</Text>
      <Text style={styles.fontTest}>Manrope Font Test</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SuccessScreen')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f7f7f7',
  },
  title: {
    ...typography.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
  fontTest: {
    fontFamily: fonts.manrope.bold,
    fontSize: 18,
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#222222',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.button,
    color: '#ffffff',
  },
});

export default GettingStarted;

