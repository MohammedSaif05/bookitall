/**
 * ServicesList Component
 * Displays services in a 2-column grid layout
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { hs, vs } from '../../theme/scaling';
import ServiceCard, { Service } from './ServiceCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - hs(48)) / 2;

type ServicesListProps = {
  services: Service[];
  onServiceBookPress?: (service: Service) => void;
};

const ServicesList: React.FC<ServicesListProps> = ({ services, onServiceBookPress }) => {
  if (!services || services.length === 0) {
    return null;
  }

  // Group services into rows of 2
  const rows: Service[][] = [];
  for (let i = 0; i < services.length; i += 2) {
    rows.push(services.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((service) => (
            <ServiceCard
              key={service.serviceId}
              service={service}
              onBookPress={onServiceBookPress}
            />
          ))}
          {row.length === 1 && <View style={styles.emptyCard} />}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: vs(16),
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
});

export default ServicesList;

