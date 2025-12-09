import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors, getColorWithOpacity } from '../../theme/colors';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  style?: ViewStyle;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  style,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow single digit
    const digit = text.replace(/[^0-9]/g, '').slice(0, 1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if OTP is complete
    const otpString = newOtp.join('');
    onChange?.(otpString);
    if (otpString.length === length) {
      onComplete(otpString);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key !== 'Backspace') {
      return;
    }

    let nextOtpString = '';

    setOtp((prevOtp) => {
      const updatedOtp = [...prevOtp];

      // If current box has a value, clear it on first backspace
      if (prevOtp[index]) {
        updatedOtp[index] = '';
        nextOtpString = updatedOtp.join('');
        return updatedOtp;
      }

      // If current is already empty, clear the previous box and focus it
      if (index > 0) {
        updatedOtp[index - 1] = '';
        inputRefs.current[index - 1]?.focus();
      }

      nextOtpString = updatedOtp.join('');
      return updatedOtp;
    });

    if (onChange) {
      onChange(nextOtpString);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length }).map((_, index) => (
        <View key={index} style={styles.inputWrapper}>
          <TextInput
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={styles.input}
            value={otp[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
          />
          <View
            style={[
              styles.dash,
              {
                backgroundColor: otp[index]
                  ? colors.text.black
                  : getColorWithOpacity(colors.text.black, 0.6),
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
  },
  inputWrapper: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    width: '100%',
    height: '100%',
    fontFamily: 'Manrope-Bold',
    fontSize: 24,
    lineHeight: 32,
    color: colors.text.black,
    textAlign: 'center',
  },
  dash: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 2,
    borderRadius: 1,
  },
});

export default OTPInput;

