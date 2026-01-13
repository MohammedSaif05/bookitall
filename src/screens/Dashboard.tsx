import React from 'react';
import { View, StyleSheet } from 'react-native';
import DashboardTabs from './main/DashboardTabs';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      <DashboardTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;


