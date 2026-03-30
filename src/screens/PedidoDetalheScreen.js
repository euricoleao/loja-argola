import * as Clipboard from "expo-clipboard";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Alert, FlatList, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { db } from "../firebase/config";







export default function PedidoDetalheScreen({ route, navigation }) {
    const isAdmin = false; // 🔒 troque para false para usuário normal

    const { pedido } = route.params;


    // async function resetarStatus() {
    //     try {
    //         await updateDoc(doc(db, "pedidos", pedido.id), {
    //             status: "pendente",
    //             statusPagamento: "pendente"
    //         });

    //         alert("Status resetado!");
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // function renderPagamentoStatus(status) {
    //     if (status === "pago") return "✅ Pago";
    //     return "⏳ Aguardando pagamento";
    // }


    function formatarPreco(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }
    async function atualizarStatus() {
        try {
            await updateDoc(doc(db, "pedidos", pedido.id), {
                status: proximoStatus(pedido.status)
            });

            alert("Status atualizado!");
        } catch (error) {
            console.error(error);
        }
    }


    async function confirmarPagamento() {
        try {
            await updateDoc(doc(db, "pedidos", pedido.id), {
                statusPagamento: "pago"
            });

            alert("Pagamento confirmado!");
        } catch (error) {
            console.error(error);
        }
    }

    function proximoStatus(statusAtual) {
        if (statusAtual === "pendente") return "saiu_entrega";
        if (statusAtual === "saiu_entrega") return "entregue";
        return "entregue";
    }

    function renderStatus(status) {
        if (status === "pendente") {
            return "🟡 Pendente";
        }

        if (status === "saiu_entrega") {
            return "🚚 Saiu para entrega";
        }

        if (status === "entregue") {
            return "🟢 Entregue";
        }

        return status;
    }

    // function renderPagamento(tipo) {
    //     if (tipo === "pix") return "📲 PIX";
    //     if (tipo === "dinheiro") return "💵 Dinheiro";
    //     if (tipo === "cartao") return "💳 Cartão";
    //     return tipo;
    // }

    async function excluirPedido() {
        try {
            await deleteDoc(doc(db, "pedidos", pedido.id));

            alert("Pedido excluído!");

            // 👇 voltar para tela anterior
            navigation.goBack();

        } catch (error) {
            console.error(error);
            alert("Erro ao excluir pedido");
        }
    }

    function confirmarExclusao() {
        Alert.alert(
            "Excluir Pedido",
            "Tem certeza que deseja excluir?",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Excluir", style: "destructive", onPress: excluirPedido }
            ]
        );
    }

    // async function limparPedidos() {
    //     const snapshot = await getDocs(collection(db, "pedidos"));

    //     snapshot.forEach(async (docItem) => {
    //         await deleteDoc(doc(db, "pedidos", docItem.id));
    //     });

    //     alert("Todos pedidos foram removidos!");
    // }

    function copiarPix() {
  const chavePix = "gisamori@gmail.com"; // 👈 coloque sua chave real

  Clipboard.setStringAsync(chavePix);
  ToastAndroid.show("Chave copiada!", ToastAndroid.SHORT);
}
<Text>{pedido.formaPagamento}</Text>

    return (
     <View style={styles.container}>

  <Text style={styles.titulo}>Detalhes do Pedido</Text>

  <Text>Cliente: {pedido.cliente?.nome}</Text>
  <Text>Telefone: {pedido.cliente?.telefone}</Text>
  <Text>Endereço: {pedido.endereco}</Text>

  {/* 🔘 BOTÕES MAIS PRA CIMA */}
  <View style={{ flexDirection: "row", marginTop: 15 }}>

    <TouchableOpacity
      style={[styles.botao, styles.botaoPrimario, { flex: 1, marginRight: 5 }]}
      onPress={atualizarStatus}
    >
      <Text style={styles.botaoTexto}>🚚 Status</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.botao, styles.botaoSecundario, { flex: 1, marginRight: 5 }]}
      onPress={confirmarPagamento}
    >
      <Text style={styles.botaoTexto}>💰 Pago</Text>
    </TouchableOpacity>

   {isAdmin && (
  <TouchableOpacity
    style={[styles.botao, styles.botaoPerigo, { flex: 1 }]}
    onPress={confirmarExclusao}
  >
    <Text style={styles.botaoTexto}>🗑️</Text>
  </TouchableOpacity>
)}
  </View>

  {/* 📲 QR CODE CENTRALIZADO */}
  {pedido.formaPagamento === "pix" && (
    <View style={{
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 20
    }}>
      <Text style={{ marginBottom: 10 }}>
        Pagamento via PIX
      </Text>

      <QRCode
        value={`PIX ${pedido.total}`}
        size={200}
      />
     
     
        {/* 📋 BOTÃO COPIAR */}
    <TouchableOpacity
      style={{
        marginTop: 10,
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 8
      }}
      onPress={copiarPix}
    >
      <Text style={{ color: "#fff", fontWeight: "bold" }}>
        📋 Copiar chave PIX
      </Text>
    </TouchableOpacity>

    </View>
  )}

  {/* 📦 PRODUTOS */}
  <FlatList
    data={pedido.produtos}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.card}>
        <Text>{item.nome}</Text>
        <Text>Qtd: {item.quantidade}</Text>
        <Text>{formatarPreco(item.preco)}</Text>
      </View>
    )}
  />

</View>
    );
}

const styles = StyleSheet.create({
    container: {
  flex: 1,
  padding: 15,
  backgroundColor: "#f5f5f5",
  alignItems: "stretch"
},

    titulo: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },

    subtitulo: {
        marginTop: 10,
        fontWeight: "bold"
    },

    card: {
        backgroundColor: "#fff",
        padding: 10,
        marginTop: 5,
        borderRadius: 10
    },

    total: {
        marginTop: 10,
        fontWeight: "bold",
        fontSize: 16,
        color: "#e60023"
    },

    botoesContainer: {
  marginTop: 15,
  gap: 10 // espaço entre botões (React Native mais novo)
},

botao: {
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center"
},

botaoTexto: {
  color: "#fff",
  fontWeight: "bold"
},

botaoPrimario: {
  backgroundColor: "#4CAF50"
},

botaoSecundario: {
  backgroundColor: "#2196F3"
},

botaoPerigo: {
  backgroundColor: "#e60023"
}
});