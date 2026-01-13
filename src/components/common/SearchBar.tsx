/**
 * SearchBar Component
 * Reusable search bar with icon and placeholder
 */

import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import SearchIcon from '../../assets/icons/svg/search.svg';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  editable?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search for services',
  value,
  onChangeText,
  onPress,
  editable = true,
}) => {
  const inputRef = useRef<TextInput>(null);

  const handleContainerPress = () => {
    if (onPress) {
      onPress();
    } else if (editable) {
      // Focus the input when clicking on the search bar container
      inputRef.current?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handleContainerPress}
        activeOpacity={1}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
          onBlur={() => {
            // Dismiss keyboard when focus is lost
            Keyboard.dismiss();
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={handleContainerPress}
        activeOpacity={0.7}
      >
        <SearchIcon width={ms(20)} height={ms(20)} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    paddingHorizontal: hs(16),
    paddingVertical: vs(12),
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.primary,
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    marginLeft: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;

