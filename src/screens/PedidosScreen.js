import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
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

export default function PedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState({
    receber: 0,
    recebido: 0,
    vencido: 0,
    pendente: 0,
  });

  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    async function buscarPedidos() {
      if (!usuario?.uid) return;

      try {
        let snapshot;

        // ADMIN → busca todos os pedidos
        if (usuario.tipo === 'admin') {
          snapshot = await getDocs(collection(db, 'pedidos'));
        }

        // CLIENTE → busca somente os próprios pedidos
        else {
          const q = query(
            collection(db, 'pedidos'),
            where('uid', '==', usuario.uid),
          );

          snapshot = await getDocs(q);
        }

        const lista = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }));

        setPedidos(lista);

        if (usuario.tipo === 'admin') {
          calcularResumoFinanceiro(lista);
        }
      } catch (error) {
        console.log('❌ Erro ao buscar pedidos:', error);
      }
    }

    buscarPedidos();
  }, [usuario]);

  function formatarPreco(valor) {
    return Number(valor).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return '';

    const dataCompra = data?.toDate ? data.toDate() : new Date(data);

    return dataCompra.toLocaleDateString('pt-BR');
  }

  function formatarVencimento(vencimento) {
    if (!vencimento) return '';

    const data = vencimento?.toDate
      ? vencimento.toDate()
      : new Date(vencimento);

    return data.toLocaleDateString('pt-BR');
  }

  function calcularResumoFinanceiro(listaPedidos) {
    let receber = 0;
    let recebido = 0;
    let vencido = 0;
    let pendente = 0;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    listaPedidos.forEach((pedido) => {
      if (
        pedido.formaPagamento !== 'prazo' ||
        !Array.isArray(pedido.parcelas)
      ) {
        return;
      }

      pedido.parcelas.forEach((parcela) => {
        const valor = Number(parcela.valor) || 0;

        if (parcela.status === 'pago') {
          recebido += valor;
          return;
        }

        // Tudo que ainda não foi pago
        receber += valor;

        if (parcela.vencimento) {
          const vencimento = parcela.vencimento?.toDate
            ? parcela.vencimento.toDate()
            : new Date(parcela.vencimento);

          vencimento.setHours(0, 0, 0, 0);

          if (vencimento < hoje) {
            vencido += valor;
          } else {
            pendente += valor;
          }
        } else {
          pendente += valor;
        }
      });
    });

    setResumoFinanceiro({
      receber,
      recebido,
      vencido,
      pendente,
    });
  }

  function obterStatusParcela(parcela) {
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

    const vencimento = parcela.vencimento?.toDate
      ? parcela.vencimento.toDate()
      : new Date(parcela.vencimento);

    const hoje = new Date();

    // Remove horas para comparar somente a data
    hoje.setHours(0, 0, 0, 0);
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

  async function marcarParcelaComoPaga(pedido, numeroParcela) {
    try {
      const parcelasAtualizadas = pedido.parcelas.map((parcela) => {
        if (parcela.numero === numeroParcela) {
          return {
            ...parcela,
            status: 'pago',
            pagoEm: new Date(),
          };
        }

        return parcela;
      });

      await updateDoc(doc(db, 'pedidos', pedido.id), {
        parcelas: parcelasAtualizadas,
      });

      const novaLista = pedidos.map((item) =>
        item.id === pedido.id
          ? {
              ...item,
              parcelas: parcelasAtualizadas,
            }
          : item,
      );

      setPedidos(novaLista);

      calcularResumoFinanceiro(novaLista);

      Alert.alert(
        'Parcela paga',
        `A parcela ${numeroParcela} foi marcada como paga.`,
      );
    } catch (error) {
      console.log('❌ Erro ao marcar parcela:', error);

      Alert.alert('Erro', 'Não foi possível marcar a parcela como paga.');
    }
  }

  // async function aprovarPedido(pedidoId, uidCliente) {
  //   try {
  //     console.log('🔔 APROVANDO PEDIDO:', pedidoId);
  //     console.log('👤 UID CLIENTE:', uidCliente);

  //     // Aprova o pedido
  //     await updateDoc(doc(db, 'pedidos', pedidoId), {
  //       statusPagamento: 'aprovado',
  //       aprovadoEm: new Date(),
  //     });

  //     console.log('✅ PEDIDO ATUALIZADO');

  //     // Cria notificação
  //     const notificacaoRef = await addDoc(collection(db, 'notificacoes'), {
  //       uid: uidCliente,
  //       titulo: 'Compra a prazo aprovada 🎉',
  //       mensagem: 'Seu pedido foi aprovado pela loja e está sendo preparado.',
  //       tipo: 'pedido_aprovado',
  //       pedidoId: pedidoId,
  //       lida: false,
  //       data: new Date(),
  //     });

  //     console.log('🔔 NOTIFICAÇÃO CRIADA:', notificacaoRef.id);

  //     // Atualiza lista do admin
  //     setPedidos((listaAtual) =>
  //       listaAtual.map((pedido) =>
  //         pedido.id === pedidoId
  //           ? {
  //               ...pedido,
  //               statusPagamento: 'aprovado',
  //             }
  //           : pedido,
  //       ),
  //     );

  //     Alert.alert(
  //       'Pedido aprovado',
  //       'A compra a prazo foi aprovada e o cliente foi notificado.',
  //     );
  //   } catch (error) {
  //     console.log('❌ ERRO COMPLETO:', error);
  //   }
  // }
  async function baixarEstoquePedido(pedidoId) {
    try {
      const pedidoRef = doc(db, 'pedidos', pedidoId);
      const pedidoSnap = await getDoc(pedidoRef);

      if (!pedidoSnap.exists()) {
        throw new Error('Pedido não encontrado.');
      }

      const pedido = pedidoSnap.data();

      // Evita baixar duas vezes
      if (pedido.estoqueBaixado) {
        console.log('📦 Estoque já baixado para este pedido.');
        return;
      }

      for (const produtoPedido of pedido.produtos) {
        const produtoRef = doc(db, 'products', produtoPedido.id);

        const produtoSnap = await getDoc(produtoRef);

        if (!produtoSnap.exists()) continue;

        const produto = produtoSnap.data();

        const estoqueAtual = Number(produto.quantidade || 0);
        const quantidadeVendida = Number(produtoPedido.quantidade || 0);

        const novoEstoque = Math.max(estoqueAtual - quantidadeVendida, 0);

        await updateDoc(produtoRef, {
          quantidade: novoEstoque,
        });

        console.log(`📦 ${produto.nome}: ${estoqueAtual} → ${novoEstoque}`);
      }

      // Marca que já baixou
      await updateDoc(pedidoRef, {
        estoqueBaixado: true,
        estoqueBaixadoEm: new Date(),
      });

      console.log('✅ Estoque baixado com sucesso.');
    } catch (error) {
      console.log('❌ Erro ao baixar estoque:', error);
      throw error;
    }
  }
  async function aprovarPedido(pedidoId) {
    try {
      // 1️⃣ Busca o pedido
      const pedidoRef = doc(db, 'pedidos', pedidoId);
      const pedidoSnap = await getDoc(pedidoRef);

      if (!pedidoSnap.exists()) {
        Alert.alert('Erro', 'Pedido não encontrado.');
        return;
      }

      const pedido = pedidoSnap.data();

      // 2️⃣ Verifica o UID do cliente
      if (!pedido.uid) {
        Alert.alert('Erro', 'Este pedido não possui o UID do cliente.');
        return;
      }

      // 3️⃣ Aprova o pedido
      await updateDoc(pedidoRef, {
        statusPagamento: 'aprovado',
        aprovadoEm: new Date(),
      });

      // 📦 Agora sim baixa o estoque
      await baixarEstoquePedido(pedidoId);

      // 4️⃣ Cria a notificação para o cliente
      const notificacoesRef = collection(
        db,
        'usuarios',
        pedido.uid,
        'notificacoes',
      );

      await addDoc(notificacoesRef, {
        titulo: 'Compra a prazo aprovada 🎉',
        mensagem:
          'Sua compra a prazo foi aprovada pela loja. Obrigado pela preferência!',
        tipo: 'pedido_aprovado',
        pedidoId: pedidoId,
        lida: false,
        criadoEm: new Date(),
      });

      // 5️⃣ Atualiza a lista na tela do administrador
      setPedidos((listaAtual) =>
        listaAtual.map((item) =>
          item.id === pedidoId
            ? {
                ...item,
                statusPagamento: 'aprovado',
                estoqueBaixado: true,
              }
            : item,
        ),
      );

      Alert.alert(
        'Pedido aprovado',
        'A compra a prazo foi aprovada e o cliente foi notificado. ✅',
      );
    } catch (error) {
      console.log('❌ Erro ao aprovar pedido:', error);

      Alert.alert('Erro', 'Não foi possível aprovar o pedido.');
    }
  }

  async function recusarPedido(pedidoId) {
    try {
      // 1️⃣ Busca o pedido
      const pedidoRef = doc(db, 'pedidos', pedidoId);
      const pedidoSnap = await getDoc(pedidoRef);

      if (!pedidoSnap.exists()) {
        Alert.alert('Erro', 'Pedido não encontrado.');
        return;
      }

      const pedido = pedidoSnap.data();

      // 2️⃣ Verifica se existe o cliente
      if (!pedido.uid) {
        Alert.alert('Erro', 'Este pedido não possui o UID do cliente.');
        return;
      }

      // 3️⃣ Atualiza o pedido
      await updateDoc(pedidoRef, {
        statusPagamento: 'recusado',
        recusadoEm: new Date(),
      });

      // 4️⃣ Cria notificação para o cliente
      const notificacoesRef = collection(
        db,
        'usuarios',
        pedido.uid,
        'notificacoes',
      );

      await addDoc(notificacoesRef, {
        titulo: 'Compra a prazo recusada',
        mensagem:
          'Sua compra a prazo não foi aprovada pela loja. Entre em contato conosco para mais informações.',
        tipo: 'pedido_recusado',
        pedidoId: pedidoId,
        lida: false,
        criadoEm: new Date(),
      });

      // 5️⃣ Atualiza a lista do administrador
      setPedidos((listaAtual) =>
        listaAtual.map((item) =>
          item.id === pedidoId
            ? {
                ...item,
                statusPagamento: 'recusado',
              }
            : item,
        ),
      );

      Alert.alert(
        'Pedido recusado',
        'A compra foi recusada e o cliente foi notificado.',
      );
    } catch (error) {
      console.log('❌ Erro ao recusar pedido:', error);

      Alert.alert('Erro', 'Não foi possível recusar o pedido.');
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={pedidos}
        ListHeaderComponent={
          usuario?.tipo === 'admin' ? (
            <View style={styles.financeiroContainer}>
              <Text style={styles.financeiroTitulo}>📊 Resumo Financeiro</Text>

              <View style={styles.financeiroGrid}>
                <View style={styles.financeiroCard}>
                  <Text style={styles.financeiroIcone}>💰</Text>
                  <Text style={styles.financeiroLabel}>A receber</Text>
                  <Text style={styles.financeiroValor}>
                    {formatarPreco(resumoFinanceiro.receber)}
                  </Text>
                </View>

                <View style={styles.financeiroCard}>
                  <Text style={styles.financeiroIcone}>🟢</Text>
                  <Text style={styles.financeiroLabel}>Recebido</Text>
                  <Text style={styles.financeiroValor}>
                    {formatarPreco(resumoFinanceiro.recebido)}
                  </Text>
                </View>

                <View style={styles.financeiroCard}>
                  <Text style={styles.financeiroIcone}>🔴</Text>
                  <Text style={styles.financeiroLabel}>Vencido</Text>
                  <Text style={styles.financeiroValor}>
                    {formatarPreco(resumoFinanceiro.vencido)}
                  </Text>
                </View>

                <View style={styles.financeiroCard}>
                  <Text style={styles.financeiroIcone}>🟡</Text>
                  <Text style={styles.financeiroLabel}>Pendente</Text>
                  <Text style={styles.financeiroValor}>
                    {formatarPreco(resumoFinanceiro.pendente)}
                  </Text>
                </View>
              </View>
            </View>
          ) : null
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('PedidoDetalhe', {
                pedido: item,
              })
            }
          >
            {item.produtos?.map((produto, index) => (
              <View key={index}>
                <Text style={styles.itemNome}>{produto.nome}</Text>

                <Text style={styles.itemQuantidade}>
                  Quantidade: {produto.quantidade}
                </Text>
              </View>
            ))}

            <Text style={styles.total}>Total: {formatarPreco(item.total)}</Text>

            <Text style={styles.statusPedido}>
              Status:{' '}
              {item.statusPagamento === 'aprovado'
                ? '✅ Aprovado'
                : item.statusPagamento === 'aguardando_aprovacao'
                  ? '⏳ Aguardando aprovação'
                  : item.statusPagamento === 'recusado'
                    ? '❌ Recusado'
                    : item.statusPagamento === 'pago'
                      ? '🟢 Pago'
                      : '⏳ Aguardando'}
            </Text>

            <Text style={styles.data}>📅 {formatarData(item.data)}</Text>

            {item.formaPagamento === 'prazo' && item.parcelas?.length > 0 && (
              <View style={styles.parcelasContainer}>
                <Text style={styles.tituloParcelas}>💰 Parcelamento</Text>

                <Text style={styles.resumoParcelas}>
                  {item.parcelas.length}x • Prazo máximo: {item.prazoPagamento}{' '}
                  dias
                </Text>

                {item.parcelas.map((parcela) => {
                  const status = obterStatusParcela(parcela);

                  return (
                    <View key={parcela.numero} style={styles.parcelaCard}>
                      <View style={styles.parcelaInfo}>
                        <Text style={styles.parcelaNumero}>
                          {parcela.numero}ª parcela
                        </Text>

                        <Text style={styles.parcelaValor}>
                          {formatarPreco(parcela.valor)}
                        </Text>

                        <Text style={styles.parcelaVencimento}>
                          📅 Vencimento: {formatarData(parcela.vencimento)}
                        </Text>

                        <Text style={styles.parcelaDias}>
                          ⏱️ {parcela.dias} dias
                        </Text>

                        <Text style={[styles.statusParcela, status.estilo]}>
                          {status.icone} {status.texto}
                        </Text>
                      </View>

                      {usuario?.tipo === 'admin' &&
                        parcela.status !== 'pago' && (
                          <TouchableOpacity
                            style={styles.botaoPagar}
                            onPress={() =>
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
                                    onPress: () =>
                                      marcarParcelaComoPaga(
                                        item,
                                        parcela.numero,
                                      ),
                                  },
                                ],
                              )
                            }
                          >
                            <Text style={styles.textoBotaoPagar}>
                              💰 Marcar como paga
                            </Text>
                          </TouchableOpacity>
                        )}
                    </View>
                  );
                })}
              </View>
            )}

            {usuario?.tipo === 'admin' &&
              item.formaPagamento === 'prazo' &&
              item.statusPagamento === 'aguardando_aprovacao' && (
                <View style={styles.aprovacaoContainer}>
                  <Text style={styles.prazoInfo}>
                    📅 Compra a prazo: {item.prazoPagamento} dias
                  </Text>

                  <Text style={styles.statusAguardando}>
                    ⏳ Aguardando aprovação
                  </Text>

                  <View style={styles.botoesAprovacao}>
                    <TouchableOpacity
                      style={styles.botaoAprovar}
                      onPress={() => aprovarPedido(item.id)}
                    >
                      <Text style={styles.textoBotao}>✅ Aprovar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.botaoRecusar}
                      onPress={() => recusarPedido(item.id)}
                    >
                      <Text style={styles.textoBotao}>❌ Recusar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },

  nome: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  itemNome: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  itemQuantidade: {
    color: '#666',
    marginBottom: 8,
  },

  total: {
    marginTop: 8,
    color: '#e60023',
    fontWeight: 'bold',
    fontSize: 16,
  },

  data: {
    marginTop: 8,
    fontSize: 13,
    color: '#777',
  },
  aprovacaoContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  prazoInfo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  statusAguardando: {
    marginTop: 5,
    color: '#c48b9f',
    fontWeight: '600',
  },

  botoesAprovacao: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },

  botaoAprovar: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  botaoRecusar: {
    flex: 1,
    backgroundColor: '#a06a7d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  parcelasContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#fdf2f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1d5dd',
  },

  tituloParcelas: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  resumoParcelas: {
    marginTop: 4,
    marginBottom: 10,
    color: '#777',
    fontSize: 13,
  },

  parcelaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },

  parcelaInfo: {
    flex: 1,
  },

  parcelaNumero: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  parcelaValor: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#c48b9f',
  },

  parcelaVencimento: {
    marginTop: 5,
    fontSize: 13,
    color: '#666',
  },

  parcelaDias: {
    marginTop: 3,
    fontSize: 12,
    color: '#888',
  },

  statusParcela: {
    marginTop: 6,
    fontWeight: 'bold',
    fontSize: 13,
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
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },

  textoBotaoPagar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  financeiroContainer: {
    margin: 10,
    padding: 15,
    backgroundColor: '#fdf2f5',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#f1d5dd',
  },

  financeiroTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#a06a7d',
    marginBottom: 12,
  },

  financeiroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  financeiroCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },

  financeiroIcone: {
    fontSize: 20,
  },

  financeiroLabel: {
    marginTop: 5,
    color: '#777',
    fontSize: 13,
  },

  financeiroValor: {
    marginTop: 3,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#a06a7d',
  },
  statusPedido: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a06a7d',
  },
});
