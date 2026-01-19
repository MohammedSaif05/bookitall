/**
 * SpotlightCarousel Component
 * Carousel for displaying promotional images with pagination indicators
 * Using react-native-pager-view for production-level performance
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { promotionsApi } from '../../api';
import { Promotion } from '../../api/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_PADDING = hs(20);
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - (CAROUSEL_PADDING * 2); // Full width minus padding
const CAROUSEL_ITEM_HEIGHT = vs(110); // Reduced height
const AUTO_SLIDE_INTERVAL = 3000; // 3 seconds

interface SpotlightCarouselProps {
  onPromotionPress?: (promotion: Promotion) => void;
  refreshKey?: number;
}

const SpotlightCarousel: React.FC<SpotlightCarouselProps> = ({ onPromotionPress: _onPromotionPress, refreshKey }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const pagerRef = useRef<PagerView>(null);
  const autoSlideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchPromotions();
    return () => {
      // Cleanup timers on unmount
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [refreshKey]);

  // Auto-slide effect
  useEffect(() => {
    if (promotions.length <= 1 || isUserScrolling) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    // Clear existing timer
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }

    // Set up auto-slide
    autoSlideTimerRef.current = setInterval(() => {
      if (pagerRef.current) {
        const nextIndex = (currentIndex + 1) % promotions.length;
        pagerRef.current.setPage(nextIndex);
      }
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [currentIndex, promotions.length, isUserScrolling]);

  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await promotionsApi.getPromotions(true);
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const renderPaginationIndicator = () => {
    if (promotions.length === 0) return null;

    return (
      <View style={styles.paginationContainer}>
        {promotions.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <View key={index} style={styles.paginationWrapper}>
              {isActive ? (
                <View style={styles.paginationActiveCapsule}>
                  <Text style={styles.paginationActiveText}>
                    {`${currentIndex + 1}/${promotions.length}`}
                  </Text>
                </View>
              ) : (
                <View style={styles.paginationInactive} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const onPageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setCurrentIndex(index);
  };

  const onPageScrollStateChanged = (e: any) => {
    const state = e.nativeEvent.pageScrollState;
    if (state === 'dragging' || state === 'settling') {
      setIsUserScrolling(true);
    } else if (state === 'idle') {
      // Resume auto-play after user stops scrolling
      setTimeout(() => {
        setIsUserScrolling(false);
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.text.primary} />
      </View>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Spotlight Title */}
      <View style={styles.titleContainer}>
        <View style={styles.titleLine} />
        <View style={styles.titleTextContainer}>
          <Text style={styles.titleText}>
            Spotlight
          </Text>
        </View>
        <View style={styles.titleLine} />
      </View>

      {/* Carousel */}
      <View style={styles.carouselWrapper}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          scrollEnabled={true}
          offscreenPageLimit={1}
          onPageSelected={onPageSelected}
          onPageScrollStateChanged={onPageScrollStateChanged}
        >
          {promotions.map((item) => (
            <View key={item.promotionId} style={styles.carouselItem}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.promotionImage}
                resizeMode="contain"
              />
            </View>
          ))}
        </PagerView>
      </View>

      {/* Pagination Indicators */}
      {renderPaginationIndicator()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: vs(16),
    marginBottom: vs(16),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(16),
    paddingHorizontal: hs(20),
  },
  titleLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  titleTextContainer: {
    marginHorizontal: hs(12),
    paddingHorizontal: hs(8),
  },
  titleText: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(18),
    color: colors.text.title,
    letterSpacing: 0.5,
  },
  carouselWrapper: {
    paddingHorizontal: CAROUSEL_PADDING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pagerView: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_HEIGHT,
  },
  carouselItem: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_HEIGHT,
    borderRadius: ms(12),
    overflow: 'hidden',
    backgroundColor: colors.background.primary,
  },
  promotionImage: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: vs(8),
    paddingHorizontal: hs(20),
  },
  paginationWrapper: {
    marginHorizontal: hs(3),
  },
  paginationActiveCapsule: {
    backgroundColor: '#4A5568',
    borderRadius: ms(12),
    paddingHorizontal: hs(8),
    paddingVertical: vs(4),
    minWidth: ms(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationActiveText: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(10),
    color: colors.background.white,
    letterSpacing: 0.2,
  },
  paginationInactive: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: '#E2E8F0',
  },
  loadingContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SpotlightCarousel;
