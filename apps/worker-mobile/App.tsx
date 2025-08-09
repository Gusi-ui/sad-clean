import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

function TodayScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hoy</Text>
    </View>
  );
}
function BalancesScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Balances</Text>
    </View>
  );
}
function PlanningScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Planning</Text>
    </View>
  );
}
function ProfileScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Perfil</Text>
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name='Hoy' component={TodayScreen} />
        <Tab.Screen name='Balances' component={BalancesScreen} />
        <Tab.Screen name='Planning' component={PlanningScreen} />
        <Tab.Screen name='Perfil' component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
