/**
 * ReviewsList Component
 * Displays a list of customer reviews
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import RatingStar from '../../assets/icons/svg/rating_star_yellow.svg';
import { getTimeAgo } from '../../utils/dateUtils';

export interface Review {
  userName: string;
  rating: number;
  review: string;
  createdAt: string;
}

type ReviewsListProps = {
  reviews: Review[];
  onViewAllPress?: () => void;
};

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews, onViewAllPress }) => {
  // Show only recent 5 reviews
  const recentReviews = reviews?.slice(0, 5) || [];
  const totalReviews = reviews?.length || 0;

  if (!reviews || reviews.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Reviews (0)</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reviews yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Reviews ({totalReviews})</Text>
        <TouchableOpacity onPress={onViewAllPress} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>
      {recentReviews.map((review, index) => (
        <View key={index} style={styles.reviewItem}>
          <View style={styles.reviewContent}>
            <View style={styles.reviewerRow}>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <Text style={styles.timeAgo}>{getTimeAgo(review.createdAt)}</Text>
            </View>
            <Text style={styles.reviewText}>{review.review}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <RatingStar width={ms(16)} height={ms(16)} />
            <Text style={styles.ratingText}>{review.rating.toFixed(1)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: hs(16),
    paddingTop: 0,
    paddingBottom: vs(20),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  header: {
    fontSize: ms(18),
    fontFamily: fonts.manrope.bold,
    color: colors.text.primary,
  },
  viewAllText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(16),
    paddingBottom: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  reviewContent: {
    flex: 1,
    marginRight: hs(12),
  },
  reviewerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(4),
  },
  reviewerName: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
    flex: 1,
  },
  timeAgo: {
    fontSize: ms(12),
    fontFamily: fonts.manrope.regular,
    color: colors.text.tertiary,
    marginLeft: hs(8),
  },
  reviewText: {
    fontSize: ms(13),
    fontFamily: fonts.manrope.regular,
    color: colors.text.secondary,
    lineHeight: ms(18),
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  ratingText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.regular,
    color: colors.text.primary,
    marginLeft: hs(4),
  },
  emptyContainer: {
    paddingVertical: vs(40),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.regular,
    color: colors.text.tertiary,
  },
});

export default ReviewsList;

