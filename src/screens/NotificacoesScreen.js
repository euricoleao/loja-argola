import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function NotificacoesScreen() {
  const { usuario } = useContext(AuthContext);

  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!usuario?.uid) {
      setCarregando(false);
      return;
    }

    const notificacoesRef = collection(
      db,
      'usuarios',
      usuario.uid,
      'notificacoes',
    );

    const q = query(notificacoesRef, orderBy('criadoEm', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log('🔔 NOTIFICAÇÕES:', lista);

        setNotificacoes(lista);
        setCarregando(false);
      },
      (error) => {
        console.log('❌ ERRO NOTIFICAÇÕES:', error);
        setCarregando(false);
      },
    );

    return () => unsubscribe();
  }, [usuario?.uid]);

  async function apagarNotificacao(id) {
    try {
      await deleteDoc(doc(db, 'usuarios', usuario.uid, 'notificacoes', id));

      console.log('🗑️ Notificação apagada:', id);
    } catch (error) {
      console.log('❌ Erro ao apagar notificação:', error);
    }
  }

  function renderNotificacao({ item }) {
    return (
      <View style={[styles.notificacao, !item.lida && styles.naoLida]}>
        <View style={styles.icone}>
          <Ionicons name="notifications" size={22} color="#C48B9F" />
        </View>

        <View style={styles.conteudo}>
          <Text style={styles.titulo}>{item.titulo}</Text>

          <Text style={styles.mensagem}>{item.mensagem}</Text>
        </View>

        <TouchableOpacity
          onPress={() => apagarNotificacao(item.id)}
          style={styles.botaoApagar}
        >
          <Ionicons name="trash-outline" size={21} color="#C48B9F" />
        </TouchableOpacity>

        {!item.lida && <View style={styles.ponto} />}
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color="#C48B9F" />

        <Text style={styles.carregandoTexto}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {notificacoes.length === 0 ? (
        <View style={styles.vazio}>
          <Ionicons
            name="notifications-off-outline"
            size={60}
            color="#D8A7B1"
          />

          <Text style={styles.textoVazio}>Nenhuma notificação</Text>

          <Text style={styles.subtexto}>
            Quando houver novidades sobre seus pedidos, elas aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificacao}
          contentContainerStyle={styles.lista}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f5',
  },

  lista: {
    padding: 15,
  },

  notificacao: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },

  naoLida: {
    borderLeftWidth: 4,
    borderLeftColor: '#C48B9F',
  },

  icone: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#f8e1e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  conteudo: {
    flex: 1,
  },

  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },

  mensagem: {
    marginTop: 5,
    fontSize: 14,
    color: '#777',
    lineHeight: 19,
  },

  ponto: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#C48B9F',
    marginLeft: 8,
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  textoVazio: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
  },

  subtexto: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  carregando: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
  },

  carregandoTexto: {
    marginTop: 10,
    color: '#777',
  },
  botaoApagar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f8e1e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
