import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart, Grid, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import BleService from '../services/BleService';
import { Buffer } from 'buffer';

const ChartComponent = ({ title, deviceId, color, serviceUUID, characteristicId }) => {
    const screenWidth = Dimensions.get('window').width;
    const [data, setData] = useState([0]); // Initial mock data to render chart
    const dataQueue = useRef([]); // Queue to store incoming data
    const dataLength = 1024;
    useEffect(() => {
        const manager = BleService.getInstance();
        let subscription;

        const setupNotifications = async () => {
            try {
                subscription = manager.monitorCharacteristicForDevice(
                    deviceId,
                    serviceUUID,
                    characteristicId,
                    (error, characteristic) => {
                        if (error) {
                            console.error("Error setting up notifications:", error);
                            return;
                        }
                        if (characteristic) {
                            const value = Buffer.from(characteristic.value, 'base64');
                            const int32Data = [];
                            for (let i = 0; i < value.length; i += 4) {
                                if (i + 4 <= value.length) {
                                    const int32 = value.readInt32LE(i);
                                    int32Data.push(int32);
                                }
                            }
                            let endIndex = int32Data.length;
                            while (endIndex > 0 && int32Data[endIndex - 1] === 0) {
                                endIndex--;
                            }
                            const trimmedData = int32Data.slice(0, endIndex);
                            dataQueue.current.push(...trimmedData);
                        }
                    }
                );
            } catch (error) {
                console.error("Error connecting to device:", error);
            }
        };

        setupNotifications();

        const interval = setInterval(() => {
            if (dataQueue.current.length > 0) {
                setData(prevData => {
                    const newData = [...prevData, ...dataQueue.current];
                    dataQueue.current = [];
                    return newData.slice(-dataLength);
                });
            }
        }, 100);

        return () => {
            if (subscription) {
                subscription.remove();
            }
            clearInterval(interval);
        };
    }, [deviceId, serviceUUID, characteristicId]);

    // useEffect(() => {
    //     console.log("Filtered data:", data);
    // }, [data]);

    const filteredData = data.filter(value => typeof value === 'number' && !isNaN(value) && isFinite(value));

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.chartContainer}>
                <YAxis
                    data={filteredData}
                    contentInset={{ top: 20, bottom: 20 }}
                    svg={{ fill: 'grey', fontSize: 10 }}
                    numberOfTicks={10}
                    formatLabel={(value) => `${value}`}
                />
                <LineChart
                    style={styles.chart}
                    data={filteredData}
                    svg={{ stroke: color, strokeWidth: 2 }}
                    contentInset={{ top: 20, bottom: 20 }}
                    curve={shape.curveLinear}
                >
                    <Grid belowChart={true} svg={{ fill: 'grey' }} contentInset={{ top: 20, bottom: 20 }} />
                </LineChart>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
        marginBottom: 20,
        padding: 15,
        width: '90%',
        alignSelf: 'center',
    },
    chartContainer: {
        height: 200,
        flexDirection: 'row',
    },
    chart: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#333',
    },
});

export default ChartComponent;
