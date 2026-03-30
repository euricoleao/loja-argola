import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { Text } from "react-native";

import { CartProvider } from "./src/context/CartContext";

// SCREENS
import Carrinho from "./src/screens/CartScreen";
import Home from "./src/screens/HomeScreen";
import Login from "./src/screens/LoginScreen";
import ProductDetailScreen from "./src/screens/ProductDetailScreen";

import AdminScreen from "./src/screens/AdminScreen";
import FormProdutoScreen from "./src/screens/FormProdutoScreen";

import { AuthProvider } from "./src/context/AuthContext";
import PedidoDetalheScreen from "./src/screens/PedidoDetalheScreen";
import PedidosScreen from "./src/screens/PedidosScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// 🔹 STACK HOME
function HomeStack({ setQuantidadeCarrinho }) {
  return (
    <Stack.Navigator>

      <Stack.Screen name="HomeScreen">
        {props => (
          <Home
            {...props}
            setQuantidadeCarrinho={setQuantidadeCarrinho}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Produto"
        component={ProductDetailScreen}
        options={{ title: "Detalhes do Produto" }}
      />

    </Stack.Navigator>
  );
}


// 🔹 STACK ADMIN
function AdminStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="AdminHome"
        component={AdminScreen}
        options={{ title: "Admin" }}
      />

      <Stack.Screen
        name="CadastrarProduto"
        component={FormProdutoScreen}
        options={{ title: "Cadastrar Produto" }}
      />

    </Stack.Navigator>
  );
}


// 🔹 STACK PEDIDOS (ESSENCIAL)
function PedidosStack() {
  return (
    <Stack.Navigator>

      <Stack.Screen
        name="PedidosLista"
        component={PedidosScreen}
        options={{ title: "Pedidos" }}
      />

      <Stack.Screen
        name="PedidoDetalhe"
        component={PedidoDetalheScreen}
        options={{ title: "Detalhes do Pedido" }}
      />

    </Stack.Navigator>
  );
}


// 🔥 APP PRINCIPAL
export default function App() {

  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);

  return (
    <AuthProvider>
    <CartProvider>
      <NavigationContainer>

        <Tab.Navigator>

          {/* HOME */}
          <Tab.Screen name="Home"
             options={{
                  tabBarIcon: () => <Text>📦</Text>
                }}
          >
            {props => (
              <HomeStack
                {...props}
                setQuantidadeCarrinho={setQuantidadeCarrinho}
             

              />
            )}
          </Tab.Screen>

          {/* CARRINHO */}
          <Tab.Screen
            name="Carrinho"
            component={Carrinho}
            options={{
              tabBarBadge: quantidadeCarrinho > 0 ? quantidadeCarrinho : null
              ,
              tabBarIcon: () => <Text>📦</Text>
            }}


          />

          {/* LOGIN */}
          <Tab.Screen
            name="Login"
            component={Login}
            options={{
              tabBarIcon: () => <Text>📦</Text>
            }}
          />

          {/* PEDIDOS */}
          <Tab.Screen
            name="Pedidos"
            component={PedidosStack}
            options={{
              tabBarIcon: () => <Text>📦</Text>
            }}
          />

          {/* ADMIN */}
          <Tab.Screen
            name="Admin"
            component={AdminStack}
            options={{
              tabBarIcon: () => <Text>⚙️</Text>
            }}
          />

        </Tab.Navigator>

      </NavigationContainer>
    </CartProvider>
    </AuthProvider>
  );
}