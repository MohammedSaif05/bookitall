/**
 * ServicesForYou Component
 * Displays nearby businesses in vertical card layout
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { businessesApi } from '../../api';
import { Business, NearbyBusinessesResponse } from '../../api/types';
import { getCurrentPosition, Coordinates } from '../../utils/location';
import RatingStar from '../../assets/icons/svg/rating_star.svg';
import RightArrow from '../../assets/icons/svg/right_arrow.svg';

const CARD_PADDING = hs(20);
const CARD_IMAGE_HEIGHT = vs(140);

interface ServicesForYouProps {
  refreshKey?: number;
  categorySlug?: string;
  showTitle?: boolean;
  titleText?: string;
  emptyMessage?: string;
  sort?: 'rating' | 'distance';
}

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const navigation = useNavigation<any>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleCardPress = () => {
    navigation.navigate('BusinessDetails', {
      businessId: business.businessId,
    });
  };

  const formatPrice = () => {
    if (business.price.type === 'range' && business.price.max) {
      return `Starting From ₹${business.price.min} to ₹${business.price.max}`;
    }
    return `Starting From ₹${business.price.min}`;
  };

  const formatRating = () => {
    if (business.rating.count === 0) {
      return 'No ratings';
    }
    return `${business.rating.average.toFixed(1)} (${business.rating.count})`;
  };

  return (
    <TouchableOpacity
      style={styles.businessCard}
      activeOpacity={0.9}
      onPress={handleCardPress}
    >
      {/* Image Carousel */}
      <View style={styles.imageContainer}>
        {business.images.length > 0 ? (
          <>
            <PagerView
              ref={pagerRef}
              style={styles.pagerView}
              initialPage={0}
              scrollEnabled={business.images.length > 1}
              onPageSelected={(e) => setCurrentImageIndex(e.nativeEvent.position)}
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
            {/* Pagination Dots */}
            {business.images.length > 1 && (
              <View style={styles.paginationDots}>
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
          </View>
        )}
        {/* Price Overlay - Bottom Right of Image */}
        <View style={styles.priceOverlay}>
          <Text style={styles.priceText}>{formatPrice()}</Text>
        </View>
      </View>

      {/* Information Card */}
      <View style={styles.infoCard}>

        {/* Business Name */}
        <Text style={styles.businessName}>{business.businessName}</Text>

        {/* Category and City */}
        <Text style={styles.categoryCity}>
          {business.category.charAt(0).toUpperCase() + business.category.slice(1)} • {business.city}
        </Text>

        {/* Rating and Distance */}
        <View style={styles.ratingDistanceContainer}>
          {business.rating.count > 0 ? (
            <>
              <RatingStar width={ms(14)} height={ms(14)} />
              <Text style={styles.ratingText}>{formatRating()}</Text>
            </>
          ) : (
            <Text style={styles.ratingText}>{formatRating()}</Text>
          )}
          <Text style={styles.separator}>•</Text>
          <Text style={styles.distanceText}>{business.distanceInKm.toFixed(1)} km</Text>
        </View>

        {/* Right Arrow */}
        <View style={styles.arrowContainer}>
          <RightArrow width={ms(18)} height={ms(18)} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ServicesForYou: React.FC<ServicesForYouProps> = ({
  refreshKey,
  categorySlug,
  showTitle = true,
  titleText = 'Services for you',
  emptyMessage = "We're sorry, but we are currently building in your location. See you soon!",
  sort,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const fetchBusinesses = useCallback(async (lat: number, lng: number, page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      }
      const data: NearbyBusinessesResponse = await businessesApi.getNearbyBusinesses(lat, lng, page, categorySlug, sort);
      if (append) {
        setBusinesses((prev) => [...prev, ...data.businesses]);
      } else {
        setBusinesses(data.businesses);
      }
      setHasMore(data.hasMore);
      setCurrentPage(data.page);
    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      if (!append) {
        setBusinesses([]);
        setHasMore(false);
      }
    } finally {
      if (append) {
        setIsLoadingMore(false);
      }
    }
  }, [categorySlug, sort]);

  const fetchLocationAndBusinesses = useCallback(async () => {
    try {
      setIsLoading(true);
      setCurrentPage(1);
      // Get current location coordinates
      const coords = await getCurrentPosition();
      setCoordinates(coords);
      
      if (coords) {
        await fetchBusinesses(coords.latitude, coords.longitude, 1, false);
      }
    } catch (error) {
      console.error('Error fetching location or businesses:', error);
      // Use default coordinates if location fails
      const defaultCoords = { latitude: 12.717928, longitude: 77.870039 };
      setCoordinates(defaultCoords);
      await fetchBusinesses(defaultCoords.latitude, defaultCoords.longitude, 1, false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBusinesses]);

  useEffect(() => {
    fetchLocationAndBusinesses();
  }, [refreshKey, fetchLocationAndBusinesses]);

  const handleShowMore = async () => {
    if (!coordinates || isLoadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    await fetchBusinesses(coordinates.latitude, coordinates.longitude, nextPage, true);
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      {showTitle && (
        <View style={styles.titleContainer}>
          <View style={styles.titleLine} />
          <View style={styles.titleTextContainer}>
            <Text style={styles.titleText}>{titleText}</Text>
          </View>
          <View style={styles.titleLine} />
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.text.primary} />
        </View>
      ) : businesses.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <View style={styles.cardsContainer}>
          {businesses.map((business) => (
            <BusinessCard key={business.businessId} business={business} />
          ))}

          {/* Show More Button */}
          {hasMore && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={handleShowMore}
              activeOpacity={0.7}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
              ) : (
                <Text style={styles.showMoreText}>Show more</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
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
  cardsContainer: {
    paddingHorizontal: CARD_PADDING,
  },
  businessCard: {
    marginBottom: vs(20),
    borderRadius: ms(12),
    overflow: 'hidden',
    backgroundColor: colors.background.white,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    position: 'relative',
  },
  pagerView: {
    width: '100%',
    height: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  businessImage: {
    width: '100%',
    height: '100%',
  },
  paginationDots: {
    position: 'absolute',
    bottom: vs(12),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: hs(3),
  },
  paginationDotActive: {
    backgroundColor: colors.background.white,
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.secondary,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: hs(16),
    paddingTop: vs(6),
    paddingBottom: vs(6),
    position: 'relative',
  },
  priceOverlay: {
    position: 'absolute',
    bottom: vs(0),
    right: hs(0),
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: ms(8),
    borderTopRightRadius: ms(8),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: hs(12),
    paddingVertical: vs(6),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceText: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(12),
    color: colors.text.title,
  },
  businessName: {
    fontFamily: fonts.manrope.bold,
    fontSize: ms(16),
    color: colors.text.title,
    marginBottom: vs(1),
  },
  categoryCity: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(13),
    color: colors.text.title,
    marginBottom: vs(2),
  },
  ratingDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  ratingText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(13),
    color: colors.text.title,
    marginLeft: hs(4),
  },
  separator: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(13),
    color: colors.text.title,
    marginHorizontal: hs(6),
  },
  distanceText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(13),
    color: colors.text.title,
  },
  arrowContainer: {
    position: 'absolute',
    right: hs(16),
    bottom: vs(16),
  },
  showMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(16),
    marginTop: vs(8),
  },
  showMoreText: {
    fontFamily: fonts.manrope.medium,
    fontSize: ms(16),
    color: colors.text.primary,
  },
  loadingContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateContainer: {
    paddingVertical: vs(40),
    paddingHorizontal: hs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: fonts.manrope.regular,
    fontSize: ms(14),
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: ms(20),
  },
});

export default ServicesForYou;

