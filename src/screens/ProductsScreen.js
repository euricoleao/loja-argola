import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const produtos = [
  {
    id: "1",
    nome: "Anel de Ouro",
    preco: "R$ 899,00",
    imagem: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "2",
    nome: "Colar Diamante",
    preco: "R$ 1.299,00",
    imagem: "https://i.imgur.com/jVfoZnP.jpg",
  },
  {
    id: "3",
    nome: "Brinco Luxo",
    preco: "R$ 599,00",
    imagem: "https://i.imgur.com/0y8Ftya.jpg",
  },
  {
    id: "4",
    nome: "Pulseira Ouro",
    preco: "R$ 750,00",
    imagem: "https://i.imgur.com/2nCt3Sbl.jpg",
  },

   {
    id: "1",
    nome: "Anel de Ouro",
    preco: "R$ 899,00",
    imagem: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "2",
    nome: "Colar Diamante",
    preco: "R$ 1.299,00",
    imagem: "https://i.imgur.com/jVfoZnP.jpg",
  },
  {
    id: "3",
    nome: "Brinco Luxo",
    preco: "R$ 599,00",
    imagem: "https://i.imgur.com/0y8Ftya.jpg",
  },
  {
    id: "4",
    nome: "Pulseira Ouro",
    preco: "R$ 750,00",
    imagem: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
   {
    id: "1",
    nome: "Anel de Ouro",
    preco: "R$ 899,00",
    imagem: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "2",
    nome: "Colar Diamante",
    preco: "R$ 1.299,00",
    imagem: "https://i.imgur.com/jVfoZnP.jpg",
  },
  {
    id: "3",
    nome: "Brinco Luxo",
    preco: "R$ 599,00",
    imagem: "https://i.imgur.com/0y8Ftya.jpg",
  },
  {
    id: "4",
    nome: "Pulseira Ouro",
    preco: "R$ 750,00",
    imagem: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
   {
    id: "1",
    nome: "Anel de Ouro",
    preco: "R$ 899,00",
    imagem: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "2",
    nome: "Colar Diamante",
    preco: "R$ 1.299,00",
    imagem: "https://i.imgur.com/jVfoZnP.jpg",
  },
  {
    id: "3",
    nome: "Brinco Luxo",
    preco: "R$ 599,00",
    imagem: "https://i.imgur.com/0y8Ftya.jpg",
  },
  {
    id: "4",
    nome: "Pulseira Ouro",
    preco: "R$ 750,00",
    imagem: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
   {
    id: "1",
    nome: "Anel de Ouro",
    preco: "R$ 899,00",
    imagem: "https://i.imgur.com/8Km9tLL.jpg",
  },
  {
    id: "2",
    nome: "Colar Diamante",
    preco: "R$ 1.299,00",
    imagem: "https://i.imgur.com/jVfoZnP.jpg",
  },
  {
    id: "3",
    nome: "Brinco Luxo",
    preco: "R$ 599,00",
    imagem: "https://i.imgur.com/0y8Ftya.jpg",
  },
  {
    id: "4",
    nome: "Pulseira Ouro",
    preco: "R$ 750,00",
    imagem: "https://i.imgur.com/2nCt3Sbl.jpg",
  },
];

export default function ProdutosScreen() {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.image} />
      <Text style={styles.nome}>{item.nome}</Text>
      <Text style={styles.preco}>{item.preco}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={produtos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },

  image: {
    width: 140,
    height: 140,
    borderRadius: 10,
  },

  nome: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
  },

  preco: {
    marginTop: 5,
    fontSize: 15,
    color: "green",
  },
});