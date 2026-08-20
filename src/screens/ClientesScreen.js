import { collection, getDocs } from 'firebase/firestore';

import { useContext, useEffect, useState } from 'react';

import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function ClientesScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (usuario?.tipo === 'admin') {
      carregarClientes();
    }
  }, [usuario]);

  async function carregarClientes() {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));

      const lista = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }))
        .filter((cliente) => cliente.tipo !== 'admin');

      setClientes(lista);
    } catch (error) {
      console.log('❌ Erro ao carregar clientes:', error);
    }
  }

  function clientesFiltrados() {
    const texto = busca.toLowerCase().trim();

    if (!texto) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      const nome = cliente.nome?.toLowerCase() || '';

      const sobrenome = cliente.sobrenome?.toLowerCase() || '';

      const email = cliente.email?.toLowerCase() || '';

      return (
        nome.includes(texto) ||
        sobrenome.includes(texto) ||
        email.includes(texto)
      );
    });
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
      <Text style={styles.titulo}>👥 Clientes</Text>

      <TextInput
        style={styles.busca}
        placeholder="🔎 Buscar cliente..."
        value={busca}
        onChangeText={setBusca}
      />

      <Text style={styles.contador}>
        {clientesFiltrados().length} cliente(s)
      </Text>

      <FlatList
        data={clientesFiltrados()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        renderItem={({ item }) => {
          const nomeCompleto = [item.nome, item.sobrenome]
            .filter(Boolean)
            .join(' ');

          const creditoAprovado = item.creditoAprovado === true;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ClienteDetalhe', {
                  cliente: item,
                })
              }
            >
              <View style={styles.topo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>
                    {item.nome?.charAt(0)?.toUpperCase() || '👤'}
                  </Text>
                </View>

                <View style={styles.info}>
                  <Text style={styles.nome}>{nomeCompleto || 'Cliente'}</Text>

                  <Text style={styles.email}>
                    ✉️ {item.email || 'Sem email'}
                  </Text>

                  {item.telefone && (
                    <Text style={styles.telefone}>📞 {item.telefone}</Text>
                  )}
                </View>
              </View>

              <View style={styles.linha} />

              <View style={styles.creditoContainer}>
                <Text style={styles.creditoLabel}>💳 Crédito / Prazo</Text>

                <Text
                  style={[
                    styles.creditoStatus,
                    creditoAprovado ? styles.aprovado : styles.naoAprovado,
                  ]}
                >
                  {creditoAprovado ? '🟢 AUTORIZADO' : '🔴 NÃO AUTORIZADO'}
                </Text>
              </View>

              {creditoAprovado && item.prazoPagamento && (
                <View style={styles.prazoContainer}>
                  <Text style={styles.prazo}>
                    📅 Prazo autorizado: {item.prazoPagamento} dias
                  </Text>
                </View>
              )}

              <Text style={styles.verDetalhes}>Ver detalhes →</Text>
            </TouchableOpacity>
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
    marginBottom: 10,
  },

  busca: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 15,
  },

  contador: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    color: '#777',
    fontSize: 13,
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
  },

  topo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8e1e7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarTexto: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  nome: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },

  email: {
    marginTop: 4,
    color: '#777',
    fontSize: 13,
  },

  telefone: {
    marginTop: 3,
    color: '#777',
    fontSize: 13,
  },

  linha: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },

  creditoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  creditoLabel: {
    fontSize: 14,
    color: '#555',
  },

  creditoStatus: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  aprovado: {
    color: '#4CAF50',
  },

  naoAprovado: {
    color: '#e53935',
  },

  prazoContainer: {
    marginTop: 8,
    backgroundColor: '#fdf2f5',
    padding: 8,
    borderRadius: 8,
  },

  prazo: {
    color: '#a06a7d',
    fontWeight: '600',
    fontSize: 13,
  },

  verDetalhes: {
    marginTop: 12,
    textAlign: 'right',
    color: '#a06a7d',
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
