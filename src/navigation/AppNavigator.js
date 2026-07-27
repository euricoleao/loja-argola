import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CartScreen from '../screens/CartScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PerfilScreen from '../screens/PerfilScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductsScreen from '../screens/ProductsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { usuario, loading } = useContext(AuthContext);

  if (loading) {
    return null; // depois podemos colocar uma tela de carregamento
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Carrinho" component={CartScreen} />

        {usuario ? (
          <Tab.Screen name="Perfil" component={PerfilScreen} />
        ) : (
          <Tab.Screen name="Login" component={LoginScreen} />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
