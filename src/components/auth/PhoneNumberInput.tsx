import React from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import PhoneIcon from '../../assets/icons/svg/Phone.svg';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/fonts';

interface PhoneNumberInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  countryCode?: string;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChangeText,
  placeholder = 'Enter your phone number',
  error = false,
  errorMessage,
  style,
  inputStyle,
  disabled = false,
  countryCode = '+91',
}) => {
  // Don't format - just allow digits
  const handleChangeText = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, '');
    onChangeText(cleaned);
  };

  // Determine icon color based on input value
  // When empty (empty string, null, or undefined), use divider color (#2F2F2F), otherwise use tertiary (#999999)
  const iconColor = !value || value.length === 0 ? colors.border.divider : colors.text.tertiary;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        {/* Country Code */}
        <Text style={styles.countryCode}>{countryCode}</Text>
        
        {/* Vertical Separator */}
        <View style={styles.separator} />
        
        {/* Input Field */}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          editable={!disabled}
          maxLength={10}
        />
        
        {/* Phone Icon */}
        <View style={styles.iconContainer}>
          <PhoneIcon width={20} height={20} fill="transparent" stroke={iconColor} strokeWidth={1.5} />
        </View>
      </View>
      
      {error && errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  countryCode: {
    ...typography.phoneInput,
    color: colors.text.black,
    marginRight: 12,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.divider,
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...typography.phoneInput,
    color: colors.text.black,
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    marginTop: 4,
    paddingLeft: 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.error,
  },
});

export default PhoneNumberInput;

