import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme/theme';
import { MainTabParamList } from './types';
import {
  AssignmentsStackNavigator,
  DashboardStackNavigator,
  InternshipStackNavigator,
  MessagesStackNavigator,
  ProfileStackNavigator,
  ScheduleStackNavigator,
  WeekendsStackNavigator,
} from './stacks';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: '🏠',
  Schedule: '📅',
  Assignments: '📝',
  Internship: '💼',
  Weekends: '🏕️',
  Messages: '💬',
  Profile: '👤',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.amberDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNavigator} />
      <Tab.Screen name="Schedule" component={ScheduleStackNavigator} />
      <Tab.Screen name="Assignments" component={AssignmentsStackNavigator} />
      <Tab.Screen name="Internship" component={InternshipStackNavigator} />
      <Tab.Screen name="Weekends" component={WeekendsStackNavigator} />
      <Tab.Screen name="Messages" component={MessagesStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}
