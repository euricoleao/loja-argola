import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import * as Notifications from 'expo-notifications';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function AdminScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);

  const [carregando, setCarregando] = useState(true);
  const [pedidosAguardando, setPedidosAguardando] = useState([]);

  const [resumo, setResumo] = useState({
    vendasHoje: 0,
    pedidosHoje: 0,
    clientes: 0,
    estoqueBaixo: 0,
  });

  const isAdmin = usuario?.tipo === 'admin';

  useEffect(() => {
    if (isAdmin) {
      carregarResumo();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    let primeiraLeitura = true;

    const q = query(
      collection(db, 'pedidos'),
      where('formaPagamento', '==', 'prazo'),
      where('statusPagamento', '==', 'aguardando_aprovacao'),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const lista = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setPedidosAguardando(lista);

      // Evita tocar som assim que o administrador abre a tela
      if (primeiraLeitura) {
        primeiraLeitura = false;
        return;
      }

      if (snapshot.docChanges().some((change) => change.type === 'added')) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔔 Nova compra a prazo!',
              body: 'Existe uma nova compra aguardando aprovação.',
              sound: 'default',
              data: {
                tela: 'Pedidos',
              },
            },
            trigger: null,
          });
        } catch (error) {
          console.log('Erro ao emitir notificação:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [isAdmin]);

  async function carregarResumo() {
    try {
      setCarregando(true);

      // ==============================
      // PEDIDOS
      // ==============================

      const pedidosSnapshot = await getDocs(collection(db, 'pedidos'));

      let vendasHoje = 0;
      let pedidosHoje = 0;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      pedidosSnapshot.docs.forEach((docItem) => {
        const pedido = docItem.data();

        // Ignora compras a prazo
        if (pedido.formaPagamento === 'prazo') {
          return;
        }

        if (!pedido.data) {
          return;
        }

        const dataPedido = pedido.data?.toDate
          ? pedido.data.toDate()
          : new Date(pedido.data);

        dataPedido.setHours(0, 0, 0, 0);

        if (dataPedido.getTime() === hoje.getTime()) {
          vendasHoje += Number(pedido.total) || 0;
          pedidosHoje++;
        }
      });

      // ==============================
      // CLIENTES
      // ==============================

      const clientesSnapshot = await getDocs(collection(db, 'usuarios'));

      let clientes = 0;

      clientesSnapshot.docs.forEach((docItem) => {
        const cliente = docItem.data();

        if (cliente.tipo !== 'admin') {
          clientes++;
        }
      });

      // ==============================
      // ESTOQUE
      // ==============================

      const produtosSnapshot = await getDocs(collection(db, 'products'));

      let estoqueBaixo = 0;

      produtosSnapshot.docs.forEach((docItem) => {
        const produto = docItem.data();

        const quantidade = Number(produto.quantidade ?? produto.estoque ?? 0);

        if (quantidade <= 5) {
          estoqueBaixo++;
        }
      });

      setResumo({
        vendasHoje,
        pedidosHoje,
        clientes,
        estoqueBaixo,
      });
    } catch (error) {
      console.log('❌ Erro ao carregar resumo do painel:', error);
    } finally {
      setCarregando(false);
    }
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  if (!isAdmin) {
    return (
      <View style={styles.semAcesso}>
        <Text style={styles.semAcessoTexto}>
          Acesso restrito ao administrador.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* ==============================
          CABEÇALHO
      ============================== */}

      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Painel Administrativo</Text>

        <Text style={styles.subtitulo}>Controle da sua loja 💎</Text>
      </View>

      {/* ==============================
          RESUMO
      ============================== */}

      <Text style={styles.tituloSecao}>📊 Resumo de hoje</Text>

      {pedidosAguardando.length > 0 && (
        <TouchableOpacity
          style={styles.alertaPrazo}
          onPress={() => navigation.navigate('Pedidos')}
        >
          <View style={styles.alertaIcone}>
            <Text style={styles.alertaIconeTexto}>🔔</Text>
          </View>

          <View style={styles.alertaConteudo}>
            <Text style={styles.alertaTitulo}>Nova compra a prazo!</Text>

            <Text style={styles.alertaTexto}>
              {pedidosAguardando.length === 1
                ? 'Existe 1 pedido aguardando aprovação.'
                : `Existem ${pedidosAguardando.length} pedidos aguardando aprovação.`}
            </Text>

            <Text style={styles.alertaToque}>Toque aqui para verificar →</Text>
          </View>

          <View style={styles.badgePedidos}>
            <Text style={styles.badgePedidosTexto}>
              {pedidosAguardando.length > 99 ? '99+' : pedidosAguardando.length}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {carregando ? (
        <View style={styles.carregando}>
          <ActivityIndicator size="large" color="#a06a7d" />
          <Text style={styles.textoCarregando}>Carregando informações...</Text>
        </View>
      ) : (
        <View style={styles.gridResumo}>
          {/* VENDAS */}

          <View style={styles.cardResumo}>
            <Text style={styles.iconeResumo}>💰</Text>

            <Text style={styles.labelResumo}>Vendas hoje</Text>

            <Text style={styles.valorResumo}>
              {formatarPreco(resumo.vendasHoje)}
            </Text>
          </View>

          {/* PEDIDOS */}

          <View style={styles.cardResumo}>
            <Text style={styles.iconeResumo}>📦</Text>

            <Text style={styles.labelResumo}>Pedidos hoje</Text>

            <Text style={styles.valorResumo}>{resumo.pedidosHoje}</Text>
          </View>

          {/* CLIENTES */}

          <View style={styles.cardResumo}>
            <Text style={styles.iconeResumo}>👥</Text>

            <Text style={styles.labelResumo}>Clientes</Text>

            <Text style={styles.valorResumo}>{resumo.clientes}</Text>
          </View>

          {/* ESTOQUE */}

          <View
            style={[
              styles.cardResumo,
              resumo.estoqueBaixo > 0 && styles.cardEstoqueAlerta,
            ]}
          >
            <Text style={styles.iconeResumo}>⚠️</Text>

            <Text style={styles.labelResumo}>Estoque baixo</Text>

            <Text
              style={[
                styles.valorResumo,
                resumo.estoqueBaixo > 0 && styles.valorAlerta,
              ]}
            >
              {resumo.estoqueBaixo}
            </Text>
          </View>
        </View>
      )}

      {/* ==============================
          VENDAS E FINANCEIRO
      ============================== */}

      <Text style={styles.tituloSecao}>💰 Vendas e Financeiro</Text>

      <View style={styles.gridBotoes}>
        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.iconeBotao}>📊</Text>

          <Text style={styles.tituloBotao}>Dashboard</Text>

          <Text style={styles.descricaoBotao}>Visão geral</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('VendasFinanceiro')}
        >
          <Text style={styles.iconeBotao}>💵</Text>

          <Text style={styles.tituloBotao}>Vendas</Text>

          <Text style={styles.descricaoBotao}>Vendas realizadas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('Financeiro')}
        >
          <Text style={styles.iconeBotao}>💰</Text>

          <Text style={styles.tituloBotao}>Financeiro</Text>

          <Text style={styles.descricaoBotao}>Compras a prazo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('Pedidos')}
        >
          <Text style={styles.iconeBotao}>🛒</Text>

          <Text style={styles.tituloBotao}>Pedidos</Text>

          <Text style={styles.descricaoBotao}>Ver pedidos</Text>
        </TouchableOpacity>
      </View>

      {/* ==============================
          PRODUTOS
      ============================== */}

      <Text style={styles.tituloSecao}>📦 Produtos</Text>

      <View style={styles.gridBotoes}>
        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('CadastrarProduto')}
        >
          <Text style={styles.iconeBotao}>➕</Text>

          <Text style={styles.tituloBotao}>Cadastrar</Text>

          <Text style={styles.descricaoBotao}>Novo produto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('ListaProdutos')}
        >
          <Text style={styles.iconeBotao}>📦</Text>

          <Text style={styles.tituloBotao}>Produtos</Text>

          <Text style={styles.descricaoBotao}>Lista de produtos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('Estoque')}
        >
          <Text style={styles.iconeBotao}>🏷️</Text>

          <Text style={styles.tituloBotao}>Estoque</Text>

          <Text style={styles.descricaoBotao}>Controle de estoque</Text>
        </TouchableOpacity>
      </View>

      {/* ==============================
          CLIENTES
      ============================== */}

      <Text style={styles.tituloSecao}>👥 Clientes</Text>

      <View style={styles.gridBotoes}>
        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('Clientes')}
        >
          <Text style={styles.iconeBotao}>👥</Text>

          <Text style={styles.tituloBotao}>Clientes</Text>

          <Text style={styles.descricaoBotao}>Lista de clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('GerenciarClientes')}
        >
          <Text style={styles.iconeBotao}>⚙️</Text>

          <Text style={styles.tituloBotao}>Gerenciar</Text>

          <Text style={styles.descricaoBotao}>Administrar clientes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardBotao}
          onPress={() => navigation.navigate('CreditoPrazo')}
        >
          <Text style={styles.iconeBotao}>💳</Text>

          <Text style={styles.tituloBotao}>Crédito / Prazo</Text>

          <Text style={styles.descricaoBotao}>Limites de crédito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f4f5',
  },

  conteudo: {
    padding: 15,
    paddingBottom: 40,
  },

  cabecalho: {
    marginBottom: 10,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 14,
    color: '#888',
  },

  tituloSecao: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#a06a7d',
    marginTop: 20,
    marginBottom: 10,
  },

  gridResumo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardResumo: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  cardEstoqueAlerta: {
    borderWidth: 1,
    borderColor: '#f0b44d',
  },

  iconeResumo: {
    fontSize: 25,
  },

  labelResumo: {
    marginTop: 6,
    fontSize: 13,
    color: '#777',
  },

  valorResumo: {
    marginTop: 4,
    fontSize: 19,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  valorAlerta: {
    color: '#d88900',
  },

  gridBotoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  cardBotao: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  iconeBotao: {
    fontSize: 28,
    marginBottom: 8,
  },

  tituloBotao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },

  descricaoBotao: {
    marginTop: 4,
    fontSize: 12,
    color: '#999',
  },

  carregando: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },

  textoCarregando: {
    marginTop: 8,
    color: '#888',
  },

  semAcesso: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  semAcessoTexto: {
    fontSize: 16,
    color: '#777',
  },
  alertaPrazo: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C48B9F',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  alertaIcone: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fdf2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  alertaIconeTexto: {
    fontSize: 26,
  },

  alertaConteudo: {
    flex: 1,
  },

  alertaTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  alertaTexto: {
    marginTop: 4,
    fontSize: 13,
    color: '#555',
  },

  alertaToque: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#C48B9F',
  },

  badgePedidos: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C48B9F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  badgePedidosTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
