import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RightArrow from '../../assets/icons/svg/right_arrow.svg';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { ServicesForYou } from '../../components/common';

type RouteParams = {
  categorySlug: string;
  categoryName: string;
};

const CategoryListingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categorySlug, categoryName } = (route.params || {}) as RouteParams;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backIcon}>
            <RightArrow width={ms(18)} height={ms(18)} style={styles.backIconRotate} />
          </View>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {categoryName} near you
        </Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ServicesForYou
        categorySlug={categorySlug}
        showTitle={false}
        emptyMessage="Currently there is no service available"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: hs(16),
    paddingTop: vs(6),
    paddingBottom: vs(10),
    backgroundColor: colors.background.white,
  },
  backButton: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  backIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconRotate: {
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    flex: 1,
    marginLeft: hs(12),
    fontFamily: fonts.manrope.bold,
    fontSize: ms(16),
    color: colors.text.title,
  },
  headerRightSpacer: {
    width: ms(36),
  },
});

export default CategoryListingScreen;


