/**
 * Winfraatech Enquiry Manager
 * Main App Entry Point
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from './src/constants';
import { RootStackParamList } from './src/types';
import { notificationService } from './src/services/notificationService';

// Screens
import { DashboardScreen } from './src/screens/DashboardScreen';
import { EnquiryListScreen } from './src/screens/EnquiryListScreen';
import { EnquiryDetailScreen } from './src/screens/EnquiryDetailScreen';
import { AddEnquiryScreen } from './src/screens/AddEnquiryScreen';
import { EmailComposeScreen } from './src/screens/EmailComposeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { supabaseService } from './src/services/supabaseService';

// Navigator setup
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

/**
 * Home Stack Navigator (Dashboard)
 */
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text_primary,
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EnquiryDetail"
        component={EnquiryDetailScreen}
        options={{
          title: 'Enquiry Details',
        }}
      />
      <Stack.Screen
        name="EmailCompose"
        component={EmailComposeScreen}
        options={{
          title: 'Compose Email',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Enquiry List Stack Navigator
 */
const EnquiryListStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text_primary,
        },
      }}
    >
      <Stack.Screen
        name="EnquiryList"
        component={EnquiryListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EnquiryDetail"
        component={EnquiryDetailScreen}
        options={{
          title: 'Enquiry Details',
        }}
      />
      <Stack.Screen
        name="EmailCompose"
        component={EmailComposeScreen}
        options={{
          title: 'Compose Email',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Add Enquiry Stack Navigator
 */
const AddEnquiryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text_primary,
        },
      }}
    >
      <Stack.Screen
        name="AddEnquiry"
        component={AddEnquiryScreen}
        options={{
          title: 'Create New Enquiry',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Settings Stack Navigator
 */
const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: COLORS.text_primary,
        },
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Bottom Tab Navigator
 */
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ListTab') {
            iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          } else if (route.name === 'AddTab') {
            iconName = 'plus-circle';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'cog' : 'cog-outline';
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
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="ListTab"
        component={EnquiryListStack}
        options={{
          title: 'Enquiries',
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddEnquiryStack}
        options={{
          title: 'Add',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main App Component
 */
export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize app on startup
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notifications
        await notificationService.initializeNotifications();
        console.log('App initialized successfully');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown initialization error';
        console.error('Error initializing app:', errorMsg);
        setInitError(errorMsg);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (initError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.error, textAlign: 'center', padding: 20 }}>
          Initialization Error: {initError}
        </Text>
      </View>
    );
  }

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={50} color={COLORS.primary} />
      </View>
    );
  }

  try {
    return (
      <PaperProvider>
        <NavigationContainer>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          <BottomTabNavigator />
        </NavigationContainer>
      </PaperProvider>
    );
  } catch (error) {
    console.error('Navigation error:', error);
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color:  COLORS.error, textAlign: 'center', padding: 20 }}>
          Navigation Error: {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
