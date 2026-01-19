/**
 * BusinessDetailsScreen
 * Shows detailed information about a business
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { businessesApi } from '../../api';
import { BusinessDetails } from '../../api/types';
import { getCurrentPosition } from '../../utils/location';
import RightArrow from '../../assets/icons/svg/right_arrow.svg';
import RatingStar from '../../assets/icons/svg/rating_star.svg';
import TabBar from '../../components/common/TabBar';
import WorkingHours from '../../components/common/WorkingHours';
import ServicesList from '../../components/common/ServicesList';
import ReviewsList from '../../components/common/ReviewsList';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.30; // 32% of screen height (reduced)
const AUTO_SLIDE_INTERVAL = 3000; // 3 seconds

type RouteParams = {
  businessId: string;
};

const BusinessDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { businessId } = (route.params || {}) as RouteParams;
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [infoCardHeight, setInfoCardHeight] = useState(0);
  const [tabBarHeight, setTabBarHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'services' | 'reviews'>('about');
  const pagerRef = useRef<PagerView>(null);
  const autoSlideTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const infoCardRef = useRef<View>(null);

  const fetchBusinessDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const coords = await getCurrentPosition();
      const details = await businessesApi.getBusinessDetails(
        businessId,
        coords.latitude,
        coords.longitude
      );
      setBusinessDetails(details);
    } catch (error) {
      console.error('Error fetching business details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusinessDetails();
  }, [fetchBusinessDetails]);

  // Auto-slide effect
  useEffect(() => {
    if (!businessDetails || businessDetails.business.images.length <= 1 || isUserScrolling) {
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
        const nextIndex = (currentImageIndex + 1) % businessDetails.business.images.length;
        pagerRef.current.setPage(nextIndex);
      }
    }, AUTO_SLIDE_INTERVAL);

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
    };
  }, [currentImageIndex, businessDetails, isUserScrolling]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
          <ActivityIndicator size="large" color={colors.text.primary} />
        </SafeAreaView>
      </View>
    );
  }

  if (!businessDetails) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.errorContainer} edges={['top', 'bottom']}>
          <Text style={styles.errorText}>Failed to load business details</Text>
        </SafeAreaView>
      </View>
    );
  }

  const { business } = businessDetails;

  const formatAddress = () => {
    const { address } = business;
    return `${address.address}, ${address.landmark} ${address.city}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {/* Image Carousel */}
      <View style={[styles.imageCarouselContainer, { height: IMAGE_HEIGHT + insets.top }]}>
        {business.images.length > 0 ? (
          <>
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              scrollEnabled={business.images.length > 1}
              onPageSelected={(e) => setCurrentImageIndex(e.nativeEvent.position)}
              onPageScrollStateChanged={(e) => {
                const state = e.nativeEvent.pageScrollState;
                if (state === 'dragging' || state === 'settling') {
                  setIsUserScrolling(true);
                } else if (state === 'idle') {
                  // Resume auto-play after user stops scrolling
                  setTimeout(() => {
                    setIsUserScrolling(false);
                  }, 1000);
                }
              }}
            >
              {business.images.map((imageUrl, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.businessImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </PagerView>

            {/* Back Button - Top Left */}
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + vs(16) }]}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <RightArrow width={ms(20)} height={ms(20)} style={styles.backIconRotate} />
              </View>
            </TouchableOpacity>

            {/* Pagination Indicators - Overlaid on Image */}
            {business.images.length > 1 && (
              <View
                style={[
                  styles.paginationContainer,
                  {
                    bottom:
                      infoCardHeight > 0
                        ? infoCardHeight / 2 + vs(8)
                        : vs(140),
                  },
                ]}
              >
                {business.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentImageIndex && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
            {/* Back Button even when no image */}
            <TouchableOpacity
              style={[styles.backButton, { top: insets.top + vs(16) }]}
              activeOpacity={0.8}
              onPress={() => navigation.goBack()}
            >
              <View style={styles.backButtonContainer}>
                <RightArrow width={ms(20)} height={ms(20)} style={styles.backIconRotate} />
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Information Card Overlay */}
      <View
        ref={infoCardRef}
        style={[
          styles.infoCardOverlay,
          {
            top: IMAGE_HEIGHT + insets.top - (infoCardHeight > 0 ? infoCardHeight / 2 : vs(70)),
          },
        ]}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height > 0) {
            setInfoCardHeight(height);
          }
        }}
      >
        {/* Business Name */}
        <View style={styles.businessNameRow}>
          <Text style={styles.businessName}>{business.businessName}</Text>
          {business.rating.count > 0 && (
            <View style={styles.ratingContainer}>
              <RatingStar width={ms(12)} height={ms(12)} />
              <Text style={styles.ratingText}>
                {business.rating.average.toFixed(1)} ({business.rating.count})
              </Text>
            </View>
          )}
        </View>

        {/* Category, Distance, City */}
        <Text style={styles.categoryDistanceCity}>
          {business.category.charAt(0).toUpperCase() + business.category.slice(1)} • {business.distanceInKm.toFixed(1)}Km • {business.city}
        </Text>

        {/* Address */}
        <Text style={styles.addressText}>{formatAddress()}</Text>
      </View>

      {/* Tab Bar */}
      <View
        style={[
          styles.tabBarContainer,
          {
            top: IMAGE_HEIGHT + insets.top + (infoCardHeight > 0 ? infoCardHeight / 2 : vs(70)) + vs(2),
          },
        ]}
        onLayout={(e) => {
          const { height } = e.nativeEvent.layout;
          if (height > 0) {
            setTabBarHeight(height);
          }
        }}
      >
        <TabBar
          tabs={[
            { key: 'about', label: 'About' },
            { key: 'services', label: 'Services' },
            { key: 'reviews', label: 'Reviews' },
          ]}
          activeTab={activeTab}
          onTabPress={(tabKey) => setActiveTab(tabKey as 'about' | 'services' | 'reviews')}
        />
      </View>

      {/* Tab Content */}
      <ScrollView
        style={[
          styles.tabContentContainer,
          {
            top:
              IMAGE_HEIGHT +
              insets.top +
              (infoCardHeight > 0 ? infoCardHeight / 2 : vs(70)) +
              vs(2) +
              (tabBarHeight > 0 ? tabBarHeight : vs(50)),
          },
        ]}
        contentContainerStyle={styles.tabContentScroll}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'about' && businessDetails.timings && (
          <WorkingHours
            timings={businessDetails.timings}
            onBookSlotPress={() => setActiveTab('services')}
          />
        )}
        {activeTab === 'services' && businessDetails.services && (
          <ServicesList services={businessDetails.services} />
        )}
        {activeTab === 'reviews' && businessDetails.reviews && (
          <ReviewsList
            reviews={businessDetails.reviews}
            onViewAllPress={() => {
              // TODO: Navigate to AllReviewsScreen when implemented
              console.log('Navigate to all reviews screen');
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: hs(20),
  },
  errorText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(16),
    color: colors.text.secondary,
    textAlign: 'center',
  },
  imageCarouselContainer: {
    width: SCREEN_WIDTH,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
  pagerView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.background.white,
  },
  businessImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    left: hs(16),
    zIndex: 10,
  },
  backButtonContainer: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(20),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backIconRotate: {
    transform: [{ rotate: '180deg' }],
  },
  paginationContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  paginationDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginHorizontal: hs(4),
  },
  paginationDotActive: {
    backgroundColor: colors.background.white,
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: ms(20),
    borderBottomRightRadius: ms(20),
  },
  placeholderText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.secondary,
  },
  infoCardOverlay: {
    position: 'absolute',
    left: hs(16),
    right: hs(16),
    backgroundColor: colors.background.white,
    borderRadius: ms(20),
    paddingHorizontal: hs(16),
    paddingTop: vs(12),
    paddingBottom: vs(Platform.OS === 'ios' ? 34 : 12),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  businessNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  businessName: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(20),
    color: colors.text.title,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: hs(8),
  },
  ratingText: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(12),
    color: colors.text.title,
    marginLeft: hs(2),
  },
  categoryDistanceCity: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(12),
    color: colors.text.secondary,
    marginBottom: 0,
    marginTop: vs(2),
  },
  addressText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(12),
    color: colors.text.secondary,
    lineHeight: ms(16),
    marginTop: vs(2),
  },
  tabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.background.white,
  },
  tabContentContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.white,
  },
  tabContentScroll: {
    paddingBottom: vs(20),
  },
  tabContentPlaceholder: {
    paddingHorizontal: hs(16),
    paddingTop: vs(20),
    alignItems: 'center',
  },
});

export default BusinessDetailsScreen;

