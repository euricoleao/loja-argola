import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Alert, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";


import { db } from "../firebase/config";

export default function FormProdutoScreen() {
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nome, setNome] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [loading, setLoading] = useState(false);


    const [lucro, setLucro] = useState("");
    const [codigo, setCodigo] = useState("");
    const [precoCompra, setPrecoCompra] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [precoPromo, setPrecoPromo] = useState("");
    const [imagens, setImagens] = useState([]);

    function gerarCodigo(nome) {
        const prefixo = nome.substring(0, 2).toUpperCase();
        const numero = Date.now().toString().slice(-4);

        return prefixo + numero;
    }

    // 📸 escolher imagem
    function adicionarImagem(novaImagem) {
        setImagens(prev => {
            if (prev.length >= 4) {
                Alert.alert("Limite", "Máximo de 4 imagens");
                return prev;
            }

            return [...prev, novaImagem];
        });
    }

    async function escolherImagem() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            adicionarImagem(result.assets[0]); // 👈 AQUI
        }
    }




    // ☁️ upload imagem
    async function uploadImagens() {
        const urls = [];

        for (let img of imagens) {
            const formData = new FormData();

            formData.append("file", {
                uri: img.uri,
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
            urls.push(data.secure_url);
        }

        return urls;
    }


   async function cadastrarProduto() {
    try {
        const compra = Number(precoCompra) || 0;
        const venda = Number(precoVenda) || 0;
        const qtd = Number(quantidade) || 0;

        const lucro = venda - compra;

        if (imagens.length === 0) {
            Alert.alert("Atenção", "Adicione pelo menos 1 imagem 📸");
            return;
        }

        const imagensUrls = await uploadImagens();

        await addDoc(collection(db, "products"), {
            nome,
            codigo,
            precoCompra: compra,
            precoVenda: venda,
            lucro,
            quantidade: qtd,
            imagens: imagensUrls,
            criadoEm: new Date()
        });

        Alert.alert("Sucesso", "Produto cadastrado 💎");

        // limpar campos
        setNome("");
        setPrecoCompra("");
        setPrecoVenda("");
        setQuantidade("");
        setPrecoPromo("");
        setCodigo("");
        setImagens([]); // 👈 CORRETO

    } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Erro ao cadastrar");
    }
}
    return (
        <View style={{ padding: 20 }}>
            <Text>Cadastro de Produto</Text>

            <TextInput
                placeholder="Nome do produto"
                value={nome}
                onChangeText={setNome}
                style={styles.input}
            />

            <TextInput
                placeholder="Preço de compra"
                value={precoCompra}
                onChangeText={setPrecoCompra}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                placeholder="Preço de venda"
                value={precoVenda}
                onChangeText={setPrecoVenda}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                placeholder="Quantidade"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
                style={styles.input}
            />

            <TextInput
                style={styles.input}
                placeholder="Preço promocional (opcional)"
                value={precoPromo}
                onChangeText={setPrecoPromo}
                keyboardType="numeric"
            />

            <TextInput
                placeholder="Código do produto (ex: BR001)"
                value={codigo}
                onChangeText={setCodigo}
                style={styles.input}
            />


            <TouchableOpacity
                onPress={escolherImagem}>

                <Text style={styles.textoBotao}>Selecionar Imagem</Text>
            </TouchableOpacity>

            <FlatList
                data={imagens}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
                renderItem={({ item }) => (
                    <Image
                        source={{ uri: item.uri }}
                        style={{
                            width: 80,
                            height: 80,
                            marginRight: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#ddd"
                        }}
                    />
                )}
            />

         

            <Button
                style={styles.botaoSalvar}
                title={loading ? "Salvando..." : "Cadastrar"}
                onPress={cadastrarProduto}
                disabled={loading}
            />


        </View>
    );
}
// criar stylos
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#f8f5f2"
    },
    input: {
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8
    },
    botaoEditar: {
        backgroundColor: "blue",
        padding: 8,
        borderRadius: 8,
        marginTop: 10
    },
    botaoExcluir: {
        backgroundColor: "red",
        padding: 8,
        borderRadius: 8,
        marginTop: 10
    },
    linha: {
        backgroundColor: "#fff",
        padding: 10,
        marginTop: 5,
        borderRadius: 10
    },
    botaoSalvar: {
        backgroundColor: "#c48b9f",
        padding: 10,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
    },
    textoBotao: {
        color: "#302323",
        textAlign: "center",
        fontWeight: "bold",
        marginBottom: 10,
        backgroundColor: "#c48b9f",
        padding: 10,
        borderRadius: 8,
    }
});