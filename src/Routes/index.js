import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext, useState } from "react";
import { Alert, Image, Text, TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminScreen from "../screens/AdminScreen";
import FormProdutoScreen from "../screens/FormProdutoScreen";
import Home from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

import { Ionicons } from "@expo/vector-icons";
import Carrinho from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import DashboardScreen from "../screens/DashboardScreen";
import EditarProdutoScreen from "../screens/EditarProdutoScreen";
import EstoqueScreen from "../screens/EstoqueScreen";
import FavoritosScreen from "../screens/FavoritosScreen";
import ListaProdutosScreen from "../screens/ListaProdutosScreen";
import Login from "../screens/LoginScreen";
import PedidoDetalheScreen from "../screens/PedidoDetalheScreen";
import PedidosScreen from "../screens/PedidosScreen";






const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();




// 🔹 STACK HOME
function HomeStack({ setQuantidadeCarrinho }) {



    const { logout } = useContext(AuthContext);

    const { usuario } = useContext(AuthContext);
    const isAdmin = usuario?.tipo === "admin";

    function sair() {
        Alert.alert(
            "Sair",
            "Deseja realmente sair?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Sair", onPress: logout }
            ]
        );
    }

    return (
        <Stack.Navigator>

            <Stack.Screen
                name="HomeScreen"

                options={{
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => {
                                console.log("clicou");
                                alert("clicou!");
                            }}
                            style={{
                                marginRight: 0,
                                backgroundColor: "#f8e1e7",
                                padding: 10,
                                borderRadius: 10
                            }}
                        >
                            <Text style={{ color: "#b6a724", fontWeight: "bold" }}>Sair</Text>
                        </TouchableOpacity>
                    ),

                    headerStyle: {
                        backgroundColor: "#fdf8f6"
                    },
                    headerTitle: () => (
                        <Text style={{
                            fontFamily: "Playfair", // 💎 SUA FONTE
                            fontSize: 20,
                            color: "#333",
                            letterSpacing: 1
                        }}>
                            G-Joya 💎
                        </Text>
                    ),
                    headerTitleAlign: "center",
                    headerLeft: () => (
                        <Image
                            source={require("../../assets/images/logo-trans.png")}
                            style={{
                                width: 70,
                                height: 60,
                                marginLeft: 10,
                                borderRadius: 20,

                            }}
                            resizeMode="contain"
                        />
                    ),

                }}
            >
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
                options={{
                    title: "Detalhes do Produto",
                    headerStyle: {
                        backgroundColor: "#caa89a"
                    },
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333"
                    }
                }}
            />

             

        </Stack.Navigator>
    );
}


// 🔹 STACK ADMIN
function AdminStack() {

    const { usuario } = useContext(AuthContext);

    if (!usuario) {
        return <Login />;
    }

    return (
        <Stack.Navigator

        >

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

            <Stack.Screen
                name="Estoque"
                component={EstoqueScreen}
                options={{ title: "Estoque 💎" }}
            />

            <Stack.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{ title: "Dashboard 📊" }}
            />

            <Stack.Screen
                name="EditarProduto"
                component={EditarProdutoScreen}
                options={{ title: "Editar Produto ✏️" }}
            />
            <Stack.Screen
                name="ListaProdutos"
                component={ListaProdutosScreen}
                options={{ title: "Produtos 📦" }}
            />

        </Stack.Navigator>
    );
}


// 🔹 STACK PEDIDOS (ESSENCIAL)
function PedidosStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                contentStyle: {
                    backgroundColor: "transparent" // 👈 AQUI
                }
            }}
        >

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



function Tabs() {
    const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
    const { usuario } = useContext(AuthContext);
    const isAdmin = usuario?.tipo === "admin";
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#c48b9f", // 🟡 cor quando ativo (dourado)"#c48b9f"
                tabBarInactiveTintColor: "#aaa",  // ⚪ cor quando inativo (cinza)

                tabBarStyle: {
                    backgroundColor: "#f8e1e7", // fundo do rodapé
                    borderTopWidth: 0,
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 10
                },
                sceneContainerStyle: {
                    backgroundColor: "transparent" // 👈 AQUI (ESSENCIAL)
                }
            }}
        >

            {/* HOME */}
            <Tab.Screen
                name="Home"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    )
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
                    headerTitle: "Meu Carrinho 🛍️",
                    headerTitleAlign: "center",

                    headerStyle: {
                        backgroundColor: "#fdf2f5", // rosé claro
                    },

                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#a06a7d",
                    },

                    headerShadowVisible: false, // remove linha feia



                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bag" size={size} color={color} />
                    ),
                }}
            />

           

            {/* LOGIN */}
            <Tab.Screen
                name="Login"
                component={Login}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    )
                }}
            />

            <Tab.Screen
                name="Favoritos"

                component={FavoritosScreen}
                options={{
                    headerTitleAlign: "center",

                    headerStyle: {
                        backgroundColor: "#fdf2f5",
                    },

                    headerShadowVisible: false,

                    // 🔥 LOGO COLADA NA ESQUERDA
                    headerLeft: () => (
                        <Image
                            source={require("../../assets/images/logo-trans.png")}
                            style={{
                                width: 150,
                                height: 150,
                                marginLeft: 10, // 👈 controla o quão colado fica
                                borderRadius: 6,
                                marginTop: 20, // 👈 ajusta verticalmente
                            }}
                        />
                    ),

                    // 🔥 TÍTULO CENTRAL REAL
                    headerTitle: () => (
                        <Text style={{
                            fontFamily: "Playfair", // 👈 sua fonte
                            fontSize: 20,
                            letterSpacing: 1,
                            color: "#a06a7d",

                        }}>
                            Favoritos
                        </Text>
                    ),
                    // 💖 ÍCONE DO BOTÃO (IMPORTANTE)
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
                    ),
                }}
            />
            {/* "../../assets/images/logo-trans.png" */}
            {/* PEDIDOS */}
            {isAdmin && (
                <Tab.Screen
                    name="Pedidos"
                    component={PedidosStack}
                    options={{ tabBarIcon: () => <Text>📦</Text> }}
                />
            )}

            {usuario?.tipo === "admin" ? (
                <Tab.Screen
                    name="Admin"
                    component={AdminStack}
                    options={{ tabBarIcon: () => <Text>⚙️</Text> }}
                />
            ) : null}

        </Tab.Navigator>
    );
}

// 🔥 ROUTES PRINCIPAL
export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="MainTabs" component={Tabs} />
      
      <Stack.Screen name="Checkout" component={CheckoutScreen} />

    </Stack.Navigator>
  );
}


