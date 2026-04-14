import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { db } from "../firebase/config";



export default function DashboardScreen() {

    const screenWidth = Dimensions.get("window").width;
    const [produtos, setProdutos] = useState([]);

    const dadosGrafico = {
        labels: produtos.map(item => item.nome?.slice(0, 6) || "Prod"),
        datasets: [
            {
                data: produtos.map(item => {
                    const qtd = Number(item.quantidade) || 0;
                    const c = Number(item.precoCompra) || 0;
                    const v = Number(item.precoVenda) || 0;

                    const lucro = (v - c) * qtd;

                    return isNaN(lucro) ? 0 : lucro;
                })
            }
        ]
    };

    const [totalCompra, setTotalCompra] = useState(0);
    const [totalVenda, setTotalVenda] = useState(0);
    const [totalLucro, setTotalLucro] = useState(0);
    const [totalItens, setTotalItens] = useState(0);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "products"),
            (snapshot) => {

                const lista = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setProdutos(lista);

                let compra = 0;
                let venda = 0;
                let lucro = 0;
                let totalQtd = 0;

                lista.forEach(item => {
                    const qtd = Number(item.quantidade) || 0;
                    const c = Number(item.precoCompra) || 0;
                    const v = Number(item.precoVenda) || 0;

                    const lucroUnitario = v - c;

                    compra += c * qtd;
                    venda += v * qtd;
                    lucro += lucroUnitario * qtd;
                    totalQtd += qtd;


                });

                setTotalCompra(compra);
                setTotalVenda(venda);
                setTotalLucro(lucro);
                setTotalItens(totalQtd);
            }
        );

        return () => unsubscribe();
    }, []);

    function formatar(valor) {
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });


    }

    if (produtos.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#c48b9f" />
                <Text style={styles.loadingText}>Carregando seu dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>




            <Text style={styles.titulo}>📊 Dashboard</Text>


            <LineChart

                data={dadosGrafico}
                width={screenWidth - 20}
                height={220}
                yAxisLabel="R$ "
                chartConfig={{
                    backgroundColor: "#f8f5f2",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(212, 175, 55, ${opacity})`, // dourado 💎
                    labelColor: () => "#333",
                    style: {
                        borderRadius: 16
                    }
                }}
                style={{
                    marginVertical: 10,
                    borderRadius: 16
                }}
            />

            {/* 🔹 CARDS */}
            <View style={styles.cardsContainer}>

                <View style={styles.card}>
                    <Text>Total Investido</Text>
                    <Text style={styles.valor}>{formatar(totalCompra)}</Text>
                </View>

                <View style={styles.card}>
                    <Text>Faturamento</Text>
                    <Text style={styles.valor}>{formatar(totalVenda)}</Text>
                </View>

                <View style={styles.card}>
                    <Text>Lucro</Text>
                    <Text style={[styles.valor, { color: "green" }]}>
                        {formatar(totalLucro)}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text>Produtos</Text>
                    <View style={styles.linhaInfo}>
                        <Text style={styles.valor}>📦{produtos.length} tipos</Text>
                        <Text style={styles.valor}>🔢{totalItens}  itens</Text>
                    </View>
                </View>

            </View>

            {/* 🔹 LISTA */}
            <FlatList
                data={produtos}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const qtd = Number(item.quantidade) || 0;
                    const compra = Number(item.precoCompra) || 0;
                    const venda = Number(item.precoVenda) || 0;

                    const lucroTotal = (venda - compra) * qtd;

                    return (
                        <View style={styles.linha}>
                            <Text style={{ fontWeight: "bold" }}>{item.nome}</Text>

                            <Text>Qtd: {qtd}</Text>

                            <Text>Compra Total: {formatar(compra * qtd)}</Text>

                            <Text>Venda Total: {formatar(venda * qtd)}</Text>

                            <Text style={{ color: lucroTotal > 0 ? "green" : "red" }}>
                                Lucro Total: {formatar(lucroTotal)}
                            </Text>
                        </View>
                    );
                }}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: "#f8f5f2"
    },

    titulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10
    },

    cardsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },

    card: {
        backgroundColor: "#fff",
        width: "48%",
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 3
    },

    valor: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 5
    },

    linha: {
        backgroundColor: "#fff",
        padding: 10,
        marginTop: 5,
        borderRadius: 10
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f5f2"
    },

    loadingText: {
        marginTop: 10,
        color: "#666",
        fontSize: 14
    },
    linhaInfo: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 5
},
});