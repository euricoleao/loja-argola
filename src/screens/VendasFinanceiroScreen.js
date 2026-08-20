import { collection, getDocs } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function VendasFinanceiroScreen() {
  const { usuario } = useContext(AuthContext);

  const [vendas, setVendas] = useState([]);
  const [filtro, setFiltro] = useState('hoje');

  const [resumo, setResumo] = useState({
    totalVendido: 0,
    recebido: 0,
    pendente: 0,
    lucro: 0,
    quantidade: 0,
  });

  useEffect(() => {
    if (usuario?.tipo === 'admin') {
      carregarVendas();
    }
  }, [usuario]);

  useEffect(() => {
    const vendasFiltradas = filtrarVendas(vendas);
    calcularResumo(vendasFiltradas);
  }, [filtro, vendas]);

  async function carregarVendas() {
    try {
      const snapshot = await getDocs(collection(db, 'pedidos'));

      const lista = [];

      snapshot.docs.forEach((docItem) => {
        const pedido = {
          id: docItem.id,
          ...docItem.data(),
        };

        // 🚫 Compra a prazo fica no financeiro de prazo
        if (pedido.formaPagamento === 'prazo') {
          return;
        }

        lista.push(pedido);
      });

      setVendas(lista);

      // calcularResumo(lista);
    } catch (error) {
      console.log('❌ Erro ao carregar vendas:', error);
    }
  }

  function obterDataVenda(venda) {
    if (!venda.data) return null;

    return venda.data?.toDate ? venda.data.toDate() : new Date(venda.data);
  }

  function filtrarVendas(lista) {
    const agora = new Date();

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (filtro === 'hoje') {
      return lista.filter((venda) => {
        const data = obterDataVenda(venda);

        if (!data) return false;

        return data >= hoje;
      });
    }

    if (filtro === '7dias') {
      const inicio = new Date(agora);
      inicio.setDate(inicio.getDate() - 6);
      inicio.setHours(0, 0, 0, 0);

      return lista.filter((venda) => {
        const data = obterDataVenda(venda);

        if (!data) return false;

        return data >= inicio;
      });
    }

    if (filtro === '30dias') {
      const inicio = new Date(agora);
      inicio.setDate(inicio.getDate() - 29);
      inicio.setHours(0, 0, 0, 0);

      return lista.filter((venda) => {
        const data = obterDataVenda(venda);

        if (!data) return false;

        return data >= inicio;
      });
    }

    if (filtro === 'mes') {
      const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);

      return lista.filter((venda) => {
        const data = obterDataVenda(venda);

        if (!data) return false;

        return data >= inicio;
      });
    }

    return lista;
  }

  function calcularResumo(lista) {
    let totalVendido = 0;
    let recebido = 0;
    let pendente = 0;
    let lucro = 0;

    lista.forEach((pedido) => {
      const total = Number(pedido.total) || 0;

      totalVendido += total;

      // 📈 Lucro
      pedido.produtos?.forEach((produto) => {
        lucro += Number(produto.lucro) || 0;
      });

      // 💰 Status do pagamento
      if (
        pedido.statusPagamento === 'pago' ||
        pedido.statusPagamento === 'aprovado'
      ) {
        recebido += total;
      } else {
        pendente += total;
      }
    });

    setResumo({
      totalVendido,
      recebido,
      pendente,
      lucro,
      quantidade: lista.length,
    });
  }

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return '';

    const dataFormatada = data?.toDate ? data.toDate() : new Date(data);

    return dataFormatada.toLocaleDateString('pt-BR');
  }

  if (usuario?.tipo !== 'admin') {
    return (
      <View style={styles.semAcesso}>
        <Text style={styles.semAcessoTexto}>
          Acesso restrito ao administrador.
        </Text>
      </View>
    );
  }
  const vendasFiltradas = filtrarVendas(vendas);

  return (
    <View style={styles.container}>
      <FlatList
        data={vendasFiltradas}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>💰 Vendas</Text>

            {/* 🔘 FILTROS */}
            <View style={styles.filtros}>
              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  filtro === 'hoje' && styles.filtroAtivo,
                ]}
                onPress={() => setFiltro('hoje')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    filtro === 'hoje' && styles.filtroTextoAtivo,
                  ]}
                >
                  Hoje
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  filtro === '7dias' && styles.filtroAtivo,
                ]}
                onPress={() => setFiltro('7dias')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    filtro === '7dias' && styles.filtroTextoAtivo,
                  ]}
                >
                  7 dias
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  filtro === '30dias' && styles.filtroAtivo,
                ]}
                onPress={() => setFiltro('30dias')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    filtro === '30dias' && styles.filtroTextoAtivo,
                  ]}
                >
                  30 dias
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filtroBotao,
                  filtro === 'mes' && styles.filtroAtivo,
                ]}
                onPress={() => setFiltro('mes')}
              >
                <Text
                  style={[
                    styles.filtroTexto,
                    filtro === 'mes' && styles.filtroTextoAtivo,
                  ]}
                >
                  Este mês
                </Text>
              </TouchableOpacity>
            </View>

            {/* 💰 RESUMO */}
            <View style={styles.grid}>
              {/* TOTAL VENDIDO */}
              <View style={styles.cardResumo}>
                <Text style={styles.icone}>💵</Text>

                <Text style={styles.label}>Total vendido</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumo.totalVendido)}
                </Text>
              </View>

              {/* RECEBIDO */}
              <View style={styles.cardResumo}>
                <Text style={styles.icone}>🟢</Text>

                <Text style={styles.label}>Recebido</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumo.recebido)}
                </Text>
              </View>

              {/* PENDENTE */}
              <View style={styles.cardResumo}>
                <Text style={styles.icone}>🟡</Text>

                <Text style={styles.label}>Pendente</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumo.pendente)}
                </Text>
              </View>

              {/* LUCRO */}
              <View style={styles.cardResumo}>
                <Text style={styles.icone}>📈</Text>

                <Text style={styles.label}>Lucro</Text>

                <Text style={styles.valor}>{formatarPreco(resumo.lucro)}</Text>
              </View>
            </View>

            <View style={styles.quantidadeContainer}>
              <Text style={styles.quantidadeTexto}>
                📦 {resumo.quantidade} vendas
              </Text>
            </View>

            <Text style={styles.tituloLista}>📋 Vendas realizadas</Text>
          </View>
        }
        renderItem={({ item }) => {
          let lucroPedido = 0;

          item.produtos?.forEach((produto) => {
            lucroPedido += Number(produto.lucro) || 0;
          });

          const pago =
            item.statusPagamento === 'pago' ||
            item.statusPagamento === 'aprovado';

          return (
            <View style={styles.vendaCard}>
              <View style={styles.topo}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cliente}>👤 {item.cliente}</Text>

                  <Text style={styles.pedido}>Pedido: {item.id}</Text>
                </View>

                <Text style={styles.data}>{formatarData(item.data)}</Text>
              </View>

              <View style={styles.linha} />

              <Text style={styles.formaPagamento}>
                💳 Forma de pagamento: {item.formaPagamento}
              </Text>

              <Text style={styles.total}>{formatarPreco(item.total)}</Text>

              <Text
                style={[
                  styles.status,
                  pago ? styles.statusPago : styles.statusPendente,
                ]}
              >
                {pago ? '🟢 Recebido' : '🟡 Pendente'}
              </Text>

              <Text style={styles.lucro}>
                📈 Lucro: {formatarPreco(lucroPedido)}
              </Text>
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
    backgroundColor: '#f5f5f5',
  },

  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#a06a7d',
    margin: 15,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },

  cardResumo: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 3,
  },

  icone: {
    fontSize: 22,
  },

  label: {
    marginTop: 6,
    color: '#777',
    fontSize: 13,
  },

  valor: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  quantidadeContainer: {
    marginHorizontal: 10,
    marginTop: 5,
    padding: 12,
    backgroundColor: '#fdf2f5',
    borderRadius: 12,
  },

  quantidadeTexto: {
    color: '#a06a7d',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  tituloLista: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#a06a7d',
    margin: 15,
    marginTop: 20,
  },

  vendaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cliente: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  pedido: {
    marginTop: 4,
    fontSize: 12,
    color: '#888',
  },

  data: {
    fontSize: 12,
    color: '#888',
  },

  linha: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },

  formaPagamento: {
    color: '#666',
    fontSize: 14,
  },

  total: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  status: {
    marginTop: 7,
    fontWeight: 'bold',
  },

  statusPago: {
    color: '#4CAF50',
  },

  statusPendente: {
    color: '#d49a00',
  },

  lucro: {
    marginTop: 8,
    color: '#555',
    fontWeight: '600',
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

  filtros: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 15,
    gap: 6,
  },

  filtroBotao: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5d1d7',
    alignItems: 'center',
  },

  filtroAtivo: {
    backgroundColor: '#c48b9f',
    borderColor: '#c48b9f',
  },

  filtroTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#777',
  },

  filtroTextoAtivo: {
    color: '#fff',
  },
});
