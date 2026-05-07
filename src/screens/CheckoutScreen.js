import axios from "axios";
import * as Clipboard from 'expo-clipboard';
import { addDoc, collection } from "firebase/firestore";
import { useContext, useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { CartContext } from "../context/CartContext";
import { db } from "../firebase/config";




// async function irParaPagamento(total) {
//     try {
//         const response = await axios.post(
//             "https://award-unlawful-throwing.ngrok-free.dev/criar-pagamento",
//             { total }
//         );

//         const link = response.data.link;

//         Linking.openURL(link);

//     } catch (error) {
//         console.log("Erro pagamento:", error);
//     }
// }


export default function CheckoutScreen({ navigation, route }) {
    console.log("ROUTE PARAMS:", route.params);
    const [cep, setCep] = useState("");
    const [loadingCep, setLoadingCep] = useState(false);
    const [numero, setNumero] = useState("");
    const [mostrarPix, setMostrarPix] = useState(false);
    const [complementoNumero, setComplementoNumero] = useState("");
    const { carrinho, limparCarrinho } = useContext(CartContext);

    const [codigoPix, setCodigoPix] = useState("");

    const formaInicial = route.params?.formaPagamento || "pix";


    const [formaPagamento, setFormaPagamento] = useState(formaInicial);
    console.log("FORMA NO CHECKOUT:", formaPagamento);
    const total = carrinho.reduce((soma, item) => {
        return soma + (item.precoVenda || 0) * (item.quantidade || 0);
    }, 0);

    const [qrPix, setQrPix] = useState(null);

    const [form, setForm] = useState({
        nome: "",
        sobrenome: "",
        contato: "",
        cep: "",
        endereco: "",
        rua: "",
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

    async function salvarPedido(status = "pago") {
        try {
            await addDoc(collection(db, "pedidos"), {
                cliente: form.nome + " " + form.sobrenome,
                contato: form.contato,
                endereco: form.endereco,
                numero,
                complemento: complementoNumero,
                bairro: form.bairro,
                cidade: form.cidade,
                estado: form.estado,

                produtos: carrinho.map(item => ({
                    id: item.id,
                    nome: item.nome,
                    quantidade: Number(item.quantidade) || 0,

                    precoVenda: Number(item.precoVenda) || 0,
                    precoCompra: Number(item.precoCompra) || 0,

                    totalVenda:
                        (Number(item.precoVenda) || 0) *
                        (Number(item.quantidade) || 0),

                    totalCusto:
                        (Number(item.precoCompra) || 0) *
                        (Number(item.quantidade) || 0),

                    lucro:
                        ((Number(item.precoVenda) || 0) -
                            (Number(item.precoCompra) || 0)) *
                        (Number(item.quantidade) || 0)
                })),
                total: total,
                formaPagamento: formaPagamento,
                statusPagamento: status,
                data: new Date()
            });

        } catch (error) {
            console.log(error);
        }
    }

    async function confirmarPagamento() {
        await salvarPedido("pago");

        mostrarToast("Pagamento aprovado ✅");

        limparCarrinho();

        setTimeout(() => {
            navigation.navigate("MainTabs", {
                screen: "Home"
            });
        }, 1500);
    }
    //    async function finalizar() {
    //   // 🔒 VALIDAÇÕES
    //   if (!form.nome.trim()) {
    //     mostrarToast("Digite seu nome", "erro");
    //     return;
    //   }

    //   if (!form.sobrenome.trim()) {
    //     mostrarToast("Digite seu sobrenome", "erro");
    //     return;
    //   }

    //   if (!form.contato.trim()) {
    //     mostrarToast("Digite seu contato", "erro");
    //     return;
    //   }

    //   if (!cep.trim()) {
    //     mostrarToast("Digite o CEP", "erro");
    //     return;
    //   }

    //   if (!form.endereco.trim()) {
    //     mostrarToast("Endereço inválido", "erro");
    //     return;
    //   }

    //   if (!numero.trim()) {
    //     mostrarToast("Digite o número", "erro");
    //     return;
    //   }

    //   if (!form.bairro.trim()) {
    //     mostrarToast("Digite o bairro", "erro");
    //     return;
    //   }

    //   if (!form.cidade.trim()) {
    //     mostrarToast("Digite a cidade", "erro");
    //     return;
    //   }

    //   // 🔥 AGORA SIM libera pagamento
    //   if (formaPagamento === "cartao") {
    //     await irParaPagamento(total);
    //     return;
    //   }

    //   if (formaPagamento === "pix") {
    //     await gerarPixMP(total);
    //     return;
    //   }

    //   if (formaPagamento === "dinheiro") {
    //     mostrarToast("Pedido enviado 💵");
    //     return;
    //   }
    // }
    async function finalizar() {

        if (!form.nome) {
            mostrarToast("Digite seu nome", "erro");
            return;
        }

        if (formaPagamento === "pix") {
            await gerarPixMP(total);
            return;
        }

        if (formaPagamento === "cartao") {
            mostrarToast("Processando cartão...");

            setTimeout(() => {
                confirmarPagamento();
            }, 3000);

            return;
        }

        if (formaPagamento === "dinheiro") {
            await salvarPedido("aguardando");

            mostrarToast("Pedido enviado 💵");

            limparCarrinho();

            setTimeout(() => {
                navigation.navigate("MainTabs", {
                    screen: "Home"
                });
            }, 1500);
        }
    }

    async function buscarCep(cep) {
        const cepLimpo = cep.replace(/\D/g, "");

        console.log("CEP digitado:", cepLimpo); // 👈 TESTE

        if (cepLimpo.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await res.json();
            console.log("RESPOSTA API:", data); // 👈 MUITO IMPORTANTE

            // 🔥 ESSA LINHA É A QUE FALTA
            // setComplemento(data.complemento || "");

            if (data.erro) {
                mostrarToast("CEP não encontrado ❌");
                return;
            }

            // 👇 preenche automático
            setForm((prev) => ({
                ...prev,
                endereco: `${data.logradouro}${data.complemento ? " " + data.complemento : ""}`,
                bairro: data.bairro,
                cidade: data.localidade,
                estado: data.uf,
                cep: data.cep
            }));

        } catch (error) {
            console.log(error);
            mostrarToast("Erro ao buscar CEP ❌");
        }
    }

    function formatarCep(valor) {
        return valor
            .replace(/\D/g, "")
            .replace(/(\d{5})(\d)/, "$1-$2");
    }
    function mostrarToast(msg, tipo = "sucesso") {
        setToast({ visible: true, message: msg, tipo });

        setTimeout(() => {
            setToast({ visible: false, message: "", tipo: "sucesso" });
        }, 2000);
    }



    // async function irParaPagamento(total) {
    //     try {
    //         const response = await axios.post(
    //             "https://award-unlawful-throwing.ngrok-free.dev/criar-cartao",
    //             { total }
    //         );
    //         console.log("ROUTE PARAMS:", route.params);
    //         const link = response.data.link;

    //         if (link) {
    //             Linking.openURL(link);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    // 
    async function copiarPix() {
        await Clipboard.setStringAsync(codigoPix);
        mostrarToast("PIX copiado com sucesso ✅");
    }

    async function gerarPixMP(total) {
        try {
            const response = await axios.post(
                "https://award-unlawful-throwing.ngrok-free.dev/criar-pix",
                { total }
            );
            // 🚨 VALIDAÇÃO IMPORTANTE
            if (!response.data.qr_base64) {
                mostrarToast("Erro ao gerar PIX ❌", "erro");
                return;
            }

            setQrPix(response.data.qr_base64);
            setCodigoPix(response.data.qr_code); // 👈 AQUI

            setMostrarPix(true);

        } catch (error) {
            console.log(error);
        }
    }

    if (mostrarPix) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>

                {toast.visible && (
                    <View style={[
                        styles.toast,
                        toast.tipo === "erro" && styles.toastErro
                    ]}>
                        <Text style={styles.toastText}>
                            {toast.tipo === "erro" ? "⚠️ " : "✅ "}
                            {toast.message}
                        </Text>
                    </View>
                )}


                <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                    Pagamento via PIX
                </Text>

                <Text style={{ marginBottom: 20 }}>
                    Total: R$ {total.toFixed(2)}
                </Text>

                {qrPix && (
                    <Image
                        source={{ uri: `data:image/png;base64,${qrPix}` }}
                        style={{ width: 250, height: 250 }}
                    />
                )}
                <TouchableOpacity
                    onPress={copiarPix}
                    style={{
                        marginTop: 15,
                        backgroundColor: "#c48b9f",
                        padding: 12,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        Copiar código PIX
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={confirmarPagamento}
                    style={{
                        marginTop: 15,
                        backgroundColor: "green",
                        padding: 12,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        ✅ Já paguei
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setMostrarPix(false)}
                    style={{
                        marginTop: 20,
                        backgroundColor: "#c48b9f",
                        padding: 10,
                        borderRadius: 10
                    }}
                >
                    <Text style={{ color: "#fff" }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }


    return (


        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}

                >




                    {toast.visible && (
                        <View style={[
                            styles.toast,
                            toast.tipo === "erro" && styles.toastErro
                        ]}>
                            <Text style={styles.toastText}>
                                {toast.tipo === "erro" ? "⚠️ " : "✅ "}
                                {toast.message}
                            </Text>
                        </View>
                    )}

                    {/* HEADER */}
                    <View style={styles.headerForm}>
                        <Text style={styles.tituloHeader}>Finalizar Pedido</Text>
                        <Text style={styles.subtituloHeader}>
                            Preencha seus dados para concluir sua compra
                        </Text>
                    </View>

                    {/* FORMULÁRIO */}
                    <View style={[styles.container, { padding: 20 }]}>

                        <TextInput
                            placeholder="Nome"
                            style={styles.input}
                            value={form.nome}
                            onChangeText={(v) => atualizar("nome", v)}
                        />

                        <TextInput
                            placeholder="Sobrenome"
                            style={styles.input}
                            onChangeText={(v) => atualizar("sobrenome", v)}
                        />

                        <TextInput
                            placeholder="Contato"
                            style={styles.input}
                            value={form.contato}
                            onChangeText={(text) => setForm({ ...form, contato: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="CEP"
                            keyboardType="numeric"
                            value={cep}
                            onChangeText={(text) => {
                                const cepFormatado = formatarCep(text);
                                setCep(cepFormatado);
                                buscarCep(cepFormatado); // 🔥 TEM QUE ESTAR AQUI
                            }}
                        />

                        <TextInput
                            placeholder="Endereço"
                            style={styles.input}
                            value={form.endereco} // 👈 ESSENCIAL
                            onChangeText={(v) => atualizar("endereco", v)}
                            editable={false} // 🔒 trava edição
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Número"
                            keyboardType="numeric"
                            value={numero}
                            onChangeText={setNumero}
                        />

                        <TextInput
                            placeholder="Complemento (ex: A, Fundos, Casa 2)"
                            value={complementoNumero}
                            onChangeText={setComplementoNumero}
                            style={styles.input}
                        />

                        <TextInput
                            placeholder="Bairro"
                            style={styles.input}
                            value={form.bairro}
                            onChangeText={(v) => atualizar("bairro", v)}
                        />

                        <TextInput
                            placeholder="Cidade"
                            style={styles.input}
                            value={form.cidade}
                            onChangeText={(v) => atualizar("cidade", v)}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Estado"
                            value={form.estado}
                        />


                        <TouchableOpacity style={styles.botao} onPress={finalizar}>

                            <Text style={styles.textoBotao}>Finalizar Pedido</Text>

                        </TouchableOpacity>

                        {/* {qrPix && (
                            <Image
                                source={{ uri: `data:image/png;base64,${qrPix}` }}
                                style={{ width: 200, height: 200, alignSelf: "center", marginTop: 20 }}
                            />
                        )} */}


                    </View>

                </ScrollView>

            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
        top: 100,
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
    },
    headerForm: {
        backgroundColor: "#f8e1e7",
        paddingTop: 30,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        alignItems: "center",
        marginBottom: 20,
        marginTop: 30,

        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
    },

    tituloHeader: {
        fontSize: 24,
        fontFamily: "Playfair",
        color: "#a06a7d",
        fontWeight: "bold",
    },

    subtituloHeader: {
        marginTop: 6,
        fontSize: 14,
        color: "#7d5a68",
        textAlign: "center",
    },
});