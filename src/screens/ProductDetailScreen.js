import { Button, Image, StyleSheet, Text, View } from "react-native";

export default function ProductDetailScreen({ route }) {

  const { produto } = route.params;

  return (

    <View style={styles.container}>

      <Image
        source={{ uri: produto.imagem }}
        style={styles.imagem}
      />

      <Text style={styles.nome}>{produto.nome}</Text>

      <Text style={styles.preco}>R$ {produto.preco}</Text>

      <Text style={styles.descricao}>
        Joia de alta qualidade ideal para presentes e ocasiões especiais.
      </Text>

      <Button
        title="Adicionar ao carrinho"
        onPress={() => alert("Produto adicionado")}
      />

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
  }

});