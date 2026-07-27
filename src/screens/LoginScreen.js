import { Ionicons } from '@expo/vector-icons';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

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
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { auth, db } from '../firebase/config';

export default function LoginScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);

  const [modoCadastro, setModoCadastro] = useState(false);

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [contato, setContato] = useState('');

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    tipo: 'sucesso',
  });

  async function recuperarSenha() {
    if (!email) {
      mostrarToast('Digite seu email', 'erro');

      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);

      mostrarToast('Email enviado!');
    } catch {
      mostrarToast('Erro ao enviar email', 'erro');
    }
  }

  async function entrar() {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), senha);

      mostrarToast('Bem-vindo!');

      navigation.replace('Home');
    } catch {
      mostrarToast('Email ou senha inválidos', 'erro');
    }
  }

  async function cadastrar() {
    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,

        email.trim(),

        senha,
      );

      const user = credencial.user;

      await setDoc(
        doc(db, 'usuarios', user.uid),

        {
          uid: user.uid,

          nome: nome,

          sobrenome: sobrenome,

          email: user.email,

          telefone: contato,

          foto: '',

          tipo: user.email === 'admin@admin.com' ? 'admin' : 'cliente',

          criadoEm: serverTimestamp(),
        },
      );

      mostrarToast('Cadastro realizado!');

      setModoCadastro(false);

      mostrarToast('Bem-vindo!');
    } catch (error) {
      console.log(error);

      mostrarToast('Erro ao cadastrar', 'erro');
    }
  }
  function mostrarToast(msg, tipo = 'sucesso') {
    setToast({
      visible: true,

      message: msg,

      tipo,
    });

    setTimeout(() => {
      setToast({
        visible: false,

        message: '',

        tipo: 'sucesso',
      });
    }, 2500);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <ImageBackground
            source={require('../../assets/images/bach-g3.jpeg')}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              {toast.visible && (
                <View
                  style={[
                    styles.toast,
                    toast.tipo === 'erro' && styles.toastErro,
                  ]}
                >
                  <Text style={styles.toastText}>
                    {toast.tipo === 'erro' ? '⚠️ ' : '✅ '}
                    {toast.message}
                  </Text>
                </View>
              )}

              <Text style={styles.logo}>💎</Text>

              <Text style={styles.titulo}>
                {modoCadastro ? 'Criar Conta' : 'Entrar'}
              </Text>

              {modoCadastro && (
                <>
                  <TextInput
                    placeholder="Nome"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={nome}
                    onChangeText={setNome}
                  />

                  <TextInput
                    placeholder="Sobrenome"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={sobrenome}
                    onChangeText={setSobrenome}
                  />

                  <TextInput
                    placeholder="Contato"
                    placeholderTextColor="#ddd"
                    style={styles.input}
                    value={contato}
                    onChangeText={setContato}
                  />
                </>
              )}

              <TextInput
                placeholder="E-mail"
                placeholderTextColor="#ddd"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />

              <View style={styles.senhaContainer}>
                <TextInput
                  placeholder="Senha"
                  placeholderTextColor="#ddd"
                  secureTextEntry={!mostrarSenha}
                  value={senha}
                  onChangeText={setSenha}
                  style={styles.inputSenha}
                />

                <TouchableOpacity
                  onPress={() => setMostrarSenha(!mostrarSenha)}
                >
                  <Ionicons
                    name={mostrarSenha ? 'eye-off' : 'eye'}
                    color="#fff"
                    size={22}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.botao}
                onPress={modoCadastro ? cadastrar : entrar}
              >
                <Text style={styles.botaoTexto}>
                  {modoCadastro ? 'Criar Conta' : 'Entrar'}
                </Text>
              </TouchableOpacity>

              {!modoCadastro && (
                <TouchableOpacity onPress={recuperarSenha}>
                  <Text style={styles.esqueceu}>Esqueceu sua senha?</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  setModoCadastro(!modoCadastro);
                  setNome('');
                  setSobrenome('');
                }}
              >
                <Text style={styles.cadastro}>
                  {modoCadastro
                    ? 'Já possui conta? Entrar'
                    : 'Primeiro acesso? Criar conta'}
                </Text>
              </TouchableOpacity>
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
    justifyContent: 'center',
    padding: 25,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  logo: {
    fontSize: 55,
    textAlign: 'center',
    marginBottom: 10,
  },

  titulo: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },

  input: {
    backgroundColor: 'rgba(255,255,255,.18)',
    borderRadius: 15,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#DDA99C',
  },

  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,.18)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#DDA99C',
    paddingHorizontal: 15,
    marginBottom: 15,
  },

  inputSenha: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
  },

  botao: {
    backgroundColor: '#B68973',
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
    elevation: 5,
  },

  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },

  esqueceu: {
    textAlign: 'center',
    marginTop: 18,
    color: '#E9D1CC',
    fontWeight: 'bold',
  },

  cadastro: {
    textAlign: 'center',
    marginTop: 25,
    color: '#DDA99C',
    fontSize: 16,
    fontWeight: 'bold',
  },

  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#43A047',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },

  toastErro: {
    backgroundColor: '#C62828',
  },

  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

