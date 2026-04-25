import { Ionicons } from '@expo/vector-icons';
import { useContext, useState } from 'react';
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    tipo: "sucesso" // 👈 ADICIONE ISSO
  });


  // 🔐 LOGIN REAL
  async function entrar() {
    const emailLimpo = email.trim();

    if (!emailLimpo || !emailLimpo.includes('@')) {
      mostrarToast('Digite um email válido', 'erro');
      return;
    }

    if (!senha) {
      mostrarToast('Digite a senha', 'erro');
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
      mostrarToast('Email ou senha inválidos', 'erro');
    }
    mostrarToast('Login realizado com sucesso!');
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

      mostrarToast('Cadastro realizado com sucesso!');

      // 👇 loga automaticamente após cadastro
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      // 🧹 LIMPAR CAMPOS
      setEmail('');
      setSenha('');
      navigation.navigate('Home');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        mostrarToast('Este e-mail já está cadastrado. Tente fazer login.', 'erro');
      } else if (error.code === 'auth/invalid-email') {
        mostrarToast('Digite um e-mail válido.', 'erro');
      } else if (error.code === 'auth/weak-password') {
        mostrarToast('A senha deve ter pelo menos 6 caracteres.', 'erro');
      } else {
        console.log(error);
        mostrarToast('Erro ao cadastrar.', 'erro');
      }
    }
  }
  function mostrarToast(msg, tipo = "sucesso") {
    setToast({ visible: true, message: msg, tipo });

    setTimeout(() => {
      setToast({ visible: false, message: "", tipo: "sucesso" });
    }, 2000);
  }


  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            
          }}
          keyboardShouldPersistTaps="handled"
        >

          <ImageBackground
            source={require('../../assets/images/bach-g3.jpeg')}
            style={styles.background}
            resizeMode="cover"
          >



            <View style={styles.overlay}>
              {toast.visible && (
                <View style={[
                  styles.toast,
                  toast.tipo === "erro" && styles.toastErro
                ]}>
                  <Text style={styles.toastText}>
                    {toast.tipo === "erro" ? "⚠️ " : "✅ "}
                    {toast.message}
                  </Text>
                </View>
              )}
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

              <View style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderWidth: 1,
                borderColor: '#DDA99C',
                color: '#FFF7F7',
                borderRadius: 16,
                paddingHorizontal: 10,
                marginBottom: 15,
                fontSize: 16,
                height: 54,
              }}>

                <TextInput
                  placeholder="Senha"
                  secureTextEntry={!mostrarSenha}
                  placeholderTextColor="#E9D1CC"
                  style={{
                    flex: 1,
                    padding: 10,
                    color: '#FFF7F7',
                    fontSize: 16,

                  }}
                />

                <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                  <Ionicons
                    name={mostrarSenha ? "eye-off" : "eye"}
                    size={22}
                    color="#a06a7d"
                  />
                </TouchableOpacity>

              </View>



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
               <Text style={styles.botaoAviso}>Primeiro acesso? digite email e senha e clique em cadastrar</Text>

            </View>
          </ImageBackground>


        </ScrollView>

      </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
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
    color: '#fff',
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
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#c48b9f",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 999,
    elevation: 10,
  },

  toastErro: {
    backgroundColor: "#a06a7d"
  },

  toastText: {
    color: "#fff",
    fontWeight: "bold",
  },
  botaoAviso: {
    textAlign: "center",
    color: "#B68973",
    fontSize: 17
  }
});
