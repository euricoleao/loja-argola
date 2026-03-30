import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase/config";

;



export default function CartScreen() {

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");

  const {
    carrinho,
    removerDoCarrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    limparCarrinho

  } = useContext(CartContext);

  // 💰 TOTAL
  const total = carrinho.reduce((soma, item) => {
    return soma + item.preco * item.quantidade;
  }, 0);


  function gerarPix() {
  return `Pagamento PIX
Nome: ${nomeCliente}
Valor: R$ ${total}`;
}

  function formatarPreco(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  // 🛒 FINALIZAR COMPRA
  async function finalizarPedido() {

    // Validação simples
    if (!nomeCliente) {
      alert("Digite o nome do cliente");
      return;
    }

    if (!endereco) {
      alert("Digite o endereço");
      return;
    }


    if (carrinho.length === 0) {
      alert("Carrinho vazio!");
      return;
    }

    try {
      await addDoc(collection(db, "pedidos"), {
        produtos: carrinho || [],
        total: total || 0,
        cliente: {
          nome: nomeCliente || "",
          telefone: telefone || "" // 👈 CORREÇÃO
        },
        endereco: endereco || "",
        status: "pendente",
        tempoEstimado: 30,
        formaPagamento: formaPagamento,
        statusPagamento: "pendente",
        data: new Date()
      });



      alert("Pedido realizado com sucesso! 🧾");

      limparCarrinho(); // limpa carrinho
      setNomeCliente("");
      setTelefone("");
      setEndereco("");
      setFormaPagamento("pix");

    } catch (error) {
      console.error(error);
      alert("Erro ao finalizar pedido");
    }


  }



  return (
    <View style={styles.container}>

      {/* LISTA */}
      <FlatList
        data={carrinho}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>

            <Text style={styles.nome}>{item.nome}</Text>

            <View style={styles.linha}>

              <Button title="-" onPress={() => diminuirQuantidade(item.id)} />

              <Text style={styles.qtd}>{item.quantidade}</Text>

              <Button title="+" onPress={() => aumentarQuantidade(item.id)} />

            </View>

            <Text style={styles.preco}>
              {formatarPreco(item.preco * item.quantidade)}
            </Text>

          </View>
        )}
      />

      {/* CLIENTE */}
      <View style={styles.boxCliente}>

        <Text style={styles.titulo}>Dados do Cliente</Text>

        <TextInput
          placeholder="Nome do cliente"
          value={nomeCliente}
          onChangeText={setNomeCliente}
          style={styles.input}
        />

        <TextInput
          placeholder="Telefone"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Endereço de entrega"
          value={endereco}
          onChangeText={setEndereco}
          style={styles.input}
        />

      </View>

      {/* TOTAL + BOTÃO */}
      <View style={styles.footer}>

        <Text style={styles.total}>
          Total: {formatarPreco(total)}
        </Text>

       <Text style={{ fontWeight: "bold", marginTop: 10 }}>
  Forma de pagamento:
</Text>

{formaPagamento === "pix" && (
  <View style={{ alignItems: "center", marginTop: 20 }}>

    <Text style={{ marginBottom: 10 }}>
      Escaneie o QR Code para pagar
    </Text>

    <QRCode
      value={gerarPix()}
      size={200}
    />

    <Button
  title="Já paguei"
  onPress={() => alert("Aguardando confirmação do pagamento")}
/>

  </View>
)}

<View style={{ flexDirection: "row", marginVertical: 10 }}>

  <TouchableOpacity
    style={{
      padding: 10,
      backgroundColor: formaPagamento === "pix" ? "#4CAF50" : "#ccc",
      marginRight: 5,
      borderRadius: 8
    }}
    onPress={() => setFormaPagamento("pix")}
  >
    <Text>📲 PIX</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={{
      padding: 10,
      backgroundColor: formaPagamento === "dinheiro" ? "#4CAF50" : "#ccc",
      marginRight: 5,
      borderRadius: 8
    }}
    onPress={() => setFormaPagamento("dinheiro")}
  >
    <Text>💵 Dinheiro</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={{
      padding: 10,
      backgroundColor: formaPagamento === "cartao" ? "#4CAF50" : "#ccc",
      borderRadius: 8
    }}
    onPress={() => setFormaPagamento("cartao")}
  >
    <Text>💳 Cartão</Text>
  </TouchableOpacity>

</View>
        <TouchableOpacity style={styles.botao} onPress={finalizarPedido}>
          <Text style={styles.textoBotao}>Finalizar Pedido</Text>
        </TouchableOpacity>
         <Text>
  Selecionado: {formaPagamento}
</Text>

      </View>
     

    </View>
  );
}

// const styles = StyleSheet.create({
//   input: {
//     backgroundColor: "#fff",
//     padding: 10,
//     margin: 10,
//     borderRadius: 10,
//   }
// });

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
    fontSize: 16,
    fontWeight: "bold"
  },

  linha: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5
  },

  qtd: {
    marginHorizontal: 10,
    fontSize: 16
  },

  preco: {
    marginTop: 5,
    color: "#e60023",
    fontWeight: "bold"
  },

  boxCliente: {
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    borderRadius: 10
  },

  titulo: {
    fontWeight: "bold",
    marginBottom: 5
  },

  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginTop: 5,
    borderRadius: 8
  },

  footer: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },

  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  botao: {
    backgroundColor: "#e60023",
    padding: 15,
    borderRadius: 10,
    alignItems: "center"
  },

  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});