/**
 * CategoriesList Component
 * Horizontal scrolling list of categories with caching
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import { hs, vs } from '../../theme/scaling';
import { categoriesApi } from '../../api';
import { Category } from '../../api/types';
import CategoryCard from './CategoryCard';

interface CategoriesListProps {
  onCategoryPress?: (category: Category) => void;
  refreshKey?: number;
}

const CACHE_KEY = '@bookitall:cached_categories';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedCategories {
  data: Category[];
  timestamp: number;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ onCategoryPress, refreshKey }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async (bypassCache: boolean = false) => {
      try {
        // If bypassing cache, clear it first
        if (bypassCache) {
          await AsyncStorage.removeItem(CACHE_KEY);
        }

        const data = await categoriesApi.getCategories();
        setCategories(data);
        setIsLoading(false);

        // Cache the data
        const cacheData: CachedCategories = {
          data,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Error fetching categories:', error);
        setIsLoading(false);
      }
    };

    const loadCategories = async () => {
      try {
        setIsLoading(true);

        // If refreshKey is provided, bypass cache and force refresh
        if (refreshKey !== undefined && refreshKey > 0) {
          await fetchCategories(true);
          return;
        }

        // Try to load from cache first
        const cached = await AsyncStorage.getItem(CACHE_KEY);
        if (cached) {
          const cachedData: CachedCategories = JSON.parse(cached);
          const now = Date.now();

          // Use cache if it's still valid (less than 5 minutes old)
          if (now - cachedData.timestamp < CACHE_DURATION) {
            setCategories(cachedData.data);
            setIsLoading(false);
            // Still fetch fresh data in background
            fetchCategories();
            return;
          }
        }

        // No valid cache, fetch from API
        await fetchCategories();
      } catch (error) {
        console.error('Error loading categories:', error);
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [refreshKey]);

  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.text.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onPress={onCategoryPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: vs(16),
  },
  scrollContent: {
    paddingHorizontal: hs(20),
    paddingRight: hs(20),
  },
  loadingContainer: {
    paddingVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CategoriesList;

