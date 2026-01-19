import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RightArrow from '../../assets/icons/svg/right_arrow.svg';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { ServicesForYou, SearchBar } from '../../components/common';

type RouteParams = {
  categorySlug: string;
  categoryName: string;
};

const CategoryListingScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { categorySlug, categoryName } = (route.params || {}) as RouteParams;
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [sortOption, setSortOption] = useState<'rating' | 'distance' | undefined>('rating');

  const sortOptions = useMemo(
    () => [
      { key: 'rating', label: 'Rating' },
      { key: 'distance', label: 'Distance' },
    ],
    []
  );

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleSortPress = (key: 'rating' | 'distance') => {
    setSortOption(key);
    setRefreshKey((prev) => prev + 1);
  };

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

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.background.black]}
            tintColor={colors.background.black}
          />
        }
      >
        {/* Filters */}
        <View style={styles.filtersContainer}>
          {sortOptions.map((opt) => {
            const active = sortOption === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => handleSortPress(opt.key as 'rating' | 'distance')}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Divider below filters for spacing */}
        <View style={styles.filterDivider} />

        <ServicesForYou
          categorySlug={categorySlug}
          refreshKey={refreshKey}
          showTitle={false}
          emptyMessage="Currently there is no service available"
          sort={sortOption}
        />
      </ScrollView>
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
    fontSize: ms(20),
    color: colors.text.title,
  },
  headerRightSpacer: {
    width: ms(36),
  },
  searchBarContainer: {
    paddingHorizontal: hs(20),
    paddingTop: vs(0),
    paddingBottom: vs(8),
    backgroundColor: colors.background.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: vs(20),
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: hs(20),
    paddingTop: vs(8),
    paddingBottom: vs(4),
    gap: hs(8),
  },
  filterChip: {
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: colors.border.light,
    backgroundColor: colors.background.white,
  },
  filterChipActive: {
    borderColor: colors.text.primary,
    backgroundColor: '#EEF2FF',
  },
  filterChipText: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(13),
    color: colors.text.title,
  },
  filterChipTextActive: {
    color: colors.text.primary,
  },
  filterDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: hs(20),
    marginTop: vs(8),
    marginBottom: vs(12),
  },
});

export default CategoryListingScreen;


