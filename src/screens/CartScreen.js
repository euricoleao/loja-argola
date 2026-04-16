import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { addDoc, collection } from "firebase/firestore";
import { useContext, useLayoutEffect, useState } from "react";
import { Alert, FlatList, Image, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase/config";
import { formatarPreco } from "../utils/formatarPreco";





export default function CartScreen() {

  const { usuario } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === "admin";

  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const navigation = useNavigation();




  const [toast, setToast] = useState({
    visible: false,
    message: ""
  });

  const {
    carrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    removerDoCarrinho

  } = useContext(CartContext);

  // 💰 TOTAL
  const total = carrinho.reduce((soma, item) => {
    return soma + item.precoVenda * item.quantidade;
  }, 0);


  function gerarPix() {
    return `Pagamento PIX
Nome: ${nomeCliente}
Valor: R$ ${total}`;
  }

  //TOAST
  function mostrarToast(msg) {
    setToast({ visible: true, message: msg });

    setTimeout(() => {
      setToast({ visible: false, message: "" });
    }, 2000);
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

  function copiarPix() {
    const chavePix = 'gisamori@gmail.com'; // 👈 coloque sua chave real

    Clipboard.setStringAsync(chavePix);
    ToastAndroid.show('Chave copiada!', ToastAndroid.SHORT);
  }



  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            limparCarrinho(); // limpa

            mostrarToast("Carrinho limpo 🗑️", "erro"); // 🔥 toast bonito
          }}
          style={{
            marginRight: 15,
            backgroundColor: "#f8e1e7",
            padding: 8,
            borderRadius: 10
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#c48b9f" />
        </TouchableOpacity>
      )
    });
  }, []);

  if (carrinho.length === 0) {
    return (


      <LinearGradient



        colors={["#fdf2f5", "#f8d7e1", "#d4c4c8"]}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        {toast.visible && (
          <View style={[
            styles.toast,
            toast.tipo === "erro" && styles.toastErro
          ]}>
            <Text style={styles.toastText}>
              {toast.tipo === "erro" ? "🗑️ " : "✅ "}
              {toast.message}
            </Text>
          </View>
        )}
        <Text style={styles.iconeVazio}>🛍️</Text>

      <Text style={styles.tituloVazio}>
        Seu carrinho está vazio
      </Text>

      <Text style={styles.subtituloVazio}>
        Adicione produtos para continuar
      </Text>

      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.textoBotaoVoltar}>
          Ver produtos
        </Text>
      </TouchableOpacity>
        {/* <Text style={styles.iconeVazio}>🛍️</Text>

        <Text style={styles.tituloVazio}>
          Seu carrinho está vazio
        </Text>

        <Text style={styles.subtituloVazio}>
          Adicione produtos para continuar
        </Text>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.textoBotaoVoltar}>
            Ver produtos
          </Text>
        </TouchableOpacity> */}
        <View style={{ flex: 1 }}>

          {/* LISTA */}
          <FlatList
            data={carrinho}
            keyExtractor={(item) => item.id}

            renderItem={({ item }) => (
              <View style={styles.card}>



                <TouchableOpacity
                  style={styles.btnRemover}
                  onPress={() => {
                    Alert.alert(
                      "Remover item",
                      "Deseja remover este produto?",
                      [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Remover", onPress: () => removerDoCarrinho(item.id) }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#c48b9f" />
                </TouchableOpacity>

                <Image
                  source={{ uri: item.imagens?.[0] }}
                  style={styles.imagem}
                />

                <View style={{ flex: 1, marginLeft: 40 }}>
                  <Text style={styles.nome}>{item.nome}</Text>

                  <Text style={styles.preco}>
                    {formatarPreco(item.precoVenda)}
                  </Text>

                  {/* QUANTIDADE */}
                  <View style={styles.qtdContainer}>
                    <TouchableOpacity style={styles.btnQtd}
                      onPress={() => diminuirQuantidade(item.id)}
                    >
                      <Text>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.qtd}>{item.quantidade}</Text>

                    <TouchableOpacity style={styles.btnQtd}
                      onPress={() => aumentarQuantidade(item.id)}
                    >
                      <Text>+</Text>
                    </TouchableOpacity>

                  </View>
                </View>

              </View>
            )}

          />



        </View>


        {/* TOTAL + BOTÃO */}
        <View style={styles.footer}>
          <Text style={styles.total}>Total: {formatarPreco(total)}</Text>

          <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
            Forma de pagamento:
          </Text>

          {formaPagamento === 'pix' && (
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ marginBottom: 10 }}>
                Escaneie o QR Code para pagar
              </Text>

              <QRCode value={gerarPix()} size={200} />



              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: "#c48b9f",
                  padding: 10,
                  borderRadius: 8,
                  color: "#fff"
                }}
                onPress={copiarPix}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  📋 Copiar chave PIX
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', marginVertical: 10 }}>

            {/* PAGAMENTO EM PIX */}
            <TouchableOpacity
              style={[
                styles.btnPagamento,
                formaPagamento === 'pix' && styles.btnAtivo
              ]}
              onPress={() => setFormaPagamento('pix')}
            >
              <Text style={[
                styles.textoPagamento,
                formaPagamento === 'pix' && styles.textoAtivo
              ]}>
                📲 PIX
              </Text>
            </TouchableOpacity>

            {/* PAGAMENTO EM DINHEIRO */}
            <TouchableOpacity
              style={[
                styles.btnPagamento,
                formaPagamento === 'dinheiro' && styles.btnAtivo
              ]}
              onPress={() => setFormaPagamento('dinheiro')}
            >
              <Text style={[
                styles.textoPagamento,
                formaPagamento === 'dinheiro' && styles.textoAtivo
              ]}>
                📲 Dinheiro
              </Text>
            </TouchableOpacity>

            {/* PAGAMENTO EM CARTÃO */}
            <TouchableOpacity
              style={[
                styles.btnPagamento,
                formaPagamento === 'cartao' && styles.btnAtivo
              ]}
              onPress={() => setFormaPagamento('cartao')}
            >
              <Text style={[
                styles.textoPagamento,
                formaPagamento === 'cartao' && styles.textoAtivo
              ]}>
                📲 Cartão
              </Text>
            </TouchableOpacity>

            {/* BOTÃO "JÁ PAGUEI" APENAS PARA PIX */}
            <TouchableOpacity
              style={{
                marginLeft: 8,
                backgroundColor: "#a06a7d",
                padding: 10,
                borderRadius: 8,
              }}
              onPress={() => alert('Aguardando confirmação do pagamento')}
            >
              <Text>Já paguei</Text>
            </TouchableOpacity>
          </View>

          {/* BOTÃO DE FINALIZAR PEDIDO */}
          <TouchableOpacity style={styles.botao} onPress={finalizarPedido}>
            <Text style={styles.textoBotao}>Finalizar Pedido</Text>
          </TouchableOpacity>
          <Text>Selecionado: {formaPagamento}</Text>
        </View>

      </LinearGradient>

    );
  }
}




