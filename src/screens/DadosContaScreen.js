import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function DadosContaScreen() {
  const { usuario } = useContext(AuthContext);

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [foto, setFoto] = useState('');

  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      if (!usuario?.uid) {
        setCarregando(false);
        return;
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid);
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
          const dados = snapshot.data();

          setNome(dados.nome || '');
          setSobrenome(dados.sobrenome || '');
          setTelefone(dados.telefone || '');
          setEmail(dados.email || usuario.email || '');
          setFoto(dados.foto || '');
        } else {
          // Caso os dados ainda estejam no AuthContext
          setNome(usuario.nome || '');
          setSobrenome(usuario.sobrenome || '');
          setTelefone(usuario.telefone || '');
          setEmail(usuario.email || '');
          setFoto(usuario.foto || '');
        }
      } catch (error) {
        console.log('❌ Erro ao carregar dados:', error);

        Alert.alert('Erro', 'Não foi possível carregar os dados da conta.');
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [usuario]);

  async function salvarDados() {
    if (!usuario?.uid) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    if (!nome.trim()) {
      Alert.alert('Atenção', 'Digite seu nome.');
      return;
    }

    if (!sobrenome.trim()) {
      Alert.alert('Atenção', 'Digite seu sobrenome.');
      return;
    }

    if (!telefone.trim()) {
      Alert.alert('Atenção', 'Digite seu telefone.');
      return;
    }

    try {
      setSalvando(true);

      const ref = doc(db, 'usuarios', usuario.uid);

      await updateDoc(ref, {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        telefone: telefone.trim(),
      });

      setEditando(false);

      Alert.alert(
        'Dados atualizados',
        'Seus dados foram atualizados com sucesso! ✅',
      );
    } catch (error) {
      console.log('❌ Erro ao salvar dados:', error);

      Alert.alert('Erro', 'Não foi possível atualizar seus dados.');
    } finally {
      setSalvando(false);
    }
  }

  function cancelarEdicao() {
    // Recarrega os dados do Firebase
    if (!usuario?.uid) return;

    getDoc(doc(db, 'usuarios', usuario.uid))
      .then((snapshot) => {
        if (snapshot.exists()) {
          const dados = snapshot.data();

          setNome(dados.nome || '');
          setSobrenome(dados.sobrenome || '');
          setTelefone(dados.telefone || '');
          setEmail(dados.email || '');
          setFoto(dados.foto || '');
        }
      })
      .catch((error) => {
        console.log('❌ Erro ao cancelar edição:', error);
      });

    setEditando(false);
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#c48b9f" />

        <Text style={styles.loadingTexto}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* FOTO */}

      <View style={styles.fotoContainer}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} />
        ) : (
          <View style={styles.fotoPlaceholder}>
            <Ionicons name="person" size={55} color="#c48b9f" />
          </View>
        )}

        {editando && (
          <TouchableOpacity style={styles.botaoFoto}>
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.titulo}>Dados da conta</Text>

      <Text style={styles.subtitulo}>
        Confira e mantenha seus dados atualizados.
      </Text>

      {/* NOME */}

      <View style={styles.campo}>
        <Text style={styles.label}>Nome</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#c48b9f" />

          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            editable={editando}
            placeholder="Nome"
          />
        </View>
      </View>

      {/* SOBRENOME */}

      <View style={styles.campo}>
        <Text style={styles.label}>Sobrenome</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#c48b9f" />

          <TextInput
            style={styles.input}
            value={sobrenome}
            onChangeText={setSobrenome}
            editable={editando}
            placeholder="Sobrenome"
          />
        </View>
      </View>

      {/* TELEFONE */}

      <View style={styles.campo}>
        <Text style={styles.label}>Telefone</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#c48b9f" />

          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={setTelefone}
            editable={editando}
            placeholder="Telefone"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* E-MAIL */}

      <View style={styles.campo}>
        <Text style={styles.label}>E-mail</Text>

        <View style={[styles.inputContainer, styles.inputDesabilitado]}>
          <Ionicons name="mail-outline" size={20} color="#aaa" />

          <TextInput
            style={[styles.input, styles.emailDesabilitado]}
            value={email}
            editable={false}
            placeholder="E-mail"
          />
        </View>

        <Text style={styles.infoEmail}>
          🔒 O e-mail não pode ser alterado por aqui.
        </Text>
      </View>

      {/* BOTÕES */}

      {!editando ? (
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => setEditando(true)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />

          <Text style={styles.textoBotao}>Editar dados</Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            style={styles.botaoSalvar}
            onPress={salvarDados}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.textoBotao}>Salvar alterações</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={cancelarEdicao}
            disabled={salvando}
          >
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5f2',
  },

  loadingTexto: {
    marginTop: 10,
    color: '#777',
  },

  fotoContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 15,
  },

  foto: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  fotoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f3dfe6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  botaoFoto: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#c48b9f',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#302323',
    textAlign: 'center',
  },

  subtitulo: {
    textAlign: 'center',
    color: '#888',
    marginTop: 5,
    marginBottom: 25,
  },

  campo: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  inputDesabilitado: {
    backgroundColor: '#eee',
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#333',
  },

  emailDesabilitado: {
    color: '#888',
  },

  infoEmail: {
    fontSize: 11,
    color: '#999',
    marginTop: 5,
  },

  botaoEditar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c48b9f',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    elevation: 3,
  },

  botaoSalvar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#c48b9f',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    elevation: 3,
  },

  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoCancelar: {
    padding: 14,
    alignItems: 'center',
  },

  textoCancelar: {
    color: '#777',
    fontWeight: 'bold',
  },
});
