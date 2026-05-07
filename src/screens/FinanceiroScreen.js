import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    View
} from "react-native";
import { db } from "../firebase/config";

export default function FinanceiroScreen() {
  const [pedidos, setPedidos] = useState([]);

  const [geral, setGeral] = useState({
    vendas: 0,
    custos: 0,
    lucro: 0
  });

  const [hoje, setHoje] = useState({
    vendas: 0,
    custos: 0,
    lucro: 0
  });

  const [fechamentos, setFechamentos] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "pedidos"),
      orderBy("data", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPedidos(lista);

      let vendas = 0;
      let custos = 0;
      let lucro = 0;

      let vendasHoje = 0;
      let custosHoje = 0;
      let lucroHoje = 0;

      let porDia = {};

      const agora = new Date();

      lista.forEach(item => {
        const total = Number(item.total) || 0;
        const custo = Number(item.custo) || 0;
        const ganho = Number(item.lucro) || (total - custo);

        vendas += total;
        custos += custo;
        lucro += ganho;

        if (!item.data?.seconds) return;

        const data = new Date(item.data.seconds * 1000);

        const chave =
          data.toLocaleDateString("pt-BR");

        if (!porDia[chave]) {
          porDia[chave] = {
            data: chave,
            vendas: 0,
            custos: 0,
            lucro: 0
          };
        }

        porDia[chave].vendas += total;
        porDia[chave].custos += custo;
        porDia[chave].lucro += ganho;

        const mesmoDia =
          data.getDate() === agora.getDate() &&
          data.getMonth() === agora.getMonth() &&
          data.getFullYear() === agora.getFullYear();

        if (mesmoDia) {
          vendasHoje += total;
          custosHoje += custo;
          lucroHoje += ganho;
        }
      });

      setGeral({
        vendas,
        custos,
        lucro
      });

      setHoje({
        vendas: vendasHoje,
        custos: custosHoje,
        lucro: lucroHoje
      });

      setFechamentos(Object.values(porDia));
    });

    return () => unsubscribe();
  }, []);

  function money(v) {
    return Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💰 Financeiro</Text>

      <Text style={styles.sub}>Resumo Geral</Text>

      <View style={styles.card}>
        <Text>Total Vendido: {money(geral.vendas)}</Text>
        <Text>Custos: {money(geral.custos)}</Text>
        <Text style={styles.lucro}>
          Lucro Real: {money(geral.lucro)}
        </Text>
      </View>

      <Text style={styles.sub}>Fechamento Hoje</Text>

      <View style={styles.card}>
        <Text>Vendas Hoje: {money(hoje.vendas)}</Text>
        <Text>Custos Hoje: {money(hoje.custos)}</Text>
        <Text style={styles.lucro}>
          Lucro Hoje: {money(hoje.lucro)}
        </Text>
      </View>

      <Text style={styles.sub}>Fechamento Diário</Text>

      <FlatList
        data={fechamentos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: "bold" }}>
              📅 {item.data}
            </Text>

            <Text>Vendas: {money(item.vendas)}</Text>
            <Text>Custos: {money(item.custos)}</Text>

            <Text style={styles.lucro}>
              Lucro: {money(item.lucro)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    padding:15,
    backgroundColor:"#f8f5f2"
  },

  titulo:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:15
  },

  sub:{
    fontSize:18,
    fontWeight:"bold",
    marginTop:10,
    marginBottom:8
  },

  card:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:12,
    marginBottom:10,
    elevation:3
  },

  lucro:{
    color:"green",
    fontWeight:"bold",
    marginTop:5
  }
});