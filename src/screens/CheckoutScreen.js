import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";



export default function CheckoutScreen({ navigation }) {

    const [cep, setCep] = useState("");
    const [loadingCep, setLoadingCep] = useState(false);
    const [endereco, setEndereco] = useState("");

    const [form, setForm] = useState({
        nome: "",
        sobrenome: "",
        cep: "",
        endereco: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "Bahia"
    });

    const [toast, setToast] = useState({
        visible: false,
        message: "",
        tipo: "sucesso" // 👈 ADICIONE ISSO
    });

    function atualizar(campo, valor) {
        setForm({ ...form, [campo]: valor });
    }

    function finalizar() {
        if (!form.nome || !form.endereco) {
            alert("Preencha os dados obrigatórios");
            return;
        }

        alert("Pedido enviado com sucesso 🧾");
        navigation.goBack();
    }



    async function buscarCep(valor) {
        const cepLimpo = valor.replace(/\D/g, ""); // remove tudo que não é número
        setCep(valor);

        if (cepLimpo.length !== 8) return;

        try {
            setLoadingCep(true);

            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();

            if (data.erro) {
                mostrarToast("CEP não encontrado ❌", "erro");
                return;
            }

            setEndereco(
                `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`
            );

            mostrarToast("Endereço preenchido ✨");

        } catch (error) {
            console.log(error);
            mostrarToast("Erro ao buscar CEP", "erro");
        } finally {
            setLoadingCep(false);
        }
    }

    function mostrarToast(msg, tipo = "sucesso") {
        setToast({ visible: true, message: msg, tipo });

        setTimeout(() => {
            setToast({ visible: false, message: "", tipo: "sucesso" });
        }, 2000);
    }


    return (
        <ScrollView style={styles.container}>

            <Text style={styles.titulo}>Endereço de entrega</Text>

            <TextInput
                placeholder="Nome"
                style={styles.input}
                onChangeText={(v) => atualizar("nome", v)}
            />

            <TextInput
                placeholder="Sobrenome"
                style={styles.input}
                onChangeText={(v) => atualizar("sobrenome", v)}
            />

            <TextInput
                placeholder="Digite o CEP"
                keyboardType="numeric"
                maxLength={8}
                value={cep}
            onChangeText={(text) => {
  setCep(text);

  const cepLimpo = text.replace(/\D/g, "");
  if (cepLimpo.length === 8) {
    buscarCep(cepLimpo);
  }
}}
                style={styles.input}
            />

            <TextInput
                placeholder="Endereço"
                style={styles.input}
                onChangeText={(v) => atualizar("endereco", v)}
            />

            <TextInput
                placeholder="Número"
                style={styles.input}
                onChangeText={(v) => atualizar("numero", v)}
            />

            <TextInput
                placeholder="Bairro"
                style={styles.input}
                onChangeText={(v) => atualizar("bairro", v)}
            />

            <TextInput
                placeholder="Cidade"
                style={styles.input}
                onChangeText={(v) => atualizar("cidade", v)}
            />

            <TouchableOpacity style={styles.botao} onPress={finalizar}>
                <Text style={styles.textoBotao}>Finalizar Pedido</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fdf2f5",
        padding: 15
    },

    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#c48b9f",
        marginBottom: 15
    },

    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee"
    },

    botao: {
        backgroundColor: "#c48b9f",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 20
    },

    textoBotao: {
        color: "#fff",
        fontWeight: "bold"
    },
    toast: {
        position: "absolute",
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: "#c48b9f",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        zIndex: 999,
        elevation: 10,
    },

    toastErro: {
        backgroundColor: "#a06a7d"
    },

    toastText: {
        color: "#fff",
        fontWeight: "bold",
    }
});