import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/config";
import { formatarPreco } from "../utils/formatarPreco";




export default function EstoqueScreen({ navigation }) {

    const [nome, setNome] = useState("");
    const [precoCompra, setPrecoCompra] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [produtos, setProdutos] = useState([]);
    const [quantidade, setQuantidade] = useState("");

 

async function adicionarProduto() {
  try {
    const compra = Number(precoCompra) || 0;
    const venda = Number(precoVenda) || 0;
    const qtd = Number(quantidade) || 0;

    const lucro = venda - compra;

    const nomeFormatado = nome.toLowerCase();

    // 🔎 verifica se já existe
    const q = query(
      collection(db, "products"),
      where("nome", "==", nomeFormatado)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // 👉 SOMAR quantidade
      const docRef = snapshot.docs[0];
      const dados = docRef.data();

      const novaQtd = (dados.quantidade || 0) + qtd;

      await updateDoc(doc(db, "products", docRef.id), {
        quantidade: novaQtd
      });

      alert("Estoque atualizado 📦");

    } else {
      // 👉 NOVO PRODUTO
      await addDoc(collection(db, "products"), {
        nome: nomeFormatado,
        precoCompra: compra,
        precoVenda: venda,
        lucro,
        quantidade: qtd,
        criadoEm: new Date()
      });

      alert("Produto criado 💎");
    }

    // limpar campos
    setNome("");
    setPrecoCompra("");
    setPrecoVenda("");
    setQuantidade("");

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar");
  }
}

    async function excluirProduto(id) {
        try {
            await deleteDoc(doc(db, "estoque", id));
            alert("Produto excluído! 🗑️");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir");
        }
    }

    function confirmarExclusao(id) {
        Alert.alert(
            "Excluir produto",
            "Tem certeza que deseja excluir?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () => excluirProduto(id)
                }
            ]
        );
    }

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "estoque"),
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



    return (
        <View style={styles.container}>

            <Text style={styles.titulo}>Controle de Estoque</Text>

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

            <Button title="Adicionar" onPress={adicionarProduto} />

            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.linha}>
                        <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>
                        <Text>Qtd: {item.quantidade}</Text>
                        <Text>Compra: {formatarPreco(item.precoCompra)}</Text>
                        <Text>Venda Parcial: {formatarPreco(item.precoVenda)}</Text>
                        <Text>Lucro Parcial: {formatarPreco(item.lucro)}</Text>
                        <Text>Custo Total: {formatarPreco(item.custoTotal)}</Text>
                        <Text>Lucro Total: {formatarPreco(item.lucroTotal)}</Text>

                        <TouchableOpacity
                            style={styles.botaoEditar}
                            onPress={() => navigation.navigate("EditarProduto", { produto: item })}
                        >
                            <Text style={{ color: "#fff" }}>✏️ Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.botaoExcluir}
                            onPress={() => confirmarExclusao(item.id)}
                        >
                            <Text style={{ color: "#fff" }}>🗑️ Excluir</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15
    },
    titulo: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10
    },
    input: {
        backgroundColor: "#fff",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8
    },
    linha: {
        backgroundColor: "#fff",
        padding: 10,
        marginTop: 5,
        borderRadius: 10
    },
    botaoEditar: {
        marginTop: 5,
        backgroundColor: "#c48b9f",
        padding: 8,
        borderRadius: 8,
        alignItems: "center"
    },
    botaoExcluir: {
  marginTop: 5,
  backgroundColor: "#e60023",
  padding: 8,
  borderRadius: 8,
  alignItems: "center"
}

});