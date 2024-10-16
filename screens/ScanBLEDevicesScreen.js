import React, { useState, useEffect } from 'react';
import { Text, View, Button, FlatList, StyleSheet, RefreshControl, Alert, ActivityIndicator, Modal } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import DeviceCard from '../components/DeviceCard';

import BleService from '../services/BleService';



const ScanBLEDevicesScreen = ({ navigation }) => {
    const manager = BleService.getInstance();
    const [devices, setDevices] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    
    useEffect(() => {
        return () => manager.stopDeviceScan();
    }, []);

    const handleScanDevices = () => {
        if (scanning) return;
        setRefreshing(true); // Start refresh
        setDevices([]);
        setScanning(true);
        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.log(error);
                setScanning(false);
                setRefreshing(false); // Stop refresh
                return;
            }
            if (device) {
                setDevices(prevDevices => {
                    const deviceExists = prevDevices.some(item => item.id === device.id);
                    if (!deviceExists) {
                        return [...prevDevices, device];
                    }
                    return prevDevices;
                });
            }
        });

        setTimeout(() => {
            manager.stopDeviceScan();
            setScanning(false);
            setRefreshing(false); // Stop refresh
        }, 5000);
    };

    const handleDevicePress = async (device) => {
        setIsConnecting(true);

        try {
            await manager.connectToDevice(device.id);
            setIsConnecting(false);
            navigation.navigate('DeviceDetails', { deviceId: device.id, deviceName: device.name });
        } catch (error) {
            setIsConnecting(false);
            Alert.alert('Connection Failed', 'Failed to connect to the device. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Scan for Devices" onPress={handleScanDevices} disabled={scanning || isConnecting} />
            <Modal
                animationType="fade"
                transparent={true}
                visible={isConnecting}
                onRequestClose={() => {
                    Alert.alert("Modal has been closed.");
                    setIsConnecting(!isConnecting);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.modalText}>Connecting...</Text>
                    </View>
                </View>
            </Modal>
            <FlatList
                data={devices}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <DeviceCard device={item} onPress={() => handleDevicePress(item)} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleScanDevices}
                        colors={["#9Bd35A", "#689F38"]}
                        tintColor="#0000ff"
                    />
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    }
});

export default ScanBLEDevicesScreen;
