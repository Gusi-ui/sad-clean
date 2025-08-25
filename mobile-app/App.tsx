import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { useNotifications } from './src/hooks/useNotifications';
// Screens - Usando la misma estructura que el dashboard web
import BalancesScreen from './src/screens/Balances';
import HomeScreen from './src/screens/Home';
import LoginScreen from './src/screens/Login';
import RouteScreen from './src/screens/Route';
import ScheduleScreen from './src/screens/Schedule';
import UpcomingScreen from './src/screens/Upcoming';

const Tab = createBottomTabNavigator();

// Navegación igual al dashboard web de trabajadoras
const NAV_ITEMS = [
  { name: 'Inicio', component: HomeScreen, icon: '🏠' },
  { name: 'Ruta', component: RouteScreen, icon: '🗺️' },
  { name: 'Planilla', component: ScheduleScreen, icon: '📋' },
  { name: 'Próximos', component: UpcomingScreen, icon: '📅' },
  { name: 'Balance', component: BalancesScreen, icon: '⏱️' },
];

function RootTabs(): React.JSX.Element {
  const { user, loading } = useAuth();
  useNotifications(); // Inicializa automáticamente las notificaciones

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Cargando…</Text>
      </View>
    );
  }

  if (user === null) {
    return <LoginScreen />;
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 2,
          borderTopColor: '#3b82f6',
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {NAV_ITEMS.map((item) => (
        <Tab.Screen
          key={item.name}
          name={item.name}
          component={item.component}
          options={{
            tabBarIcon: ({ focused }) => (
              <Text
                style={{
                  fontSize: 24,
                  opacity: focused ? 1 : 0.6,
                }}
              >
                {item.icon}
              </Text>
            ),
          }}
        />
      ))}
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
