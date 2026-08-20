import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

import { db } from '../firebase/config';

export default function GerenciarClientesScreen() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarClientes() {
    try {
      setCarregando(true);

      const snapshot = await getDocs(collection(db, 'usuarios'));

      const lista = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }))
        .filter((cliente) => cliente.tipo === 'cliente');

      setClientes(lista);
    } catch (error) {
      console.log('❌ Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  async function alterarCredito(cliente, aprovado) {
    try {
      await updateDoc(doc(db, 'usuarios', cliente.id), {
        creditoAprovado: aprovado,
        prazoPagamento: aprovado ? cliente.prazoPagamento || 30 : null,
      });

      setClientes((listaAtual) =>
        listaAtual.map((item) =>
          item.id === cliente.id
            ? {
                ...item,
                creditoAprovado: aprovado,
                prazoPagamento: aprovado ? item.prazoPagamento || 30 : null,
              }
            : item,
        ),
      );

      console.log(
        aprovado
          ? `✅ Crédito liberado para ${cliente.nome}`
          : `❌ Crédito bloqueado para ${cliente.nome}`,
      );
    } catch (error) {
      console.log('❌ Erro ao alterar crédito:', error);

      Alert.alert(
        'Erro',
        'Não foi possível alterar a autorização deste cliente.',
      );
    }
  }

  async function alterarPrazo(cliente, prazo) {
    try {
      await updateDoc(doc(db, 'usuarios', cliente.id), {
        prazoPagamento: prazo,
      });

      setClientes((listaAtual) =>
        listaAtual.map((item) =>
          item.id === cliente.id
            ? {
                ...item,
                prazoPagamento: prazo,
              }
            : item,
        ),
      );

      console.log(`✅ Prazo de ${prazo} dias definido para ${cliente.nome}`);
    } catch (error) {
      console.log('❌ Erro ao alterar prazo:', error);

      Alert.alert('Erro', 'Não foi possível alterar o prazo.');
    }
  }

  function selecionarPrazo(cliente) {
    Alert.alert(
      'Prazo de pagamento',
      `Escolha o prazo para ${cliente.nome || 'cliente'}`,
      [
        {
          text: '30 dias',
          onPress: () => alterarPrazo(cliente, 30),
        },
        {
          text: '60 dias',
          onPress: () => alterarPrazo(cliente, 60),
        },
        {
          text: '90 dias',
          onPress: () => alterarPrazo(cliente, 90),
        },
        {
          text: '120 dias',
          onPress: () => alterarPrazo(cliente, 120),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  }

  function renderCliente({ item }) {
    const nomeCompleto = `${item.nome || ''} ${item.sobrenome || ''}`.trim();

    return (
      <View style={styles.card}>
        <Text style={styles.nome}>{nomeCompleto || 'Cliente sem nome'}</Text>

        <Text style={styles.email}>{item.email || 'Sem e-mail'}</Text>

        <Text style={styles.telefone}>{item.telefone || 'Sem telefone'}</Text>

        <View style={styles.linha}>
          <Text style={styles.label}>Compra a prazo</Text>

          <Switch
            value={item.creditoAprovado === true}
            onValueChange={(valor) => alterarCredito(item, valor)}
          />
        </View>

        {item.creditoAprovado === true && (
          <TouchableOpacity
            style={styles.prazoButton}
            onPress={() => selecionarPrazo(item)}
          >
            <Text style={styles.prazoText}>
              Prazo autorizado: {item.prazoPagamento || 30} dias
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Carregando clientes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gerenciar Clientes</Text>

      <Text style={styles.subtitulo}>Autorize clientes a comprar a prazo</Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        renderItem={renderCliente}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhum cliente encontrado.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf8f6',
    padding: 15,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#a06a7d',
    marginTop: 10,
  },

  subtitulo: {
    textAlign: 'center',
    color: '#777',
    marginTop: 5,
    marginBottom: 15,
  },

  lista: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  email: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },

  telefone: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },

  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },

  prazoButton: {
    backgroundColor: '#f8e1e7',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },

  prazoText: {
    color: '#a06a7d',
    fontWeight: 'bold',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },

  vazio: {
    textAlign: 'center',
    marginTop: 40,
    color: '#777',
  },
});