// import { Ionicons } from '@expo/vector-icons';
// import {
//   createUserWithEmailAndPassword,
//   sendPasswordResetEmail,
//   signInWithEmailAndPassword,
// } from 'firebase/auth';
// import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
// import { useContext, useState } from 'react';
// import {
//   ImageBackground,
//   Keyboard,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import { AuthContext } from '../context/AuthContext';
// import { auth, db } from '../firebase/config';

// export default function LoginScreen({ navigation }) {
//   const [modoCadastro, setModoCadastro] = useState(false);
//   const [nome, setNome] = useState('');
//   const [email, setEmail] = useState('');
//   const [senha, setSenha] = useState('');
//   const [mostrarSenha, setMostrarSenha] = useState(false);
//   const [toast, setToast] = useState({
//     visible: false,
//     message: '',
//     tipo: 'sucesso', // 👈 ADICIONE ISSO
//   });

//   const { usuario } = useContext(AuthContext);

//   function mostrarToast(msg, tipo = 'sucesso') {
//     setToast({
//       visible: true,
//       message: msg,
//       tipo,
//     });

//     setTimeout(() => {
//       setToast({
//         visible: false,
//         message: '',
//         tipo: 'sucesso',
//       });
//     }, 2000);
//   }
//   // 🔐 LOGIN REAL
//   async function entrar() {
//     if (!email.trim()) {
//       mostrarToast('Digite seu e-mail', 'erro');
//       return;
//     }

//     if (!senha) {
//       mostrarToast('Digite sua senha', 'erro');
//       return;
//     }

//     try {
//       await signInWithEmailAndPassword(auth, email.trim(), senha);

//       mostrarToast('Login realizado com sucesso!');

//       setTimeout(() => {
//         navigation.replace('Home');
//       }, 800);
//     } catch (error) {
//       console.log(error);

//       mostrarToast('E-mail ou senha inválidos', 'erro');
//     }
//   }
//   // 🆕 CADASTRO
//   async function cadastrar() {
//     if (!nome.trim()) {
//       mostrarToast('Digite seu nome', 'erro');

//       return;
//     }

//     if (!email.trim()) {
//       mostrarToast('Digite um e-mail', 'erro');

//       return;
//     }

//     if (senha.length < 6) {
//       mostrarToast('Senha deve possuir no mínimo 6 caracteres', 'erro');

//       return;
//     }

//     try {
//       const credencial = await createUserWithEmailAndPassword(
//         auth,

//         email.trim(),

//         senha,
//       );

//       const user = credencial.user;

//       await setDoc(doc(db, 'usuarios', user.uid), {
//         uid: user.uid,

//         nome: nome.trim(),

//         email: user.email,

//         telefone: '',

//         foto: '',

//         tipo: user.email === 'admin@admin.com' ? 'admin' : 'cliente',

//         criadoEm: serverTimestamp(),
//       });

//       mostrarToast('Cadastro realizado com sucesso!');

//       setNome('');

//       setEmail('');

//       setSenha('');

//       setModoCadastro(false);

//       setTimeout(() => {
//         navigation.replace('Home');
//       }, 800);
//     } catch (error) {
//       console.log(error);

//       if (error.code === 'auth/email-already-in-use') {
//         mostrarToast('Este e-mail já está cadastrado.', 'erro');
//       } else if (error.code === 'auth/invalid-email') {
//         mostrarToast('E-mail inválido.', 'erro');
//       } else if (error.code === 'auth/weak-password') {
//         mostrarToast('Senha muito fraca.', 'erro');
//       } else {
//         mostrarToast('Erro ao criar conta.', 'erro');
//       }
//     }
//   }

//   async function recuperarSenha() {
//     if (!email.trim()) {
//       mostrarToast('Digite seu e-mail.', 'erro');

//       return;
//     }

//     try {
//       await sendPasswordResetEmail(auth, email.trim());

