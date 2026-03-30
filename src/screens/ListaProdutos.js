import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../firebase/config";

export default function ListaProdutos() {

  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    async function buscarProdutos() {

      const querySnapshot = await getDocs(collection(db, "products"));

      const lista = [];

      querySnapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setProdutos(lista);
    }

    buscarProdutos();
  }, []);

  return (

    <SafeAreaView style={styles.container}>

      <Text style={styles.titulo}>Produtos</Text>

      {produtos.map((item) => (

        <View key={item.id} style={styles.card}>

          <Text style={styles.nome}>{item.nome}</Text>

          <Text style={styles.preco}>R$ {item.preco}</Text>

        </View>

      ))}

    </SafeAreaView>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    marginTop: 40
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    backgroundColor: "#f2f2f2",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10
  },

  nome: {
    fontSize: 18
  },

  preco: {
    fontSize: 16,
    color: "green"
  }

});