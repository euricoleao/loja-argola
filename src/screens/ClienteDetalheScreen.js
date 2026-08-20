import { collection, getDocs, query, where } from 'firebase/firestore';

import { useContext, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function ClienteDetalheScreen({ route }) {
  const { usuario } = useContext(AuthContext);

  const { cliente } = route.params;

  const [pedidos, setPedidos] = useState([]);

  const [carregando, setCarregando] = useState(true);

  const [resumo, setResumo] = useState({
    totalPedidos: 0,
    totalComprado: 0,
    totalPrazo: 0,
    recebido: 0,
    receber: 0,
    vencido: 0,
  });

  useEffect(() => {
    carregarCliente();
  }, []);

  async function carregarCliente() {
    try {
      setCarregando(true);

      const q = query(
        collection(db, 'pedidos'),
        where('uid', '==', cliente.uid),
      );

      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      setPedidos(lista);

      calcularResumo(lista);
    } catch (error) {
      console.log('❌ Erro ao carregar detalhes do cliente:', error);
    } finally {
      setCarregando(false);
    }
  }

  function calcularResumo(lista) {
    let totalComprado = 0;

    let totalPrazo = 0;

    let recebido = 0;

    let receber = 0;

    let vencido = 0;

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    lista.forEach((pedido) => {
      totalComprado += Number(pedido.total) || 0;

      if (pedido.formaPagamento !== 'prazo') {
        return;
      }

      totalPrazo += Number(pedido.total) || 0;

      if (!Array.isArray(pedido.parcelas)) {
        return;
      }

      pedido.parcelas.forEach((parcela) => {
        const valor = Number(parcela.valor) || 0;

        if (parcela.status === 'pago') {
          recebido += valor;
          return;
        }

        receber += valor;

        if (parcela.vencimento) {
          const vencimento = parcela.vencimento?.toDate
            ? parcela.vencimento.toDate()
            : new Date(parcela.vencimento);

          vencimento.setHours(0, 0, 0, 0);

          if (vencimento < hoje) {
            vencido += valor;
          }
        }
      });
    });

    setResumo({
      totalPedidos: lista.length,
      totalComprado,
      totalPrazo,
      recebido,
      receber,
      vencido,
    });
  }

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function formatarData(data) {
    if (!data) return '';

    const dataFormatada = data?.toDate ? data.toDate() : new Date(data);

    return dataFormatada.toLocaleDateString('pt-BR');
  }

  if (!usuario || usuario.tipo !== 'admin') {
    return (
      <View style={styles.semAcesso}>
        <Text style={styles.semAcessoTexto}>
          Acesso restrito ao administrador.
        </Text>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#a06a7d" />

        <Text style={styles.textoCarregando}>Carregando cliente...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* CABEÇALHO DO CLIENTE */}

      <View style={styles.clienteHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>
            {cliente.nome?.charAt(0)?.toUpperCase() || '👤'}
          </Text>
        </View>

        <Text style={styles.nome}>{cliente.nome || 'Cliente'}</Text>

        <Text style={styles.email}>{cliente.email || 'Sem e-mail'}</Text>
      </View>

      {/* DADOS DO CLIENTE */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>👤 Dados do cliente</Text>

        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valor}>{cliente.nome || 'Não informado'}</Text>

        <Text style={styles.label}>E-mail</Text>
        <Text style={styles.valor}>{cliente.email || 'Não informado'}</Text>

        <Text style={styles.label}>Contato</Text>
        <Text style={styles.valor}>{cliente.contato || 'Não informado'}</Text>

        <Text style={styles.label}>Endereço</Text>
        <Text style={styles.valor}>
          {cliente.endereco
            ? `${cliente.endereco}, ${cliente.numero || ''}`
            : 'Não informado'}
        </Text>

        <Text style={styles.label}>Cidade</Text>
        <Text style={styles.valor}>{cliente.cidade || 'Não informado'}</Text>
      </View>

      {/* RESUMO */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>📊 Resumo financeiro</Text>

        <View style={styles.grid}>
          <View style={styles.resumoCard}>
            <Text style={styles.icone}>🛍️</Text>

            <Text style={styles.label}>Pedidos</Text>

            <Text style={styles.numero}>{resumo.totalPedidos}</Text>
          </View>

          <View style={styles.resumoCard}>
            <Text style={styles.icone}>💰</Text>

            <Text style={styles.label}>Total comprado</Text>

            <Text style={styles.numero}>
              {formatarPreco(resumo.totalComprado)}
            </Text>
          </View>

          <View style={styles.resumoCard}>
            <Text style={styles.icone}>🟢</Text>

            <Text style={styles.label}>Recebido</Text>

            <Text style={styles.numero}>{formatarPreco(resumo.recebido)}</Text>
          </View>

          <View style={styles.resumoCard}>
            <Text style={styles.icone}>💳</Text>

            <Text style={styles.label}>A receber</Text>

            <Text style={styles.numero}>{formatarPreco(resumo.receber)}</Text>
          </View>

          <View style={styles.resumoCard}>
            <Text style={styles.icone}>🔴</Text>

            <Text style={styles.label}>Vencido</Text>

            <Text style={styles.numero}>{formatarPreco(resumo.vencido)}</Text>
          </View>

          <View style={styles.resumoCard}>
            <Text style={styles.icone}>📅</Text>

            <Text style={styles.label}>Compras a prazo</Text>

            <Text style={styles.numero}>
              {formatarPreco(resumo.totalPrazo)}
            </Text>
          </View>
        </View>
      </View>

      {/* CRÉDITO */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>💳 Crédito / Prazo</Text>

        <View style={styles.statusCredito}>
          <Text style={styles.statusIcone}>
            {cliente.creditoAprovado ? '🟢' : '🔴'}
          </Text>

          <View>
            <Text style={styles.statusTitulo}>
              {cliente.creditoAprovado
                ? 'Crédito aprovado'
                : 'Crédito não aprovado'}
            </Text>

            <Text style={styles.statusDescricao}>
              {cliente.prazoPagamento
                ? `Prazo: ${cliente.prazoPagamento} dias`
                : 'Nenhum prazo definido'}
            </Text>
          </View>
        </View>
      </View>

      {/* PEDIDOS */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>📋 Pedidos do cliente</Text>

        {pedidos.length === 0 ? (
          <Text style={styles.semPedidos}>
            Este cliente ainda não possui pedidos.
          </Text>
        ) : (
          pedidos.map((pedido) => (
            <View key={pedido.id} style={styles.pedidoCard}>
              <View>
                <Text style={styles.pedidoId}>Pedido #{pedido.id}</Text>

                <Text style={styles.pedidoData}>
                  📅 {formatarData(pedido.data)}
                </Text>

                <Text style={styles.formaPagamento}>
                  💳 {pedido.formaPagamento || 'Não informado'}
                </Text>
              </View>

              <Text style={styles.pedidoValor}>
                {formatarPreco(pedido.total)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf8f6',
  },

  clienteHeader: {
    alignItems: 'center',
    paddingVertical: 25,
    backgroundColor: '#f8e1e7',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#c48b9f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  avatarTexto: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },

  nome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },

  email: {
    marginTop: 5,
    color: '#777',
  },

  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a06a7d',
    marginBottom: 15,
  },

  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },

  valor: {
    fontSize: 15,
    color: '#333',
    marginTop: 2,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  resumoCard: {
    width: '48%',
    backgroundColor: '#fdf2f5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  icone: {
    fontSize: 20,
  },

  numero: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  statusCredito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
    padding: 12,
    borderRadius: 12,
  },

  statusIcone: {
    fontSize: 25,
    marginRight: 10,
  },

  statusTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  statusDescricao: {
    marginTop: 3,
    color: '#777',
  },

  pedidoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  pedidoId: {
    fontWeight: 'bold',
    color: '#333',
  },

  pedidoData: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
  },

  formaPagamento: {
    marginTop: 3,
    fontSize: 12,
    color: '#888',
  },

  pedidoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  semPedidos: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 15,
  },

  carregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoCarregando: {
    marginTop: 10,
    color: '#777',
  },

  semAcesso: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  semAcessoTexto: {
    color: '#777',
    fontSize: 16,
  },
});
