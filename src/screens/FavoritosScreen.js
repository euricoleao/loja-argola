import { LinearGradient } from "expo-linear-gradient";
import { collection, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";

export default function FavoritosScreen({ navigation }) {

    const [favoritos, setFavoritos] = useState([]);
    const [produtos, setProdutos] = useState([]);

  useEffect(() => {

  let favIds = [];

  const unsubscribeFav = onSnapshot(
    collection(db, "favorites"),
    (snapshot) => {
      favIds = snapshot.docs.map(doc => doc.id);
      atualizar();
    }
  );

  const unsubscribeProd = onSnapshot(
    collection(db, "products"),
    (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      produtosRef = lista;
      atualizar();
    }
  );

  let produtosRef = [];

  function atualizar() {
    const filtrados = produtosRef.filter(item =>
      favIds.includes(item.id)
    );
    setProdutos(filtrados);
  }

  return () => {
    unsubscribeFav();
    unsubscribeProd();
  };

}, []);


    async function removerFavorito(item) {
  try {
    await deleteDoc(doc(db, "favorites", item.id));
  } catch (error) {
    console.error(error);
  }
}
    return (
        <LinearGradient
    colors={["#fdf2f5", "#f8d7e1", "#d4c4c8"]}
    style={{ flex: 1 }}
  >

       <View style={{ flex: 1, backgroundColor: "transparent" }}>

            <Text style={{ fontSize: 18, fontWeight: "bold",
                marginBottom: 10,
                fontFamily: "Playfair",
                color: "#a06a7d",
                textAlign: "center",
                marginTop: 10
             }}>
                ❤️ Meus Prediletos
            </Text>

            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("Produto", { produto: item })}
                    >

                        <Image
                            source={{
                                uri: item.imagens?.[0] || "https://via.placeholder.com/150"
                            }}
                            style={styles.imagem}
                        />
                        {/*  */}
                        <TouchableOpacity
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                backgroundColor: "#fff",
                                borderRadius: 20,
                                padding: 5
                            }}
                            onPress={(e) => {
                                e.stopPropagation(); // 👈 IMPORTANTE
                                // AQUI VOCÊ PODE CHAMAR A FUNÇÃO PARA REMOVER DOS FAVORITOS
                                removerFavorito(item);
                            }}
                        >
                            <Text style={{ fontSize: 16 }}>
                                {favoritos.includes(item.id) ? "❤️" : "🤍"}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.nome}>{item.nome}</Text>

                    </TouchableOpacity>

                )}

            />

        </View>
         </LinearGradient>
    );
}
const largura = Dimensions.get("window").width;

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        margin: 6,
        borderRadius: 12,
        width: largura / 2 - 18,
        overflow: "hidden",
        elevation: 4,
    },

    imagem: {
        width: "100%",
        height: 150,
    },

    nome: {
        padding: 8,
        fontWeight: "bold",
        fontSize: 14
    }
});