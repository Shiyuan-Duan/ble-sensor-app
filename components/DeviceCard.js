import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const DeviceCard = ({ device, onPress }) => {
    return (
      <TouchableOpacity onPress={() => onPress(device)} style={styles.card}>
        <Text style={styles.deviceName}>{device.name || 'Unnamed Device'}</Text>
        <Text style={styles.deviceId}>{device.id}</Text>
      </TouchableOpacity>
    );
  };
  

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  }
});

export default DeviceCard;
