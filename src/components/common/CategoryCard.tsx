/**
 * CategoryCard Component
 * Displays a single category with image and name
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { Category } from '../../api/types';

interface CategoryCardProps {
  category: Category;
  onPress?: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(category)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: category.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: hs(16),
    width: ms(80),
  },
  imageContainer: {
    width: ms(80),
    height: ms(80),
    borderRadius: ms(0),
    overflow: 'hidden',
    marginBottom: vs(8),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(14),
    color: colors.text.title,
    textAlign: 'center',
  },
});

export default CategoryCard;

