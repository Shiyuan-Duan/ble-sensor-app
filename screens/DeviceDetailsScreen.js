import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Button } from 'react-native';
import CircularPulse from '../components/CircularPulse';
import ChartComponent from '../components/ChartComponent';
import StreamingControl from '../components/StreamingControl';
import BleService from '../services/BleService';
import { Buffer } from 'buffer';
import { BLE_CONFIG } from '../config';
global.Buffer = Buffer;

const DeviceDetailsScreen = ({ route, navigation }) => {
    const { deviceId, deviceName } = route.params;
    const [loading, setLoading] = useState(true);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const manager = BleService.getInstance();

    useEffect(() => {
        let disconnectionSubscription;
        let reconnectTimeout;

        const handleDisconnect = () => {
            setIsReconnecting(true);
            setTimeout(() => {
                if (isReconnecting) {
                    reconnectDevice();
                }
            }, 5000); // Attempt to reconnect for 5 seconds
        };

        const reconnectDevice = async () => {
            try {
                await manager.connectToDevice(deviceId);
                await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
                setIsReconnecting(false); // Reconnection successful
                setLoading(false);
            } catch (error) {
                console.error("Reconnection failed:", error);
                Alert.alert("Reconnection Failed", "Unable to reconnect. Returning to scan screen.");
                navigation.navigate('ScanDevices'); // Navigate back if reconnection fails
            }
        };

        const setupNotifications = async () => {
            try {
                await manager.connectToDevice(deviceId);
                disconnectionSubscription = manager.onDeviceDisconnected(deviceId, handleDisconnect);
                await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
                setLoading(false);
            } catch (error) {
                console.error("Error connecting to device:", error);
                Alert.alert("Connection Error", "Failed to connect to the device.");
                navigation.goBack();
            }
        };

        setupNotifications();

        return () => {
            clearTimeout(reconnectTimeout);
            manager.cancelDeviceConnection(deviceId).catch(console.error);
            disconnectionSubscription?.remove();
            setIsReconnecting(false);
        };
    }, [deviceId, navigation, isReconnecting]);

    return (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <Text style={styles.title}>{deviceName || "Unnamed Device"}</Text>
                {loading || isReconnecting ? (
                    <>
                        <ActivityIndicator size="large" color="#0000ff" />
                        {isReconnecting && (
                            <Button title="Abort Reconnect" onPress={() => {
                                setIsReconnecting(false);
                                navigation.goBack();
                            }} />
                        )}
                    </>
                ) : (
                    <>
                        <StreamingControl deviceId={deviceId} />
                        <CircularPulse deviceId={deviceId} />
                        <ChartComponent title={"PPG LED Green"} deviceId={deviceId} color={'rgb(239,202,112)'} serviceUUID={BLE_CONFIG.serviceUUID} characteristicId={BLE_CONFIG.characteristicUUIDs.channel1} />
                        <ChartComponent title={"PPG LED Red"} deviceId={deviceId} color={'rgb(106,79,121)'} serviceUUID={BLE_CONFIG.serviceUUID} characteristicId={BLE_CONFIG.characteristicUUIDs.channel2} />
                        <ChartComponent title={"PPG LED IR"} deviceId={deviceId} color={'rgb(170,214,117)'} serviceUUID={BLE_CONFIG.serviceUUID} characteristicId={BLE_CONFIG.characteristicUUIDs.channel3} />
                    </>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollViewContent: {
        paddingVertical: 20,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});

export default DeviceDetailsScreen;
