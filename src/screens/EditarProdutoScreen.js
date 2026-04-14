import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, Image, StyleSheet, TextInput, View } from "react-native";
import { db } from "../firebase/config";

export default function EditarProdutoScreen({ route, navigation }) {

  const { produto } = route.params;

  const [nome, setNome] = useState(produto.nome);
  const [codigo, setCodigo] = useState(produto.codigo);
  const [precoCompra, setPrecoCompra] = useState(String(produto.precoCompra));
  const [precoVenda, setPrecoVenda] = useState(String(produto.precoVenda));
  const [quantidade, setQuantidade] = useState(String(produto.quantidade));
  const [imagem, setImagem] = useState(produto.imagem);
  const [preview, setPreview] = useState(produto.imagem);

  // 📸 escolher nova imagem
  async function escolherImagem() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0]);
      setPreview(result.assets[0].uri);
    }
  }

  // ☁️ upload imagem
  async function uploadImagem() {
    if (typeof imagem === "string") return imagem; // já é URL

    const formData = new FormData();

    formData.append("file", {
      uri: imagem.uri,
      type: "image/jpeg",
      name: "produto.jpg"
    });

    formData.append("upload_preset", "products");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dnbcqe62j/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();
    return data.secure_url;
  }



  // 💾 salvar edição
  async function salvarEdicao() {
    try {
      const compra = Number(precoCompra) || 0;
      const venda = Number(precoVenda) || 0;
      const qtd = Number(quantidade) || 0;

      const lucro = venda - compra;

      const urlImagem = await uploadImagem();

      await updateDoc(doc(db, "products", produto.id), {
        nome,
        codigo,
        precoCompra: compra,
        precoVenda: venda,
        lucro,
        quantidade: qtd,
        imagem: urlImagem
      });

      Alert.alert(
        "Sucesso",
        "Produto alterado com sucesso!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar");
    }
  }

  return (
    <View style={styles.container}>

      <TextInput value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput value={codigo} onChangeText={setCodigo} style={styles.input} />

      <TextInput
        value={precoCompra}
        onChangeText={setPrecoCompra}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        value={precoVenda}
        onChangeText={setPrecoVenda}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="numeric"
        style={styles.input}
      />

      <Button title="Trocar imagem" onPress={escolherImagem} />

      {preview && (
        <Image
          source={{ uri: preview }}
          style={{ width: 120, height: 120, marginTop: 10 }}
        />
      )}


      <Button title="Salvar alterações" onPress={salvarEdicao}



      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  }
});