/**
 * WorkingHours Component
 * Displays business working hours in a card format
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';
import RightArrow from '../../assets/icons/svg/right_arrow_white.svg';

export interface Timing {
  day: string;
  open: string;
  close: string;
  breaks: any[];
  isClosed: boolean;
}

type WorkingHoursProps = {
  timings: Timing[];
  onBookSlotPress?: () => void;
};


const WorkingHours: React.FC<WorkingHoursProps> = ({ timings, onBookSlotPress }) => {
  // Convert 24-hour format to 12-hour format with AM/PM
  const formatTime = (time24: string): string => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Sort timings by day order (Sunday = 0, Monday = 1, etc.)
  const sortedTimings = useMemo(() => {
    if (!timings || timings.length === 0) return [];

    const dayOrder: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    return [...timings].sort(
      (a, b) => dayOrder[a.day] - dayOrder[b.day]
    );
  }, [timings]);

  if (!timings || timings.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Working Hours</Text>
      <View style={styles.card}>
        {sortedTimings.map((timing, index) => (
          <View key={timing.day}>
            <View style={styles.row}>
              <Text style={styles.dayText}>{timing.day}</Text>
              <Text
                style={[
                  styles.hoursText,
                  timing.isClosed && styles.closedText,
                ]}
              >
                {timing.isClosed
                  ? 'Closed'
                  : `${formatTime(timing.open)} - ${formatTime(timing.close)}`}
              </Text>
            </View>
            {index < sortedTimings.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
      
      {/* Book a Slot Button */}
      <TouchableOpacity
        style={styles.bookButton}
        activeOpacity={0.8}
        onPress={onBookSlotPress}
      >
        <Text style={styles.bookButtonText}>Book a Slot</Text>
        <RightArrow width={ms(16)} height={ms(16)} color={colors.text.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: hs(16),
    paddingTop: 0,
    paddingBottom: vs(16),
  },
  title: {
    fontSize: ms(18),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary,
    marginBottom: vs(12),
  },
  card: {
    backgroundColor: colors.background.white,
    borderRadius: ms(12),
    padding: hs(16),
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: vs(8),
  },
  dayText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.regular,
    color: colors.text.primary,
    flex: 1,
  },
  hoursText: {
    fontSize: ms(14),
    fontFamily: fonts.manrope.regular,
    color: colors.text.primary,
    textAlign: 'right',
  },
  closedText: {
    color: colors.text.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: vs(4),
  },
  bookButton: {
    backgroundColor: colors.background.black,
    borderRadius: ms(12),
    paddingVertical: vs(16),
    paddingHorizontal: hs(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    fontSize: ms(16),
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.white,
    marginRight: hs(8),
  },
});

export default WorkingHours;

