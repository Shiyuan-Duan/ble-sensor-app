import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import BleService from '../services/BleService';
import { BLE_CONFIG } from '../config';

const StreamingControl = ({ deviceId }) => {
    const [isStreaming, setIsStreaming] = useState(false);
    const manager = BleService.getInstance();

    const startStreaming = async () => {
        try {
            await manager.writeCharacteristicWithResponseForDevice(
                deviceId,
                BLE_CONFIG.serviceUUID,
                BLE_CONFIG.characteristicUUIDs.is_streaming,
                'AQ==' // Base64 for 0x01
            );
            setIsStreaming(true);
        } catch (error) {
            console.error("Failed to start streaming:", error);
        }
    };

    const endStreaming = async () => {
        try {
            await manager.writeCharacteristicWithResponseForDevice(
                deviceId,
                BLE_CONFIG.serviceUUID,
                BLE_CONFIG.characteristicUUIDs.is_streaming,
                'AA==' // Base64 for 0x00
            );
            setIsStreaming(false);
        } catch (error) {
            console.error("Failed to end streaming:", error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, isStreaming && styles.disabledButton]}
                onPress={startStreaming}
                disabled={isStreaming}
            >
                <Text style={styles.buttonText}>Start Streaming</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, !isStreaming && styles.disabledButton, styles.endButton]}
                onPress={endStreaming}
                disabled={!isStreaming}
            >
                <Text style={styles.buttonText}>End Streaming</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        width: '100%',
    },
    button: {
        flex: 1,
        backgroundColor: 'green',
        padding: 15,
        margin: 5,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    endButton: {
        backgroundColor: 'red',
    },
    disabledButton: {
        backgroundColor: 'gray',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default StreamingControl;
