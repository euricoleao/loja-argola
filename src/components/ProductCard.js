import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../theme";

export default function ProductCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>R$ {item.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    padding: 10,
    margin: 8,
    borderRadius: 10,
    width: "45%",
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  name: {
    color: COLORS.white,
    marginTop: 8,
  },
  price: {
    color: COLORS.gold,
    fontWeight: "bold",
    marginTop: 4,
  },
});