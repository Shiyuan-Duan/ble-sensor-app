import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DummyScreenOne from '../screens/DummyScreenOne';
import DummyScreenTwo from '../screens/DummyScreenTwo';
import BLEStack from './BLEStack'; // Import the stack navigator

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={DummyScreenOne} />
        <Tab.Screen name="Settings" component={DummyScreenTwo} />
        <Tab.Screen name="BLE Scan" component={BLEStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default BottomTabNavigator;
