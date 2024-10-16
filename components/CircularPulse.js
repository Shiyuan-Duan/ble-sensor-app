import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import BleService from '../services/BleService';
import { BLE_CONFIG } from '../config';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

const CircularPulse = ({ deviceId }) => {
  const [pulseRate, setPulseRate] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const rotate = () => {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      ).start();
    };

    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    rotate();
    pulse();
  }, [rotateAnim, scaleAnim]);

  useEffect(() => {
    const manager = BleService.getInstance();
    let subscription;

    const setupNotifications = async () => {
      try {
        await manager.connectToDevice(deviceId);
        await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
        subscription = manager.monitorCharacteristicForDevice(
          deviceId,
          BLE_CONFIG.serviceUUID,
          BLE_CONFIG.characteristicUUIDs.hr,
          (error, characteristic) => {
            if (error) {
              console.error("Error setting up notifications:", error);
              return;
            }
            if (characteristic && characteristic.value) {
              const value = Buffer.from(characteristic.value, 'base64').readUInt8(0);
              setPulseRate(value);
            }
          }
        );
      } catch (error) {
        console.error("Error connecting to device:", error);
      }
    };

    setupNotifications();

    return () => {
      if (subscription) {
        subscription.remove();
      }
      manager.cancelDeviceConnection(deviceId);
    };
  }, [deviceId]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const trailDots = Array.from({ length: 10 }).map((_, index) => {
    const trailAnim = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [`${index * 36}deg`, `${index * 36 + 360}deg`],
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.trailDot,
          {
            transform: [{ rotate: trailAnim }, { translateX: 50 }],
            opacity: 1 - index * 0.1,
          },
        ]}
      >
        <View style={styles.glowingDot} />
      </Animated.View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Pulsing Circle */}
      <Animated.View style={[styles.pulsingCircle, { transform: [{ scale: scaleAnim }] }]}>
        {/* Glowing Mark with Trail */}
        {trailDots}
      </Animated.View>

      {/* Inner Circle */}
      <View style={styles.innerCircle}>
        <Text style={styles.text}>{pulseRate}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  pulsingCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  glowingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#05C7F2',
    shadowColor: '#05C7F2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  trailDot: {
    position: 'absolute',
    width: 10,
    height: 10,
  },
  innerCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#05C7F2',
    fontSize: 34,
    fontWeight: 'bold',
  },
});

export default CircularPulse;
