import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminScreen from '../screens/AdminScreen';
import FormProdutoScreen from '../screens/FormProdutoScreen';
import Home from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';

import { Ionicons } from '@expo/vector-icons';
import AlterarSenhaScreen from '../screens/AlterarSenhaScreen';
import Carrinho from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ClienteDetalheScreen from '../screens/ClienteDetalheScreen';
import ClientesScreen from '../screens/ClientesScreen';
import ConfiguracoesScreen from '../screens/ConfiguracoesScreen';
import CreditoPrazoScreen from '../screens/CreditoPrazoScreen';
import DadosContaScreen from '../screens/DadosContaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EditarProdutoScreen from '../screens/EditarProdutoScreen';
import EnderecosScreen from '../screens/EnderecosScreen';
import EstoqueScreen from '../screens/EstoqueScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import FinanceiroScreen from '../screens/FinanceiroScreen';
import GerenciarClientesScreen from '../screens/GerenciarClientesScreen';
import GerenciarNotificacoesScreen from '../screens/GerenciarNotificacoesScreen';
import ListaProdutosScreen from '../screens/ListaProdutosScreen';
import Login from '../screens/LoginScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import PagamentosScreen from '../screens/PagamentosScreen';
import PedidoDetalheScreen from '../screens/PedidoDetalheScreen';
import PedidosScreen from '../screens/PedidosScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PrazoPagamentoScreen from '../screens/PrazoPagamentoScreen';
import PrivacidadeSegurancaScreen from '../screens/PrivacidadeSegurancaScreen';
import SobreAplicativoScreen from '../screens/SobreAplicativoScreen';
import TermosUsoScreen from '../screens/TermosUsoScreen';
import VendasFinanceiroScreen from '../screens/VendasFinanceiroScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 🔹 STACK HOME
function HomeStack({ setQuantidadeCarrinho }) {
  const { logout } = useContext(AuthContext);

  const { usuario } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === 'admin';

  function sair() {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: logout },
    ]);
  }

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        options={{
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                console.log('clicou');
                alert('clicou!');
              }}
              style={{
                marginRight: 0,
                backgroundColor: '#f8e1e7',
                padding: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#b6a724', fontWeight: 'bold' }}>Sair</Text>
            </TouchableOpacity>
          ),

          headerStyle: {
            backgroundColor: '#fdf8f6',
          },
          headerTitle: () => (
            <Text
              style={{
                fontFamily: 'Playfair', // 💎 SUA FONTE
                fontSize: 20,
                color: '#333',
                letterSpacing: 1,
              }}
            >
              G-Joya 💎
            </Text>
          ),
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Image
              source={require('../../assets/images/logo-trans.png')}
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
        {(props) => (
          <Home {...props} setQuantidadeCarrinho={setQuantidadeCarrinho} />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Produto"
        component={ProductDetailScreen}
        options={{
          title: 'Detalhes do Produto',
          headerStyle: {
            backgroundColor: '#caa89a',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: '#333',
          },
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
    <Stack.Navigator>
      <Stack.Screen
        name="AdminHome"
        component={AdminScreen}
        options={{ title: 'Admin' }}
      />

      <Stack.Screen
        name="CadastrarProduto"
        component={FormProdutoScreen}
        options={{ title: 'Cadastrar Produto' }}
      />

      <Stack.Screen
        name="Estoque"
        component={EstoqueScreen}
        options={{ title: 'Estoque 💎' }}
      />

      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard 📊' }}
      />

      <Stack.Screen
        name="EditarProduto"
        component={EditarProdutoScreen}
        options={{ title: 'Editar Produto ✏️' }}
      />
      <Stack.Screen
        name="ListaProdutos"
        component={ListaProdutosScreen}
        options={{ title: 'Produtos 📦' }}
      />
      <Stack.Screen
        name="Financeiro"
        component={FinanceiroScreen}
        options={{ title: 'Financeiro 💰' }}
      />

      <Stack.Screen
        name="VendasFinanceiro"
        component={VendasFinanceiroScreen}
        options={{
          title: 'Vendas 💰',
        }}
      />

      <Stack.Screen
        name="GerenciarClientes"
        component={GerenciarClientesScreen}
      />

      <Stack.Screen name="Clientes" component={ClientesScreen} />

      <Stack.Screen name="CreditoPrazo" component={CreditoPrazoScreen} />

      <Stack.Screen
        name="ClienteDetalhe"
        component={ClienteDetalheScreen}
        options={{
          title: 'Detalhes do Cliente',
        }}
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
          backgroundColor: 'transparent', // 👈 AQUI
        },
      }}
    >
      <Stack.Screen
        name="PedidosLista"
        component={PedidosScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="PedidoDetalhe"
        component={PedidoDetalheScreen}
        options={{ title: 'Detalhes do Pedido' }}
      />
    </Stack.Navigator>
  );
}

function PerfilStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Minha Conta',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#D8A7B1', // rosé
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: '700',
            letterSpacing: 1,
          },
        }}
      />

      <Stack.Screen
        name="MeusPedidos"
        component={PedidosScreen}
        options={{
          title: 'Meus Pedidos',
        }}
      />

      <Stack.Screen
        name="PedidoDetalhe"
        component={PedidoDetalheScreen}
        options={{
          title: 'Detalhes do Pedido',
        }}
      />

      <Stack.Screen
        name="MeusEnderecos"
        component={EnderecosScreen}
        options={{ title: 'Meus Endereços' }}
      />

      <Stack.Screen
        name="FormasPagamento"
        component={PagamentosScreen}
        options={{ title: 'Formas de Pagamento' }}
      />

      <Stack.Screen
        name="PrazoPagamento"
        component={PrazoPagamentoScreen}
        options={{ title: 'Compra a prazo' }}
      />

      <Stack.Screen
        name="Notificacoes"
        component={NotificacoesScreen}
        options={{
          title: 'Notificações 🔔',
        }}
      />
      <Stack.Screen
        name="Configuracoes"
        component={ConfiguracoesScreen}
        options={{
          title: 'Configurações',
        }}
      />
      <Stack.Screen
        name="DadosConta"
        component={DadosContaScreen}
        options={{
          title: 'Dados da conta',
        }}
      />
      <Stack.Screen
        name="AlterarSenha"
        component={AlterarSenhaScreen}
        options={{
          title: 'Alterar senha',
        }}
      />
      <Stack.Screen
        name="GerenciarNotificacoes"
        component={GerenciarNotificacoesScreen}
        options={{
          title: 'Notificações',
        }}
      />
      <Stack.Screen
        name="PrivacidadeSeguranca"
        component={PrivacidadeSegurancaScreen}
      />
      <Stack.Screen name="TermosUso" component={TermosUsoScreen} />
      <Stack.Screen name="SobreAplicativo" component={SobreAplicativoScreen} />
    </Stack.Navigator>
  );
}