//       mostrarToast('Enviamos um link para seu e-mail.');
//     } catch (error) {
//       mostrarToast('Não foi possível enviar o e-mail.', 'erro');
//     }
//   }

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     >
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <ScrollView
//           contentContainerStyle={{
//             flexGrow: 1,
//             justifyContent: 'center',
//           }}
//           keyboardShouldPersistTaps="handled"
//         >
//           <ImageBackground
//             source={require('../../assets/images/bach-g3.jpeg')}
//             style={styles.background}
//             resizeMode="cover"
//           >
//             <View style={styles.overlay}>
//               {toast.visible && (
//                 <View
//                   style={[
//                     styles.toast,
//                     toast.tipo === 'erro' && styles.toastErro,
//                   ]}
//                 >
//                   <Text style={styles.toastText}>
//                     {toast.tipo === 'erro' ? '⚠️ ' : '✅ '}
//                     {toast.message}
//                   </Text>
//                 </View>
//               )}
//               <Text style={styles.titulo}>Login</Text>

//               {modoCadastro && (
//                 <TextInput
//                   style={styles.input}
//                   placeholder="Digite seu nome"
//                   placeholderTextColor="#E9D1CC"
//                   value={nome}
//                   onChangeText={setNome}
//                 />
//               )}

//               <TextInput
//                 placeholder="E-mail"
//                 value={email}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 placeholderTextColor="#E9D1CC"
//                 style={styles.input}
//               />

//               <View
//                 style={{
//                   flexDirection: 'row',
//                   alignItems: 'center',
//                   backgroundColor: 'rgba(255,255,255,0.18)',
//                   borderWidth: 1,
//                   borderColor: '#DDA99C',
//                   color: '#FFF7F7',
//                   borderRadius: 16,
//                   paddingHorizontal: 10,
//                   marginBottom: 15,
//                   fontSize: 16,
//                   height: 54,
//                 }}
//               >
//                 <TextInput
//                   placeholder="Senha"
//                   secureTextEntry={!mostrarSenha}
//                   placeholderTextColor="#E9D1CC"
//                   value={senha}
//                   onChangeText={setSenha}
//                   style={{
//                     flex: 1,
//                     padding: 10,
//                     color: '#FFF7F7',
//                     fontSize: 16,
//                   }}
//                 />

//                 <TouchableOpacity
//                   onPress={() => setMostrarSenha(!mostrarSenha)}
//                 >
//                   <Ionicons
//                     name={mostrarSenha ? 'eye-off' : 'eye'}
//                     size={22}
//                     color="#a06a7d"
//                   />
//                 </TouchableOpacity>
//               </View>

//               {/* 🔐 BOTÃO LOGIN */}
//               {/* Botão principal */}
//               <TouchableOpacity
//                 style={styles.botao}
//                 onPress={modoCadastro ? cadastrar : entrar}
//               >
//                 <Text style={styles.botaoTexto}>
//                   {modoCadastro ? 'Criar conta' : 'Entrar'}
//                 </Text>
//               </TouchableOpacity>

//               {/* Alternar modo */}
//               <TouchableOpacity
//                 onPress={() => {
//                   setModoCadastro(!modoCadastro);
//                   setNome('');
//                 }}
//               >
//                 <Text style={styles.botaoAviso}>
//                   {modoCadastro
//                     ? 'Já tenho cadastro. Entrar'
//                     : 'Primeiro acesso? Criar conta'}
//                 </Text>
//               </TouchableOpacity>
//               {!modoCadastro && (
//                 <TouchableOpacity onPress={recuperarSenha}>
//                   <Text
//                     style={{
//                       textAlign: 'center',
//                       marginTop: 8,
//                       color: '#E9D1CC',
//                       fontWeight: 'bold',
//                     }}
//                   >
//                     Esqueci minha senha
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </ImageBackground>
//         </ScrollView>
//       </TouchableWithoutFeedback>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     justifyContent: 'center',
//   },

//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'center',
//     padding: 25,
//   },

//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },

//   titulo: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: '#fff',
//   },

//   input: {
//     backgroundColor: 'rgba(255,255,255,0.18)',
//     borderWidth: 1,
//     borderColor: '#DDA99C',
//     borderRadius: 16,
//     padding: 15,
//     marginBottom: 15,
//     color: '#FFF7F7',
//     fontSize: 16,
//   },

//   botao: {
//     backgroundColor: '#B68973',
//     padding: 16,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 10,
//     shadowColor: '#8C614F',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 6,
//     elevation: 5,
//   },

//   botaoCadastro: {
//     backgroundColor: '#B68973',
//   },

//   textoBotao: {
//     color: '#FFF7F7',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   toast: {
//     position: 'absolute',
//     top: 60,
//     left: 20,
//     right: 20,
//     backgroundColor: '#c48b9f',
//     padding: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//     zIndex: 999,
//     elevation: 10,
//   },

//   toastErro: {
//     backgroundColor: '#a06a7d',
//   },

//   toastText: {
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   botaoAviso: {
//     textAlign: 'center',
//     color: '#B68973',
//     fontSize: 17,
//   },
// });
