/**
 * Navigation Setup
 * Configures Tab Navigator and Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { RootStackParamList, BottomTabParamList } from '../types';

// Stack Navigators
export const RootStack = createNativeStackNavigator<RootStackParamList>();
export const DashboardStack = createNativeStackNavigator<RootStackParamList>();
export const EnquiryStack = createNativeStackNavigator<RootStackParamList>();
export const AddStack = createNativeStackNavigator<RootStackParamList>();
export const SettingsStack = createNativeStackNavigator<RootStackParamList>();

// Bottom Tab Navigator
export const BottomTab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Dashboard Stack Navigator
 * Dashboard -> EnquiryDetail -> EmailCompose
 */
export const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <DashboardStack.Screen name="Dashboard" component={() => null} />
    </DashboardStack.Navigator>
  );
};

/**
 * Enquiry List Stack Navigator
 * EnquiryList -> EnquiryDetail -> EmailCompose -> CompanyDetail
 */
export const EnquiryStackNavigator = () => {
  return (
    <EnquiryStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <EnquiryStack.Screen name="EnquiryList" component={() => null} />
    </EnquiryStack.Navigator>
  );
};

/**
 * Add Enquiry Stack Navigator
 */
export const AddStackNavigator = () => {
  return (
    <AddStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AddStack.Screen name="AddEnquiry" component={() => null} />
    </AddStack.Navigator>
  );
};

/**
 * Settings Stack Navigator
 */
export const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen name="Settings" component={() => null} />
    </SettingsStack.Navigator>
  );
};

/**
 * Bottom Tab Navigator
 */
export const BottomTabNavigator = ({ DashboardComponent, EnquiryListComponent, AddEnquiryComponent, SettingsComponent }: any) => {
  return (
    <BottomTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'ListTab') {
            iconName = 'format-list-bulleted';
          } else if (route.name === 'AddTab') {
            iconName = 'plus-circle';
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog';
          }

          // Ensure size is a number (React Navigation sometimes passes strings)
          const numSize = typeof size === 'string' ? 24 : size;
          return <MaterialCommunityIcons name={iconName} size={numSize} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text_secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingBottom: 5,
          height: 60,
        },
      })}
    >
      <BottomTab.Screen
        name="HomeTab"
        component={DashboardComponent}
        options={{ title: 'Home' }}
      />
      <BottomTab.Screen
        name="ListTab"
        component={EnquiryListComponent}
        options={{ title: 'Enquiries' }}
      />
      <BottomTab.Screen
        name="AddTab"
        component={AddEnquiryComponent}
        options={{ title: 'Add' }}
      />
      <BottomTab.Screen
        name="SettingsTab"
        component={SettingsComponent}
        options={{ title: 'Settings' }}
      />
    </BottomTab.Navigator>
  );
};

/**
 * Screen Options Helper
 */
export const screenOptions = (title: string) => ({
  headerTitle: title,
  headerTintColor: COLORS.primary,
  headerStyle: {
    backgroundColor: COLORS.surface,
  },
  headerTitleStyle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: COLORS.text_primary,
  },
});
