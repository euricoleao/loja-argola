import * as ImagePicker from "expo-image-picker";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import { Button, Image, Text, TextInput, TouchableOpacity, View } from "react-native";



import { db } from "../firebase/config";

export default function FormProdutoScreen() {
    const [imagem, setImagem] = useState(null);
    const [preview, setPreview] = useState(null);
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [loading, setLoading] = useState(false);
    const [precoPromo, setPrecoPromo] = useState("");

    // 📸 escolher imagem
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
        console.log("RESPOSTA CLOUDINARY:", data); // 👈 AQUI

        return data.secure_url;
    }

    async function cadastrarProduto() {
        try {
            let urlImagem = "";

            if (imagem) {
                urlImagem = await uploadImagem();
            }

            await addDoc(collection(db, "products"), {
                nome,
                preco: Number(preco),
                precoPromo: precoPromo ? Number(precoPromo) : null, // 👈 AQUI
                quantidade: Number(quantidade),
                imagem: urlImagem || "",
                criadoEm: new Date()
            });

            // ✅ LIMPAR CAMPOS
            setNome("");
            setPreco("");
            setQuantidade("");
            setImagem(null);
            setPreview(null);

            alert("Produto cadastrado com sucesso!");

        } catch (error) {
            console.error(error);
            alert("Erro ao cadastrar");
        }
    }
    return (
        <View style={{ padding: 20 }}>
            <Text>Cadastro de Produto</Text>

            <TextInput
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
            />

            <TextInput
                placeholder="Preço"
                value={preco}
                onChangeText={setPreco}
                keyboardType="numeric"
            />

            <TextInput
                placeholder="Quantidade"
                value={quantidade}
                onChangeText={setQuantidade}
                keyboardType="numeric"
            />

            <TextInput
                placeholder="Preço promocional (opcional)"
                value={precoPromo}
                onChangeText={setPrecoPromo}
                keyboardType="numeric"
            />
            <TouchableOpacity onPress={escolherImagem}>
                <Text>Selecionar Imagem</Text>
            </TouchableOpacity>

            {preview && (
                <Image
                    source={{ uri: preview }}
                    style={{ width: 100, height: 100 }}
                />
            )}

            <Button
                title={loading ? "Salvando..." : "Cadastrar"}
                onPress={cadastrarProduto}
                disabled={loading}
            />
        </View>
    );
}