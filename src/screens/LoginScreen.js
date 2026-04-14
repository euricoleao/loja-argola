import { useContext, useState } from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { doc, setDoc } from 'firebase/firestore';
import { AuthContext } from '../context/AuthContext';
import { auth, db } from '../firebase/config';

export default function LoginScreen({ navigation }) {
  const { loginAdmin, loginCliente } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // 🔐 LOGIN REAL
  async function entrar() {
    const emailLimpo = email.trim();

    if (!emailLimpo || !emailLimpo.includes('@')) {
      alert('Digite um email válido');
      return;
    }

    if (!senha) {
      alert('Digite a senha');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailLimpo.trim(),
        senha,
      );

      const user = userCredential.user;

      if (user.email === 'admin@admin.com') {
        loginAdmin();
      } else {
        loginCliente();
      }

      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      alert('Email ou senha inválidos');
    }
 alert('Login realizado com sucesso!');
     setEmail('');
      setSenha('');
  }

  // 🆕 CADASTRO
  async function cadastrar() {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        senha,
      );

      const user = userCredential.user;

      // 👇 salva no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: user.email,
        tipo: user.email === 'admin@admin.com' ? 'admin' : 'cliente',
        criadoEm: new Date(),
      });

      alert('Cadastro realizado com sucesso!');

      // 👇 loga automaticamente após cadastro
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      // 🧹 LIMPAR CAMPOS
      setEmail('');
      setSenha('');
      navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Digite um e-mail válido.');
      } else if (error.code === 'auth/weak-password') {
        alert('A senha deve ter pelo menos 6 caracteres.');
      } else {
        console.log(error);
        alert('Erro ao cadastrar.');
      }
    }
  }
  return (
    <ImageBackground
      source={require('../../assets/images/bach-g3.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.titulo}>Login</Text>

        <TextInput
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#E9D1CC"
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#E9D1CC"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />

        {/* 🔐 BOTÃO LOGIN */}
        <TouchableOpacity style={styles.botao} onPress={() => entrar()}>
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>

        {/* 🆕 BOTÃO CADASTRAR */}
        <TouchableOpacity
          style={[styles.botao, styles.botaoCadastro]}
          onPress={cadastrar}
        >
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 25,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  input: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: '#DDA99C',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    color: '#FFF7F7',
    fontSize: 16,
  },

  botao: {
    backgroundColor: '#B68973',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#8C614F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },

  botaoCadastro: {
    backgroundColor: '#B68973',
  },

  textoBotao: {
    color: '#FFF7F7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
