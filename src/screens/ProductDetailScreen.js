import { useContext } from "react";
import { Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartContext } from "../context/CartContext";
import { formatarPreco } from "../utils/formatarPreco";


export default function ProductDetailScreen({ route }) {

  const { adicionarAoCarrinho } = useContext(CartContext);
  const { produto } = route.params;
  const largura = Dimensions.get("window").width;

  return (

    <View style={styles.container}>

     <FlatList
  data={produto.imagens || []}
  horizontal
   pagingEnabled
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <Image
      source={{ uri: item }}
      style={{
         width: largura - 50, // largura da tela - padding
        height: 500,
        borderRadius: 15,
        marginRight: 10
      }}
         resizeMode="cover"
    />
  )}
/>
{/* <FlatList
  data={produto.imagens || []}
  horizontal
  showsHorizontalScrollIndicator={false}
  keyExtractor={(item, index) => index.toString()}

  pagingEnabled // 👈 desliza por página (SUAVE)

  decelerationRate="fast" // 👈 deixa mais fluido

  snapToAlignment="center"
  snapToInterval={260} // largura da imagem + margem

  renderItem={({ item }) => (
    <Image
      source={{ uri: item }}
      style={styles.imagem}
    />
  )}
/> */}

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

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
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