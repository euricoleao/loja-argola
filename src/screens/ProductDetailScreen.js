import { LinearGradient } from "expo-linear-gradient";
import { useContext, useState } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartContext } from "../context/CartContext";
import { formatarPreco } from "../utils/formatarPreco";



export default function ProductDetailScreen({ route }) {

  const { adicionarAoCarrinho } = useContext(CartContext);
  const { produto } = route.params;
  const largura = Dimensions.get("window").width;
  const [indexAtual, setIndexAtual] = useState(0);
  

  return (

     <LinearGradient
    colors={["#fdf2f5", "#f8d7e1", "#d4c4c8"]}
    style={{ flex: 1 }}
  >
    <View style={styles.container}>

     <FlatList
  data={produto.imagens || []}
  horizontal
   pagingEnabled
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item, index) => index.toString()}
  onMomentumScrollEnd={(event) => {
  const index = Math.round(
    event.nativeEvent.contentOffset.x / largura
  );
  setIndexAtual(index);
}}

  renderItem={({ item }) => (
    <Image
      source={{ uri: item }}
      style={{
         width: largura -45, // largura da tela - padding
        height: 500,
        borderRadius: 15,
       marginRight: 7,
             }}
         resizeMode="cover"
    />
  )}
/>
<View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
  {produto.imagens?.map((_, index) => (
    <View
      key={index}
      style={{
        width: indexAtual === index ? 10 : 8,
        height: indexAtual === index ? 10 : 8,
        borderRadius: 5,
        backgroundColor: indexAtual === index ? "#c48b9f" : "#ccc",
        margin: 4
      }}
    />
  ))}
</View>

      <Text style={styles.nome}>{produto.nome}</Text>

      <Text style={styles.preco}>{formatarPreco(produto.precoVenda)}</Text>

      <Text style={styles.descricao}>
        Joia de alta qualidade ideal para presentes e ocasiões especiais.
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
         style={[styles.botao, { backgroundColor: (produto.quantidade || 0) <= 0 ? "#ccc" : "#c48b9f" }
          ]}
          disabled={(produto.quantidade || 0) <= 0}
        title="Adicionar ao Carrinho"
        onPress={() => {
          adicionarAoCarrinho(produto);
          alert("Produto adicionado ao carrinho!");
        }}

      >
        <Text style={styles.textoBotao}>Adicionar ao Carrinho</Text>
      </TouchableOpacity>

    </View>
</LinearGradient>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
   
  },

  imagem: {
    width: "100%",
    height: 300,
    borderRadius: 10
  },

  nome: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15
  },

  preco: {
    fontSize: 20,
    color: "green",
    marginVertical: 10
  },

  descricao: {
    fontSize: 16,
    marginBottom: 20
  },
  botaoAdicionar: {
    backgroundColor: "#a76a6a",
    padding: 15,
    borderRadius: 8,
    alignItems: "center"
  },
  botao: {
  backgroundColor: "#c48b9f", // rosa elegante
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  marginTop: 10,
},

textoBotao: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},


});