import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/Login';
import Today from './src/screens/Today';

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

function RootTabs(): React.JSX.Element {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando…</Text>
      </View>
    );
  if (user === null) return <LoginScreen />;
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name='Hoy' component={Today} />
      <Tab.Screen name='Balances' component={BalancesScreen} />
      <Tab.Screen name='Planning' component={PlanningScreen} />
      <Tab.Screen name='Perfil' component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootTabs />
      </NavigationContainer>
    </AuthProvider>
  );
}
