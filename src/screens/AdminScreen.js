import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminScreen({ navigation }) {
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
    alignItems: "center"
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});