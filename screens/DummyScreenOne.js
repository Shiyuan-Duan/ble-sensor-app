// DummyScreenOne.js
import React from 'react';
import { View, Text } from 'react-native';
import CircularPulse from '../components/CircularPulse';
const DummyScreenOne = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Home Screen</Text>
      <CircularPulse pulseRate={75} />
    </View>
  );
};

export default DummyScreenOne;

// Repeat similarly for DummyScreenTwo.js with different content
