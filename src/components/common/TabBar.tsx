/**
 * TabBar Component
 * A reusable horizontal tab bar with underline indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ms, hs, vs } from '../../theme/scaling';

export type TabItem = {
  key: string;
  label: string;
};

type TabBarProps = {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
};

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, index < tabs.length - 1 && styles.tabWithSpacing]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={styles.underline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    paddingHorizontal: hs(16),
    paddingTop: 0,
    paddingBottom: vs(12),
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(8),
  },
  tabWithSpacing: {
    marginRight: hs(8),
  },
  tabLabel: {
    fontSize: ms(16),
    fontFamily: fonts.manrope.regular,
    color: colors.text.tertiary, // Light grey for inactive tabs
    marginBottom: vs(8),
  },
  tabLabelActive: {
    fontFamily: fonts.manrope.semiBold,
    color: colors.text.primary, // Dark color for active tab
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.text.black, // Black underline
  },
});

export default TabBar;

