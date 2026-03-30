import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";


export default function PedidosScreen({ navigation }) {

  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    async function buscarPedidos() {
      const snapshot = await getDocs(collection(db, "pedidos"));

      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPedidos(lista);
    }

    buscarPedidos();
  }, []);

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

//   function renderStatus(status) {
//   if (status === "pendente") {
//     return "🟡 Pendente";
//   }

//   if (status === "saiu_entrega") {
//     return "🚚 Saiu para entrega";
//   }

//   if (status === "entregue") {
//     return "🟢 Entregue";
//   }

//   return status;
// }

  return (
    <View style={styles.container}>

      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate("PedidoDetalhe", { pedido: item })}
  >

    <Text style={styles.nome}>
      Cliente: {item.cliente?.nome}
    </Text>

    <Text>Telefone: {item.cliente?.telefone}</Text>

    <Text style={styles.total}>
      Total: {formatarPreco(item.total)}
    </Text>

    <Text>Endereço: {item.endereco}</Text>

    <Text style={{
  color: item.status === "entregue" ? "green" : "orange",
  fontWeight: "bold"
}}>
  {item.status === "entregue" ? "🟢 Entregue" : "🟡 Pendente"}
</Text>

{/* <Text style={{ fontWeight: "bold" }}>
  {renderStatus(item.status)}
</Text> */}

{item.status === "saiu_entrega" && (
  <Text style={{ color: "orange" }}>
    ⏱️ Chega em {item.tempoEstimado} min
  </Text>
)}

  </TouchableOpacity>
)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },

  card: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 2
  },

  nome: {
    fontWeight: "bold",
    fontSize: 16
  },

  total: {
    marginTop: 5,
    color: "#e60023",
    fontWeight: "bold"
  },

  data: {
    marginTop: 5,
    fontSize: 12,
    color: "#666"
  }
});