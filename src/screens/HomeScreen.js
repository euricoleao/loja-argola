
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { ActivityIndicator, Button, Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";


export default function HomeScreen({ navigation, setQuantidadeCarrinho }) {
  const { usuario } = useContext(AuthContext) || {};
  const isAdmin = usuario?.tipo === "admin";

  const [produtos, setProdutos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    tipo: "success" // "success" ou "error"
  });



  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProdutos(lista);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  // ❤️ 2. useEffect FAVORITOS (AQUI 👇)
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "favorites"),
      (snapshot) => {
        const lista = snapshot.docs.map(doc => doc.id);
        setFavoritos(lista);
      }
    );

    return () => unsubscribe();
  }, []);

  function mostrarToast(msg, tipo = "sucesso") {
    setToast({ visible: true, message: msg, tipo });

    setTimeout(() => {
      setToast({ visible: false, message: "", tipo: "sucesso" });
    }, 2000);
  }
  // 🗑️ EXCLUIR PRODUTO (AQUI 👇)
  async function excluirProduto(id) {
    try {
      await deleteDoc(doc(db, "products", id));
      alert("Produto excluído!");

      // 🔄 Atualiza lista
      setProdutos(prev => prev.filter(item => item.id !== id));

    } catch (error) {
      console.error(error);
      alert("Erro ao excluir");
    }
  }

  async function toggleFavorito(item) {
    const jaExiste = favoritos.includes(item.id);

    try {
      if (jaExiste) {
        await deleteDoc(doc(db, "favorites", item.id));
        setFavoritos(prev => prev.filter(id => id !== item.id));
      } else {
        await setDoc(doc(db, "favorites", item.id), {
          produtoId: item.id
        });
        setFavoritos(prev => [...prev, item.id]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function formatarPreco(valor) {
    if (!valor) return "R$ 0,00";

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  async function baixarEstoque(produto) {
    try {
      const novaQtd = (produto.quantidade || 0) - 1;

      await updateDoc(doc(db, "products", produto.id), {
        quantidade: novaQtd
      });

    } catch (error) {
      console.error(error);
    }
  }


  const produtosFiltrados = produtos.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const { adicionarAoCarrinho } = useContext(CartContext);

  if (loading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
      }}>
        <ActivityIndicator size="large" color="#c48b9f" />

        <Text style={{
          marginTop: 10,
          color: "#777",
          fontSize: 14
        }}>
          Carregando sua vitrine 💎
        </Text>
      </View>
    );
  }

  return (



    <LinearGradient
      colors={["#fdf2f5", "#f8d7e1", "#d4c4c8"]}
      style={{ flex: 1 }}
    >


      <View style={{ flex: 1 }}>

        {/* 🔥 TOAST */}
        {toast.visible && (
          <View
            style={[
              styles.toast,
              toast.tipo === "erro" && styles.toastErro
            ]}
          >
            <Text style={styles.toastText}>
              {toast.tipo === "erro" ? "⚠️ " : "✅ "}
              {toast.message}
            </Text>
          </View>
        )}

        <View style={styles.containerBusca}>

          <Ionicons name="search" size={18} color="#999" style={{ marginLeft: 10 }} />



          <TextInput
            placeholder="Buscar produto..."
            value={busca}
            onChangeText={setBusca}
            style={styles.inputBusca}
            placeholderTextColor="#999"
          />

        </View>
        {toast.visible && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        )}



        <FlatList
          style={{ backgroundColor: "transparent" }}
          data={produtosFiltrados}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}

          contentContainerStyle={{ // 👈 AQUI
            paddingBottom: 20
          }}

          renderItem={({ item }) => (

            console.log(item.imagens),
            <Animated.View entering={FadeInDown.duration(400)}>

              <TouchableOpacity
                style={[
                  styles.card,
                  (item.quantidade || 0) <= 0 && { opacity: 0.6 }
                ]}
                disabled={(item.quantidade || 0) <= 0}
                onPress={() =>
                  navigation.navigate("Produto", { produto: item })
                }
              >


                {/* 👇 LINHA COM NOME + FAVORITO */}
                <View style={{ position: "relative" }}>

                  {item.imagens?.[0] ? (
                    <Image
                      source={{ uri: item.imagens?.[0] }}
                      style={[
                        styles.imagem,
                        (item.quantidade || 0) <= 0 && { opacity: 0.4 }
                      ]}
                    />
                  ) : (
                    <Text>Sem imagem</Text>
                  )}

                  {/* 🔥 SEM ESTOQUE */}
                  {(item.quantidade || 0) <= 0 && (
                    <View style={styles.semEstoque}>
                      <Text style={styles.textoSemEstoque}>
                        SEM ESTOQUE
                      </Text>
                    </View>
                  )}

                  {/* ❤️ FAVORITO SOBRE A IMAGEM */}
                  <TouchableOpacity
                    style={styles.favorito}
                    onPress={() => toggleFavorito(item)}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {favoritos.includes(item.id) ? "❤️" : "🤍"}
                    </Text>
                  </TouchableOpacity>

                </View>


                <Text style={styles.nome}>{item.nome}</Text>
                {item.precoPromo ? (
                  <>
                    <Text style={styles.precoAntigo}>
                      {formatarPreco(item.precoVenda)}
                    </Text>

                    <Text style={styles.precoPromo}>
                      {formatarPreco(item.precoPromo)}
                    </Text>


                  </>

                ) : (

                  <View style={{ position: "relative" }}>

                    <Text style={styles.precoVenda}>
                      {formatarPreco(item.precoVenda)}
                    </Text>

                    <Text style={styles.qtd}>
                      Qt: {item.quantidade || 0}

                    </Text>
                    {isAdmin && (
                      <Text>Cód: {item.codigo}</Text>
                    )}

                  </View>
                )}

                {/* Botão Comprar */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.botaoComprar, { backgroundColor: (item.quantidade || 0) <= 0 ? "#ccc" : "#e7a299" }

                  ]}
                  disabled={(item.quantidade || 0) <= 0}


                  onPress={(e) => {
                    e.stopPropagation(); // evita abrir o produto


                    if ((item.quantidade || 0) <= 0) {
                      mostrarToast("Sem estoque ❌", "erro");
                      return;
                    }

                    adicionarAoCarrinho(item);
                    baixarEstoque(item);

                    mostrarToast(`${item.nome} adicionado 🛍️`);

                    if (produtos.length === 0) {
                      return <Text>Carregando produtos...</Text>;
                    }
                  }}

                ><Text style={styles.textoBotao}>COMPRAR</Text></TouchableOpacity>

                {/*Fim do  Botão Comprar */}


                {isAdmin && (
                  <Button
                    title="Excluir"
                    color="red"
                    onPress={() => excluirProduto(item.id)}
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}


        />

      </View>
    </LinearGradient>
  );
}
const largura = Dimensions.get("window").width;
const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    marginTop: 40,

  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  // card: {
  //   backgroundColor:  "rgba(255,255,255,0.85)",
  //   margin: 6,
  //   borderRadius: 12,
  //   width: largura / 2 - 18,
  //   overflow: "hidden", // 👈 ESSENCIAL
  //   elevation: 4, // Android sombra
  // },

  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    margin: 8,
    borderRadius: 16,
    width: largura / 2 - 20,
    overflow: "hidden",

    elevation: 6,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imagem: {
    width: "100%",
    height: 150, // 👈 MUITO IMPORTANTE
    borderRadius: 10,
  },


  nome: {
    fontSize: 14,
    marginTop: 5
  },

  preco: {
    fontWeight: "bold",
    color: "#161515", // estilo loja
    fontSize: 16
  },

  favorito: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 6,
    borderRadius: 20,
    elevation: 5
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    marginHorizontal: 10, // 👈 espaço lateral
    marginTop: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  precoAntigo: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 12
  },

  precoPromo: {
    color: "#e60023",
    fontWeight: "bold",
    fontSize: 16
  },
  botaoComprar: {
    backgroundColor: "#e7a299", // dourado
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: "center"
  },

  textoBotao: {
    color: "#a78834",
    fontWeight: "bold"
  },
  qtd: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#c48b9f",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10
  },
  containerBusca: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 30,
    paddingHorizontal: 10,
    elevation: 3, // sombra Android
    borderWidth: 1,
    borderColor: "#f1d5dd"
  },

  inputBusca: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: "#333"
  },
  toast: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#c48b9f",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    zIndex: 999,
    elevation: 10,
  },

  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  semEstoque: {
  position: "absolute",
  top: 10,
  left: 10,
  backgroundColor: "rgba(231, 76, 60, 0.9)",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8
},

textoSemEstoque: {
  color: "#fff",
  fontSize: 10,
  fontWeight: "bold"
},

});