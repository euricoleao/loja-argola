import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

import { useEffect, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../firebase/config';

export default function VendasScreen() {
  const screenWidth = Dimensions.get('window').width;

  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [faturamento, setFaturamento] = useState(0);
  const [custos, setCustos] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [quantidadeVendas, setQuantidadeVendas] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'vendas'), orderBy('criadoEm', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVendas(lista);

      let faturamentoTotal = 0;
      let custoTotal = 0;
      let lucroTotal = 0;

      lista.forEach((item) => {
        const venda = Number(item.precoVenda) || 0;

        const compra = Number(item.precoCompra) || 0;

        const qtd = Number(item.quantidade) || 1;

        faturamentoTotal += venda * qtd;

        custoTotal += compra * qtd;

        lucroTotal += (venda - compra) * qtd;
      });

      setFaturamento(faturamentoTotal);

      setCustos(custoTotal);

      setLucro(lucroTotal);

      setQuantidadeVendas(lista.length);

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  function formatar(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  const dadosGrafico = useMemo(() => {
    const ultimasVendas = vendas.slice(0, 6).reverse();

    return {
      labels: ultimasVendas.map((item) => {
        const data = item.criadoEm?.toDate
          ? item.criadoEm.toDate()
          : new Date();

        return `${data.getDate()}/${data.getMonth() + 1}`;
      }),

      datasets: [
        {
          data: ultimasVendas.map((item) => {
            const venda = Number(item.precoVenda) || 0;
            const custo = Number(item.precoCompra) || 0;
            const qtd = Number(item.quantidade) || 1;

            return (venda - custo) * qtd;
          }),
        },
      ],
    };
  }, [vendas]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#c8a97e" />

        <Text style={styles.loadingText}>Carregando vendas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💎 Dashboard de Vendas</Text>

      <Text style={styles.subtitulo}>
        Controle diário de faturamento e lucro
      </Text>

      <TouchableOpacity
        style={styles.botaoDashboard}
        onPress={() => setMostrarDashboard(!mostrarDashboard)}
      >
        <Text style={styles.textoBotaoDashboard}>
          {mostrarDashboard ? 'Fechar Dashboard ▲' : '📊 Dashboard ▼'}
        </Text>
      </TouchableOpacity>

      {mostrarDashboard && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsContainer}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Faturamento</Text>

            <Text style={styles.cardValor}>{formatar(faturamento)}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Custos</Text>

            <Text style={[styles.cardValor, { color: '#d9534f' }]}>
              {formatar(custos)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Lucro</Text>

            <Text style={[styles.cardValor, { color: '#28a745' }]}>
              {formatar(lucro)}
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitulo}>Vendas</Text>

            <Text style={styles.cardValor}>🛍️ {quantidadeVendas}</Text>
          </View>
        </ScrollView>
      )}

      <Text style={styles.listaTitulo}>Últimas vendas</Text>

      <FlatList
        data={vendas}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const venda = Number(item.precoVenda) || 0;
          const custo = Number(item.precoCompra) || 0;
          const lucroVenda = venda - custo;

          const criadoEm = item.criadoEm?.toDate
            ? item.criadoEm.toDate()
            : new Date();

          return (
            <View style={styles.vendaCard}>
              <View style={styles.topoVenda}>
                <Text style={styles.nome}>{item.nome || 'Venda'}</Text>

                <Text style={styles.criadoEmVenda}>
                  {criadoEm.toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <View style={styles.infoLinha}>
                <Text style={styles.label}>Valor venda</Text>

                <Text style={styles.precoVenda}>{formatar(venda)}</Text>
              </View>

              <View style={styles.infoLinha}>
                <Text style={styles.label}>Custo</Text>

                <Text style={styles.precoCompra}>{formatar(custo)}</Text>
              </View>

              <View style={styles.infoLinha}>
                <Text style={styles.label}>Lucro</Text>

                <Text
                  style={[
                    styles.valorLucro,
                    {
                      color: lucroVenda >= 0 ? '#28a745' : '#d9534f',
                    },
                  ]}
                >
                  {formatar(lucroVenda)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3d312b',
  },

  subtitulo: {
    marginTop: 5,
    color: '#8a7b70',
    marginBottom: 15,
  },

  chart: {
    marginVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 4,
  },

  cardsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 5,
  },

  card: {
    width: 180,
    minHeight: 120,

    backgroundColor: '#ffffff',

    borderRadius: 18,

    padding: 18,

    marginBottom: 150,

    marginRight: 12,

    marginVertical: 10,

    elevation: 4,

    shadowColor: '#000',

    shadowOpacity: 0.08,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowRadius: 5,
  },

  cardTitulo: {
    color: '#8a7b70',
    fontSize: 13,
  },

  cardValor: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d312b',
  },

  listaTitulo: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3d312b',
  },

  vendaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  topoVenda: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d312b',
  },

  criadoEmVenda: {
    color: '#8a7b70',
    fontSize: 12,
  },

  infoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    color: '#777',
  },

  precoVenda: {
    fontWeight: 'bold',
    color: '#3d312b',
  },

  precoCompra: {
    fontWeight: 'bold',
    color: '#d9534f',
  },

  valorLucro: {
    fontWeight: 'bold',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5f2',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },
  botaoDashboard: {
    backgroundColor: '#c8a97e',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },

  textoBotaoDashboard: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