function Tabs() {
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);
  const { usuario } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === 'admin';
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#c48b9f', // 🟡 cor quando ativo (dourado)"#c48b9f"
        tabBarInactiveTintColor: '#aaa', // ⚪ cor quando inativo (cinza)

        tabBarStyle: {
          backgroundColor: '#f8e1e7', // fundo do rodapé
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        sceneContainerStyle: {
          backgroundColor: 'transparent', // 👈 AQUI (ESSENCIAL)
        },
      }}
    >
      {/* HOME */}
      <Tab.Screen
        name="Home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <HomeStack {...props} setQuantidadeCarrinho={setQuantidadeCarrinho} />
        )}
      </Tab.Screen>

      {/* CARRINHO */}
      <Tab.Screen
        name="Carrinho"
        component={Carrinho}
        options={{
          headerTitle: 'Meu Carrinho 🛍️',
          headerTitleAlign: 'center',

          headerStyle: {
            backgroundColor: '#fdf2f5', // rosé claro
          },

          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
            color: '#a06a7d',
          },

          headerShadowVisible: false, // remove linha feia

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}
      />

      {/* LOGIN */}
      {!usuario ? (
        <Tab.Screen
          name="Login"
          component={Login}
          options={{
            headerTitleAlign: 'center',
            headerShown: false,
            headerStyle: {
              backgroundColor: '#fdf2f5',
            },

            headerShadowVisible: false,

            // 🔥 LOGO NA ESQUERDA
            headerLeft: () => (
              <Image
                source={require('../../assets/images/logo-trans.png')}
                style={{
                  width: 70,
                  height: 60,
                  marginLeft: 10,
                }}
                resizeMode="contain"
              />
            ),

            // 🔥 TÍTULO CENTRAL COM SUA FONTE
            headerTitle: () => (
              <Text
                style={{
                  fontFamily: 'Playfair',
                  fontSize: 20,
                  letterSpacing: 1,
                  color: '#a06a7d',
                }}
              >
                Entrar
              </Text>
            ),

            // 🔥 ÍCONE ABA
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      ) : (
        <Tab.Screen
          name="Perfil"
          component={PerfilStack}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          headerTitleAlign: 'center',

          headerStyle: {
            backgroundColor: '#fdf2f5',
          },

          headerShadowVisible: false,

          // 🔥 LOGO COLADA NA ESQUERDA
          headerLeft: () => (
            <Image
              source={require('../../assets/images/logo-trans.png')}
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
            <Text
              style={{
                fontFamily: 'Playfair', // 👈 sua fonte
                fontSize: 20,
                letterSpacing: 1,
                color: '#a06a7d',
              }}
            >
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
          options={({ navigation }) => ({
            title: 'Pedidos',
            headerShown: true,
            headerTitleAlign: 'center',

            headerStyle: {
              backgroundColor: '#fdf2f5',
            },

            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 20,
              color: '#a06a7d',
            },

            headerShadowVisible: false,

            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Admin');
                }}
                style={{
                  marginLeft: 15,
                  padding: 5,
                }}
              >
                <Ionicons name="arrow-back" size={27} color="#a06a7d" />
              </TouchableOpacity>
            ),

            tabBarIcon: () => <Text>📦</Text>,
          })}
        />
      )}

      {usuario?.tipo === 'admin' ? (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{ tabBarIcon: () => <Text>⚙️</Text>, headerShown: false }}
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
