/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import BookingsScreen from './BookingsScreen';
import FavoritesScreen from './FavoritesScreen';
import ProfileScreen from './ProfileScreen';
import HomeActiveIcon from '../../assets/icons/svg/home_active.svg';
import HomeInactiveIcon from '../../assets/icons/svg/home_inactive.svg';
import BookingsActiveIcon from '../../assets/icons/svg/bookings_active.svg';
import BookingsInactiveIcon from '../../assets/icons/svg/bookings_inactive.svg';
import FavoritesActiveIcon from '../../assets/icons/svg/favorites_active.svg';
import FavoritesInactiveIcon from '../../assets/icons/svg/favorites_inactive.svg';
import ProfileActiveIcon from '../../assets/icons/svg/profile_active.svg';
import ProfileInactiveIcon from '../../assets/icons/svg/profile_inactive.svg';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type DashboardTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DashboardTabParamList>();

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  // Split routes into left (Home, Bookings) and right (Favorites, Profile) groups
  const leftRoutes = state.routes.slice(0, 2); // Home, Bookings
  const rightRoutes = state.routes.slice(2); // Favorites, Profile

  const renderTabItem = (route: any, routeIndex: number, isLastInGroup: boolean) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
        ? options.title
        : route.name;

    const isFocused = state.index === routeIndex;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    const icon = options.tabBarIcon
      ? options.tabBarIcon({ focused: isFocused, color: '', size: 24 })
      : null;

    return (
      <TouchableOpacity
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        style={[styles.tabItem, !isLastInGroup && styles.tabItemWithMargin]}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>
          {label as string}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {/* Left side tabs */}
        <View style={styles.leftTabsContainer}>
          {leftRoutes.map((route, index) =>
            renderTabItem(route, index, index === leftRoutes.length - 1)
          )}
        </View>

        {/* Center button spacer */}
        <View style={styles.centerButtonSpacer} />

        {/* Right side tabs */}
        <View style={styles.rightTabsContainer}>
          {rightRoutes.map((route, index) =>
            renderTabItem(route, index + 2, index === rightRoutes.length - 1)
          )}
        </View>
      </View>

      {/* Center floating action button */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity style={styles.centerButton} activeOpacity={0.8} onPress={() => {}}>
          <Text style={styles.centerButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const DashboardTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) =>
            focused ? <HomeActiveIcon width={24} height={24} /> : <HomeInactiveIcon width={24} height={24} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <BookingsActiveIcon width={24} height={24} />
            ) : (
              <BookingsInactiveIcon width={24} height={24} />
            ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: 'Favorites',
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FavoritesActiveIcon width={24} height={24} />
            ) : (
              <FavoritesInactiveIcon width={24} height={24} />
            ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) =>
            focused ? <ProfileActiveIcon width={24} height={24} /> : <ProfileInactiveIcon width={24} height={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    paddingBottom: 8,
    paddingTop: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  leftTabsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightTabsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  centerButtonSpacer: {
    width: 64,
    marginHorizontal: 20,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabItemWithMargin: {
    marginRight: 32,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
  },
  tabLabelActive: {
    color: '#1F1F1F',
    fontFamily: fonts.manrope.semiBold,
  },
  tabLabelInactive: {
    color: '#94A3B8',
    fontFamily: fonts.manrope.regular,
  },
  centerButtonWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background.black,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  centerButtonText: {
    color: colors.text.white,
    fontSize: 32,
    lineHeight: 32,
  },
});

export default DashboardTabs;


