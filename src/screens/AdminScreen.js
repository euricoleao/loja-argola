import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { AuthContext } from "../context/AuthContext";


export default function AdminScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === "admin";
  return (
    <View style={styles.container}>

      <Text style={styles.title}>Painel Administrativo</Text>

      {/* BOTÃO CADASTRAR PRODUTO */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CadastrarProduto")}
      >
        <Text style={styles.buttonText}>Cadastrar Produto</Text>
      </TouchableOpacity>

     
      {/* BOTÃO DASHBOARD */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Dashboard")}
      >
        <Text style={styles.buttonText}>📊 Ver Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}
        title="Ver Produtos"
        onPress={() => navigation.navigate("ListaProdutos")}
        
      >
      <Text style={styles.buttonText}>📦 Ver Produtos</Text>
     </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});