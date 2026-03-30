
import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Button, Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";

import { CartContext } from "../context/CartContext";

export default function HomeScreen({ navigation, setQuantidadeCarrinho }) {
const isAdmin = false; // depois você liga isso ao login


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

  const produtosFiltrados = produtos.filter(item =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const { adicionarAoCarrinho } = useContext(CartContext);

  return (

    <View style={{ flex: 1 }}>



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
          
//carrinho

          
          <TouchableOpacity

            style={styles.card}
            onPress={() => navigation.navigate("Produto", { produto: item })}
          >
         

            {/* 👇 LINHA COM NOME + FAVORITO */}
            <View style={{ position: "relative" }}>

              {item.imagem ? (
                <Image source={{ uri: item.imagem }} style={styles.imagem} />
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
                  {formatarPreco(item.preco)}
                </Text>

                <Text style={styles.precoPromo}>
                  {formatarPreco(item.precoPromo)}
                </Text>
              </>
            ) : (
              <Text style={styles.preco}>
                {formatarPreco(item.preco)}
              </Text>
            )}

            <Button
              title="Comprar"
              onPress={(e) => {
                e.stopPropagation(); // evita abrir o produto
                adicionarAoCarrinho(item);

                if (produtos.length === 0) {
                  return <Text>Carregando produtos...</Text>;
                }
              }}

            />


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
}
});