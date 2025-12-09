import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const SuccessScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Set!</Text>
      <Text style={styles.subtitle}>You are on the new architecture flow.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});

export default SuccessScreen;

