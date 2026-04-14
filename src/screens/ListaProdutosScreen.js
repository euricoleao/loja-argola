import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";

export default function ListaProdutosScreen({ navigation }) {

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProdutos(lista);
    });

    return () => unsubscribe();
  }, []);

  function formatar(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function confirmarExclusao(id) {
    Alert.alert("Excluir", "Deseja excluir?", [
      { text: "Cancelar" },
      {
        text: "Excluir",
        onPress: async () => {
          await deleteDoc(doc(db, "products", id));
        }
      }
    ]);
  }

  function renderItem({ item }) {
    return (
      <View style={styles.card}>

        {/* 🔹 IMAGEM */}
        <Image source={{ uri: item.imagem }} style={styles.imagem} />

        {/* 🔹 DADOS */}
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.nome}</Text>
          <Text>Cód: {item.codigo}</Text>
          <Text>Qtd: {item.quantidade}</Text>

          <Text>Compra: {formatar(item.precoCompra)}</Text>
          <Text>Venda: {formatar(item.precoVenda)}</Text>

          <Text style={{ color: "green" }}>
            Lucro: {formatar(item.lucro)}
          </Text>
        </View>

        {/* 🔹 AÇÕES */}
        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.editar}
            onPress={() => navigation.navigate("EditarProduto", { produto: item })}
          >
            <Text style={{ color: "#fff" }}>✏️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.excluir}
            onPress={() => confirmarExclusao(item.id)}
          >
            <Text style={{ color: "#fff" }}>🗑️</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📦 Produtos</Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f5f2",
    padding: 10
  },

  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3
  },

  imagem: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10
  },

  nome: {
    fontWeight: "bold",
    fontSize: 14
  },

  acoes: {
    justifyContent: "space-between"
  },

  editar: {
    backgroundColor: "#c48b9f",
    padding: 8,
    borderRadius: 8,
    marginBottom: 5
  },

  excluir: {
    backgroundColor: "#e60023",
    padding: 8,
    borderRadius: 8
  }
});