const styles = StyleSheet.create({
 



  imagemProduto: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 60,
  },

  infoProduto: {
    flex: 1,
  },


  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },



  boxCliente: {

    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  titulo: {
    fontWeight: 'bold',
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
  },

  footer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#f1d5dd",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c48b9f"
  },

  botao: {
    backgroundColor: "#c48b9f",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  },

  Button: {
    marginLeft: 10,
    backgroundColor: "#c48b9f",
    padding: 10,
    borderRadius: 8,
  },

  //estilos novos
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.95)",
    margin: 10,
    borderRadius: 15,
    padding: 10,
    elevation: 3,
  },

  imagem: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  nome: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333"
  },

  preco: {
    color: "#c48b9f",
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 10
  },

  qtdContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10
  },

  btnQtd: {
    backgroundColor: "#f8e1e7",
    padding: 6,
    borderRadius: 8,
    marginHorizontal: 5,
    width: 30,
    alignItems: "center",
    justifyContent: "center"
  },

  qtd: {
    fontWeight: "bold"
  },
  btnRemover: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffe6eb",
    padding: 6,
    borderRadius: 20,
    elevation: 3
  },
 
  btnPagamento: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8e1e7",
    borderRadius: 10,
    marginHorizontal: 4
  },

  btnAtivo: {
    backgroundColor: "#c48b9f"
  },

  textoPagamento: {
    color: "#a06a7d",
    fontWeight: "bold"
  },

  textoAtivo: {
    color: "#fff"
  },
  iconeVazio: {
    fontSize: 60,
    marginBottom: 10
  },

  tituloVazio: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#c48b9f"
  },

  subtituloVazio: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
    marginBottom: 20
  },

  botaoVoltar: {
    backgroundColor: "#c48b9f",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10
  },

  textoBotaoVoltar: {
    color: "#fff",
    fontWeight: "bold"
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
  fontSize: 14
},
  
});