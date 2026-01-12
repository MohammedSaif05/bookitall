import { StyleSheet, Text, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { Button } from '../../components/auth';

const SuccessAnimation = require('../../assets/lottie/Success.json');

type Props = NativeStackScreenProps<RootStackParamList, 'SuccessScreen'>;

const SuccessScreen = ({ navigation }: Props) => {
  const handleContinue = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <LottieView
          source={SuccessAnimation}
          autoPlay
          loop={false}
          style={styles.animation}
        />
        <Text style={styles.title}>Your account is all set !</Text>
        <Text style={styles.subtitle}>Everything is ready-start exploring now</Text>
      </View>

      <SafeAreaView edges={['bottom']} style={styles.buttonWrapper}>
        <Button title="Continue to explore" onPress={handleContinue} />
      </SafeAreaView>
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
  animation: {
    width: 340,
    height: 340,
    marginBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 24,
  },
});

export default SuccessScreen;

