import { Ionicons } from '@expo/vector-icons';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { useContext, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';

export default function AlterarSenhaScreen() {
  const { usuario } = useContext(AuthContext);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarAtual, setMostrarAtual] = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [salvando, setSalvando] = useState(false);

  async function alterarSenha() {
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    if (!senhaAtual) {
      Alert.alert('Atenção', 'Digite sua senha atual.');
      return;
    }

    if (!novaSenha) {
      Alert.alert('Atenção', 'Digite a nova senha.');
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert(
        'Atenção',
        'A nova senha deve possuir pelo menos 6 caracteres.',
      );
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert('Atenção', 'A confirmação da senha não confere.');
      return;
    }

    if (senhaAtual === novaSenha) {
      Alert.alert('Atenção', 'A nova senha deve ser diferente da senha atual.');
      return;
    }

    try {
      setSalvando(true);

      const email = usuario.email;

      if (!email) {
        Alert.alert('Erro', 'Não foi possível identificar o e-mail da conta.');
        return;
      }

      // Reautentica o usuário com a senha atual
      const credential = EmailAuthProvider.credential(email, senhaAtual);

      await reauthenticateWithCredential(usuario, credential);

      // Altera para a nova senha
      await updatePassword(usuario, novaSenha);

      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');

      Alert.alert('Senha alterada ✅', 'Sua senha foi alterada com sucesso.');
    } catch (error) {
      console.log('❌ ERRO AO ALTERAR SENHA:', error);

      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        Alert.alert(
          'Senha incorreta',
          'A senha atual informada está incorreta.',
        );
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert(
          'Muitas tentativas',
          'Aguarde alguns minutos antes de tentar novamente.',
        );
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          'Faça login novamente',
          'Por segurança, faça login novamente antes de alterar sua senha.',
        );
      } else {
        Alert.alert('Erro', 'Não foi possível alterar sua senha.');
      }
    } finally {
      setSalvando(false);
    }
  }

  function CampoSenha({
    titulo,
    valor,
    onChangeText,
    mostrar,
    setMostrar,
    placeholder,
  }) {
    return (
      <View style={styles.campoContainer}>
        <Text style={styles.label}>{titulo}</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#c48b9f" />

          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#aaa"
            secureTextEntry={!mostrar}
            editable={!salvando}
            autoCapitalize="none"
          />

          <TouchableOpacity onPress={() => setMostrar(!mostrar)}>
            <Ionicons
              name={mostrar ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View style={styles.iconeHeader}>
            <Ionicons name="lock-closed-outline" size={30} color="#c48b9f" />
          </View>

          <Text style={styles.titulo}>Alterar senha</Text>

          <Text style={styles.subtitulo}>
            Atualize sua senha para manter sua conta segura.
          </Text>
        </View>

        {/* FORMULÁRIO */}

        <View style={styles.card}>
          <CampoSenha
            titulo="Senha atual"
            valor={senhaAtual}
            onChangeText={setSenhaAtual}
            mostrar={mostrarAtual}
            setMostrar={setMostrarAtual}
            placeholder="Digite sua senha atual"
          />

          <CampoSenha
            titulo="Nova senha"
            valor={novaSenha}
            onChangeText={setNovaSenha}
            mostrar={mostrarNova}
            setMostrar={setMostrarNova}
            placeholder="Digite a nova senha"
          />

          <CampoSenha
            titulo="Confirmar nova senha"
            valor={confirmarSenha}
            onChangeText={setConfirmarSenha}
            mostrar={mostrarConfirmar}
            setMostrar={setMostrarConfirmar}
            placeholder="Digite novamente a nova senha"
          />

          <View style={styles.dica}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#a06a7d"
            />

            <Text style={styles.dicaTexto}>
              A senha deve possuir pelo menos 6 caracteres.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.botao, salvando && styles.botaoDesabilitado]}
            onPress={alterarSenha}
            disabled={salvando}
          >
            <Ionicons name="checkmark-circle-outline" size={21} color="#fff" />

            <Text style={styles.textoBotao}>
              {salvando ? 'Alterando...' : 'Alterar senha'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
  },

  content: {
    padding: 20,
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  iconeHeader: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: '#f3dfe6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#302323',
  },

  subtitulo: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  campoContainer: {
    marginBottom: 17,
  },

  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 7,
  },

  inputContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ead5dc',
    borderRadius: 11,
    backgroundColor: '#fdfafb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 14,
  },

  dica: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 18,
  },

  dicaTexto: {
    flex: 1,
    marginLeft: 8,
    color: '#8f596c',
    fontSize: 12,
    lineHeight: 17,
  },

  botao: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#c48b9f',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    elevation: 3,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});
