/**
 * ServiceCard Component
 * Displays a single service card with image, name, price, duration, and book button
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - hs(48)) / 2; // 2 cards per row with padding

export interface Service {
  serviceId: string;
  serviceName: string;
  price: number;
  durationInMinutes: number;
  serviceImage: string;
}

type ServiceCardProps = {
  service: Service;
  onBookPress?: (service: Service) => void;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onBookPress }) => {
  const formatPrice = (price: number): string => {
    return `₹${price.toFixed(0)}`;
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${mins} min`;
  };

  return (
    <View style={styles.container}>
      {/* Service Image */}
      <Image
        source={{ uri: service.serviceImage }}
        style={styles.serviceImage}
        resizeMode="cover"
      />

      {/* Service Info */}
      <View style={styles.infoContainer}>
        {/* First Row: Service Name and Price */}
        <View style={styles.namePriceRow}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {service.serviceName}
          </Text>
          <Text style={styles.price}>{formatPrice(service.price)}</Text>
        </View>

        {/* Second Row: Duration */}
        <Text style={styles.duration}>{formatDuration(service.durationInMinutes)}</Text>

        {/* Book Button */}
        <TouchableOpacity
          style={styles.bookButton}
          activeOpacity={0.8}
          onPress={() => onBookPress?.(service)}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    overflow: 'hidden',
    marginBottom: vs(16),
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: ms(12),
    borderTopRightRadius: ms(12),
  },
  infoContainer: {
    padding: hs(12),
  },
  namePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: vs(4),
  },
  serviceName: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
    flex: 1,
    marginRight: hs(8),
  },
  price: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
  },
  duration: {
    fontSize: ms(12),
    fontFamily: fonts.manrope.regular,
    color: colors.text.secondary,
    marginBottom: vs(8),
  },
  bookButton: {
    backgroundColor: colors.background.black,
    borderRadius: ms(8),
    paddingVertical: vs(8),
    paddingHorizontal: hs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.white,
  },
});

export default ServiceCard;

