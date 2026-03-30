import { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { auth, db } from "../firebase/config";



export default function LoginScreen({ navigation }) {

  const { loginAdmin, loginCliente } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  // 🔐 LOGIN REAL
 async function entrar() {
  const emailLimpo = email.trim();

  if (!emailLimpo || !emailLimpo.includes("@")) {
    alert("Digite um email válido");
    return;
  }

  if (!senha) {
    alert("Digite a senha");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      emailLimpo,
      senha
    );

    const user = userCredential.user;

    if (user.email === "admin@admin.com") {
      loginAdmin();
    } else {
      loginCliente();
    }

    navigation.navigate("Home");

  } catch (error) {
    console.error(error);
    alert("Email ou senha inválidos");
  }
}

  // 🆕 CADASTRO
 async function cadastrar() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      senha
    );

    const user = userCredential.user;

    // 👇 salva no Firestore
    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      tipo: user.email === "admin@admin.com" ? "admin" : "cliente",
      criadoEm: new Date()
    });

    alert("Usuário criado!");

    // 🧹 LIMPAR CAMPOS
    setEmail("");
    setSenha("");


  } catch (error) {
    console.error(error);
    alert("Erro ao cadastrar");
  }
}
  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      {/* 🔐 BOTÃO LOGIN */}
      <TouchableOpacity style={styles.botao} onPress={entrar}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5"
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  botao: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },

  botaoCadastro: {
    backgroundColor: "#2196F3"
  },

  botaoTexto: {
    color: "#fff",
    fontWeight: "bold"
  }
});