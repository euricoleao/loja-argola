import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useContext, useState } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { AuthContext } from "../context/AuthContext";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminScreen from "../screens/AdminScreen";
import FormProdutoScreen from "../screens/FormProdutoScreen";
import Home from "../screens/HomeScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";

import { Ionicons } from "@expo/vector-icons";
import Carrinho from "../screens/CartScreen";
import DashboardScreen from "../screens/DashboardScreen";
import EditarProdutoScreen from "../screens/EditarProdutoScreen";
import EstoqueScreen from "../screens/EstoqueScreen";
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
                    title: " Seja bem vinda a G-Joya 💎",
                    headerTitleAlign: "center",

                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => {
                                console.log("clicou");
                                alert("clicou!");
                            }}
                            style={{
                                marginRight: 15,
                                backgroundColor: "red", // 👈 TESTE VISUAL
                                padding: 10,
                                borderRadius: 10
                            }}
                        >
                            <Text style={{ color: "#fff" }}>SAIR</Text>
                        </TouchableOpacity>
                    ),

                    headerStyle: {
                        backgroundColor: "#fdf8f6"
                    },
                    headerTitleStyle: {
                        fontWeight: "bold",
                        fontSize: 18,
                        color: "#333"
                    }


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
                options={{ title: "Detalhes do Produto" }}
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

export default function Routes() {
    const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
    const { usuario } = useContext(AuthContext);
    const isAdmin = usuario?.tipo === "admin";
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#c48b9f", // 🟡 cor quando ativo (dourado)"#c48b9f"
                tabBarInactiveTintColor: "#aaa",  // ⚪ cor quando inativo (cinza)

                tabBarStyle: {
                    backgroundColor: "#fff", // fundo do rodapé
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 60
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
                    tabBarBadge: quantidadeCarrinho > 0 ? quantidadeCarrinho : null,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="cart" size={size} color={color} />
                    )
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


