import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function PagamentosScreen({ navigation }) {
  const { usuario } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💳 Formas de Pagamento</Text>

      <Text style={styles.subtitulo}>Escolha suas formas de pagamento</Text>

      {/* PIX */}
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>⚡</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome}>PIX</Text>

          <Text style={styles.descricao}>Pagamento instantâneo</Text>
        </View>

        <Text style={styles.seta}>›</Text>
      </TouchableOpacity>

      {/* CARTÃO */}
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>💳</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome}>Cartão</Text>

          <Text style={styles.descricao}>Crédito ou débito</Text>
        </View>

        <Text style={styles.seta}>›</Text>
      </TouchableOpacity>

      {/* DINHEIRO */}
      <TouchableOpacity style={styles.card}>
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>💵</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.nome}>Dinheiro</Text>

          <Text style={styles.descricao}>Pagamento em dinheiro</Text>
        </View>

        <Text style={styles.seta}>›</Text>
      </TouchableOpacity>

      {/* PRAZO */}
      {usuario?.creditoAprovado === true && (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('PrazoPagamento')}
        >
          <View style={styles.iconeContainer}>
            <Text style={styles.icone}>📅</Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.nome}>Compra a prazo</Text>

            <Text style={styles.descricao}>
              Prazo disponível: até {usuario.prazoPagamento} dias
            </Text>
          </View>

          <Text style={styles.seta}>›</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
    padding: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#302323',
    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',

    elevation: 3,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  iconeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5e9ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icone: {
    fontSize: 24,
  },

  info: {
    flex: 1,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#302323',
    marginBottom: 4,
  },

  descricao: {
    fontSize: 13,
    color: '#777',
  },

  seta: {
    fontSize: 28,
    color: '#c48b9f',
  },
});
