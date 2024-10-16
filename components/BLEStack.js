// Import the necessary components
import { createStackNavigator } from '@react-navigation/stack';
import ScanBLEDevicesScreen from '../screens/ScanBLEDevicesScreen';
import DeviceDetailsScreen from '../screens/DeviceDetailsScreen';

const Stack = createStackNavigator();

const BLEStack = () => {
  return (
    <Stack.Navigator initialRouteName="ScanDevices">
      <Stack.Screen name="ScanDevices" component={ScanBLEDevicesScreen} options={{ title: 'Scan Devices' }} />
      <Stack.Screen name="DeviceDetails" component={DeviceDetailsScreen} options={{ title: 'Device Details' }} />
    </Stack.Navigator>
  );
};

export default BLEStack;
