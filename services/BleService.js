// Filename: services/BleService.js
import { BleManager } from 'react-native-ble-plx';

class BleService {
    static instance = null;

    static getInstance() {
        if (BleService.instance == null) {
            BleService.instance = new BleManager();
        }
        return BleService.instance;
    }

    onDeviceDisconnected(deviceId, callback) {
        this.getInstance().onDeviceDisconnected(deviceId, callback);
    }

    removeDeviceDisconnectedListener(deviceId, callback) {
        this.getInstance().removeListener('DeviceDisconnected', callback);
    }
}

export default BleService;
