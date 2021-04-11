import {createStackNavigator} from 'react-navigation-stack';
import {createAppContainer} from 'react-navigation';
import {TouchableOpacity, Text} from 'react-native';
import Dashboard from '../Dashboard';

const AppNavigator = createStackNavigator(
    {
      Dashboard: {
        screen: Dashboard,
      }
    },
     
    {
      initialRouteName: 'Dashboard',
      headerMode:'none',
      mode: 'modal',
      lazy: true,
    },
  );

export default createAppContainer(AppNavigator);