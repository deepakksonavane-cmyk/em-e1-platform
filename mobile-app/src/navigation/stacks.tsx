import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors } from '../theme/theme';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import SessionListScreen from '../screens/schedule/SessionListScreen';
import SessionDetailScreen from '../screens/schedule/SessionDetailScreen';
import AssignmentListScreen from '../screens/assignments/AssignmentListScreen';
import AssignmentDetailScreen from '../screens/assignments/AssignmentDetailScreen';
import SubmitScreen from '../screens/assignments/SubmitScreen';
import GradesScreen from '../screens/assignments/GradesScreen';
import InternshipScreen from '../screens/internship/InternshipScreen';
import AddLogEntryScreen from '../screens/internship/AddLogEntryScreen';
import WeekendListScreen from '../screens/weekends/WeekendListScreen';
import WeekendDetailScreen from '../screens/weekends/WeekendDetailScreen';
import ConversationListScreen from '../screens/messages/ConversationListScreen';
import ThreadScreen from '../screens/messages/ThreadScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AttendanceHistoryScreen from '../screens/profile/AttendanceHistoryScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

import {
  AssignmentsStackParamList,
  DashboardStackParamList,
  InternshipStackParamList,
  MessagesStackParamList,
  ProfileStackParamList,
  ScheduleStackParamList,
  WeekendsStackParamList,
} from './types';

const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.navy },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '700' },
  headerShadowVisible: false,
};

const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
export function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator screenOptions={screenOptions}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} options={{ title: 'Home' }} />
      <DashboardStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
    </DashboardStack.Navigator>
  );
}

const ScheduleStack = createNativeStackNavigator<ScheduleStackParamList>();
export function ScheduleStackNavigator() {
  return (
    <ScheduleStack.Navigator screenOptions={screenOptions}>
      <ScheduleStack.Screen name="SessionList" component={SessionListScreen} options={{ title: 'Schedule' }} />
      <ScheduleStack.Screen name="SessionDetail" component={SessionDetailScreen} options={{ title: 'Session' }} />
    </ScheduleStack.Navigator>
  );
}

const AssignmentsStack = createNativeStackNavigator<AssignmentsStackParamList>();
export function AssignmentsStackNavigator() {
  return (
    <AssignmentsStack.Navigator screenOptions={screenOptions}>
      <AssignmentsStack.Screen name="AssignmentList" component={AssignmentListScreen} options={{ title: 'Assignments' }} />
      <AssignmentsStack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} options={{ title: 'Assignment' }} />
      <AssignmentsStack.Screen name="Submit" component={SubmitScreen} options={{ title: 'Submit Work' }} />
      <AssignmentsStack.Screen name="Grades" component={GradesScreen} options={{ title: 'Grades' }} />
    </AssignmentsStack.Navigator>
  );
}

const InternshipStack = createNativeStackNavigator<InternshipStackParamList>();
export function InternshipStackNavigator() {
  return (
    <InternshipStack.Navigator screenOptions={screenOptions}>
      <InternshipStack.Screen name="InternshipHome" component={InternshipScreen} options={{ title: 'Internship' }} />
      <InternshipStack.Screen name="AddLogEntry" component={AddLogEntryScreen} options={{ title: 'Add Log Entry' }} />
    </InternshipStack.Navigator>
  );
}

const WeekendsStack = createNativeStackNavigator<WeekendsStackParamList>();
export function WeekendsStackNavigator() {
  return (
    <WeekendsStack.Navigator screenOptions={screenOptions}>
      <WeekendsStack.Screen name="WeekendList" component={WeekendListScreen} options={{ title: 'Weekends' }} />
      <WeekendsStack.Screen name="WeekendDetail" component={WeekendDetailScreen} options={{ title: 'Weekend Details' }} />
    </WeekendsStack.Navigator>
  );
}

const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
export function MessagesStackNavigator() {
  return (
    <MessagesStack.Navigator screenOptions={screenOptions}>
      <MessagesStack.Screen name="ConversationList" component={ConversationListScreen} options={{ title: 'Messages' }} />
      <MessagesStack.Screen name="Thread" component={ThreadScreen} options={{ title: 'Conversation' }} />
    </MessagesStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
export function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} options={{ title: 'Attendance History' }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
    </ProfileStack.Navigator>
  );
}
