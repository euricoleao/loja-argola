import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';

import { useContext, useEffect, useState } from 'react';

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function FinanceiroScreen() {
  const { usuario } = useContext(AuthContext);

  const [parcelas, setParcelas] = useState([]);

  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receber: 0,
    recebido: 0,
    vencido: 0,
    pendente: 0,
  });

  useEffect(() => {
    if (usuario?.tipo === 'admin') {
      carregarFinanceiro();
    }
  }, [usuario]);

  async function carregarFinanceiro() {
    try {
      const snapshot = await getDocs(collection(db, 'pedidos'));

      const todasParcelas = [];

      snapshot.docs.forEach((docItem) => {
        const pedido = {
          id: docItem.id,
          ...docItem.data(),
        };

        // Só interessa compra a prazo
        if (
          pedido.formaPagamento !== 'prazo' ||
          !Array.isArray(pedido.parcelas)
        ) {
          return;
        }

        pedido.parcelas.forEach((parcela) => {
          todasParcelas.push({
            ...parcela,

            pedidoId: pedido.id,

            cliente: pedido.cliente,

            email: pedido.email,

            totalPedido: pedido.total,

            cidade: pedido.cidade,

            dataPedido: pedido.data,
          });
        });
      });

      setParcelas(todasParcelas);

      calcularResumo(todasParcelas);
    } catch (error) {
      console.log('❌ Erro ao carregar financeiro:', error);
    }
  }

  function calcularResumo(lista) {
    let receber = 0;
    let recebido = 0;
    let vencido = 0;
    let pendente = 0;

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    lista.forEach((parcela) => {
      const valor = Number(parcela.valor) || 0;

      // PARCELA PAGA
      if (parcela.status === 'pago') {
        recebido += valor;
        return;
      }

      // AINDA NÃO PAGA
      receber += valor;

      if (!parcela.vencimento) {
        pendente += valor;
        return;
      }

      const vencimento = parcela.vencimento?.toDate
        ? parcela.vencimento.toDate()
        : new Date(parcela.vencimento);

      vencimento.setHours(0, 0, 0, 0);

      if (vencimento < hoje) {
        vencido += valor;
      } else {
        pendente += valor;
      }
    });

    setResumoFinanceiro({
      receber,
      recebido,
      vencido,
      pendente,
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

  function obterStatus(parcela) {
    if (parcela.status === 'pago') {
      return {
        texto: 'Paga',
        icone: '🟢',
        estilo: styles.statusPago,
      };
    }

    if (!parcela.vencimento) {
      return {
        texto: 'Pendente',
        icone: '🟡',
        estilo: styles.statusPendente,
      };
    }

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    const vencimento = parcela.vencimento?.toDate
      ? parcela.vencimento.toDate()
      : new Date(parcela.vencimento);

    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hoje) {
      return {
        texto: 'Vencida',
        icone: '🔴',
        estilo: styles.statusVencida,
      };
    }

    if (vencimento.getTime() === hoje.getTime()) {
      return {
        texto: 'Vence hoje',
        icone: '🟠',
        estilo: styles.statusHoje,
      };
    }

    return {
      texto: 'Pendente',
      icone: '🟡',
      estilo: styles.statusPendente,
    };
  }

  async function marcarComoPaga(parcela) {
    try {
      Alert.alert(
        'Confirmar pagamento',
        `Marcar a ${parcela.numero}ª parcela de ${formatarPreco(
          parcela.valor,
        )} como paga?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Confirmar',
            onPress: async () => {
              await atualizarParcela(parcela);
            },
          },
        ],
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function atualizarParcela(parcela) {
    try {
      const pedidoRef = doc(db, 'pedidos', parcela.pedidoId);

      const pedidoSnap = await getDoc(pedidoRef);

      if (!pedidoSnap.exists()) {
        Alert.alert('Erro', 'Pedido não encontrado.');
        return;
      }

      const pedido = pedidoSnap.data();

      const parcelasAtualizadas = pedido.parcelas.map((item) => {
        if (item.numero === parcela.numero) {
          return {
            ...item,
            status: 'pago',
            pagoEm: new Date(),
          };
        }

        return item;
      });

      await updateDoc(pedidoRef, {
        parcelas: parcelasAtualizadas,
      });

      Alert.alert('Pagamento registrado', 'A parcela foi marcada como paga.');

      carregarFinanceiro();
    } catch (error) {
      console.log('❌ Erro ao atualizar parcela:', error);

      Alert.alert('Erro', 'Não foi possível registrar o pagamento.');
    }
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

  return (
    <View style={styles.container}>
      <FlatList
        data={parcelas}
        keyExtractor={(item) => `${item.pedidoId}-${item.numero}`}
        ListHeaderComponent={
          <View>
            <Text style={styles.titulo}>💰 Financeiro</Text>

            <View style={styles.grid}>
              <View style={styles.cardResumo}>
                <Text style={styles.icone}>💰</Text>

                <Text style={styles.label}>A receber</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumoFinanceiro.receber)}
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Text style={styles.icone}>🟢</Text>

                <Text style={styles.label}>Recebido</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumoFinanceiro.recebido)}
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Text style={styles.icone}>🔴</Text>

                <Text style={styles.label}>Vencido</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumoFinanceiro.vencido)}
                </Text>
              </View>

              <View style={styles.cardResumo}>
                <Text style={styles.icone}>🟡</Text>

                <Text style={styles.label}>Pendente</Text>

                <Text style={styles.valor}>
                  {formatarPreco(resumoFinanceiro.pendente)}
                </Text>
              </View>
            </View>

            <Text style={styles.tituloParcelas}>📋 Parcelas</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = obterStatus(item);

          return (
            <View style={styles.parcelaCard}>
              <View style={styles.topoParcela}>
                <View>
                  <Text style={styles.cliente}>👤 {item.cliente}</Text>

                  <Text style={styles.pedido}>Pedido: {item.pedidoId}</Text>
                </View>

                <Text style={styles.numero}>{item.numero}ª</Text>
              </View>

              <Text style={styles.valorParcela}>
                {formatarPreco(item.valor)}
              </Text>

              <Text style={styles.vencimento}>
                📅 Vencimento: {formatarData(item.vencimento)}
              </Text>

              <Text style={styles.dias}>⏱️ {item.dias} dias</Text>

              <Text style={[styles.status, status.estilo]}>
                {status.icone} {status.texto}
              </Text>

              {item.status !== 'pago' && (
                <TouchableOpacity
                  style={styles.botaoPagar}
                  onPress={() => marcarComoPaga(item)}
                >
                  <Text style={styles.textoBotao}>💰 Marcar como paga</Text>
                </TouchableOpacity>
              )}
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

  tituloParcelas: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#a06a7d',
    margin: 15,
    marginTop: 20,
  },

  parcelaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  topoParcela: {
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

  numero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  valorParcela: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c48b9f',
  },

  vencimento: {
    marginTop: 6,
    color: '#666',
  },

  dias: {
    marginTop: 3,
    color: '#888',
    fontSize: 12,
  },

  status: {
    marginTop: 8,
    fontWeight: 'bold',
  },

  statusPago: {
    color: '#4CAF50',
  },

  statusPendente: {
    color: '#d49a00',
  },

  statusVencida: {
    color: '#e53935',
  },

  statusHoje: {
    color: '#ef6c00',
  },

  botaoPagar: {
    marginTop: 12,
    backgroundColor: '#4CAF50',
    padding: 11,
    borderRadius: 10,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
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
});
