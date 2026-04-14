
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Button, Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";

import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

export default function HomeScreen({ navigation, setQuantidadeCarrinho }) {
  const { usuario } = useContext(AuthContext) || {};
  const isAdmin = usuario?.tipo === "admin";

  const [produtos, setProdutos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [busca, setBusca] = useState("");


  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProdutos(lista);
      }
    );

    return () => unsubscribe();
  }, []);


  // ❤️ 2. useEffect FAVORITOS (AQUI 👇)
  useEffect(() => {
    async function carregarFavoritos() {
      const snapshot = await getDocs(collection(db, "favorites"));
      const lista = snapshot.docs.map(doc => doc.id);
      setFavoritos(lista);
    }

    carregarFavoritos();
  }, []);


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
        // remover
        await deleteDoc(doc(db, "favorites", item.id));
        setFavoritos(prev => prev.filter(id => id !== item.id));
      } else {
        // adicionar
        await setDoc(doc(db, "favorites", item.id), {
          produtoId: item.id,
          nome: item.nome,
          imagem: item.imagem
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

  return (

    <View style={{ flex: 1, backgroundColor: "#f3ebe8" }}>



      <TextInput

        placeholder="Buscar produto..."
        value={busca}
        onChangeText={setBusca}
        style={styles.input}
      />

      <FlatList
        data={produtosFiltrados}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}

        contentContainerStyle={{ // 👈 AQUI
          paddingBottom: 20
        }}

        renderItem={({ item }) => (

         console.log(item.imagens),
         <TouchableOpacity

            style={styles.card}
            onPress={() => navigation.navigate("Produto", { produto: item })}
          >


            {/* 👇 LINHA COM NOME + FAVORITO */}
            <View style={{ position: "relative" }}>

              {item.imagens?.[0] ? (
                <Image
                  source={{
                    uri: item.imagens?.[0] || "https://via.placeholder.com/150"
                  }}
                  style={styles.imagem}
                />
                
              ) : (
                <Text>Sem imagem</Text>
                
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



            <TouchableOpacity style={[styles.botaoComprar, { backgroundColor: (item.quantidade || 0) <= 0 ? "#ccc" : "#e7a299" }  
            
          ]}
              disabled={(item.quantidade || 0) <= 0}


              onPress={(e) => {
                e.stopPropagation(); // evita abrir o produto
                adicionarAoCarrinho(item);

                if ((item.quantidade || 0) <= 0) {
                  alert("Sem estoque ❌");
                  return;
                }

                adicionarAoCarrinho(item);
                baixarEstoque(item);

                if (produtos.length === 0) {
                  return <Text>Carregando produtos...</Text>;
                }
              }}

            ><Text style={styles.textoBotao}>COMPRAR</Text></TouchableOpacity>

            {isAdmin && (
              <Button
                title="Excluir"
                color="red"
                onPress={() => excluirProduto(item.id)}
              />
            )}
          </TouchableOpacity>
        )}


      />

    </View>

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

  card: {
    backgroundColor: "#fff",
    margin: 6,
    borderRadius: 12,
    width: largura / 2 - 18,
    overflow: "hidden", // 👈 ESSENCIAL
    elevation: 4, // Android sombra
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
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 5
  },

  input: {
    backgroundColor: "#fff",
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
  
});