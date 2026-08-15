import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.offWhite }}>
        <ActivityIndicator size="large" color={colors.amber} />
      </View>
    );
  }

  return <NavigationContainer>{isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}</NavigationContainer>;
}
