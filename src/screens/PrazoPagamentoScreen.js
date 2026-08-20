import { useContext, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';

export default function PrazoPagamentoScreen() {
  const { usuario } = useContext(AuthContext);

  const [parcelamentoSelecionado, setParcelamentoSelecionado] = useState(null);

  const prazoMaximo = Number(usuario?.prazoPagamento || 0);

  const opcoes = [
    {
      parcelas: 1,
      dias: [30],
    },
    {
      parcelas: 2,
      dias: [30, 60],
    },
    {
      parcelas: 3,
      dias: [30, 60, 90],
    },
    {
      parcelas: 4,
      dias: [30, 60, 90, 120],
    },
  ];

  // Só mostra parcelas cujo último vencimento
  // esteja dentro do prazo liberado pelo admin.
  const opcoesPermitidas = opcoes.filter((opcao) => {
    const ultimoPrazo = opcao.dias[opcao.dias.length - 1];

    return ultimoPrazo <= prazoMaximo;
  });

  function selecionarParcelamento(opcao) {
    setParcelamentoSelecionado(opcao);
  }

  function confirmarParcelamento() {
    if (!parcelamentoSelecionado) {
      Alert.alert('Atenção', 'Selecione uma forma de parcelamento.');
      return;
    }

    console.log('📅 PARCELAMENTO SELECIONADO:', parcelamentoSelecionado);
  }
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📅 Compra a prazo</Text>

      <Text style={styles.subtitulo}>Estes são seus prazos para pagamento</Text>

      <View style={styles.infoPrazo}>
        <Text style={styles.infoTexto}>Prazo liberado pelo administrador:</Text>

        <Text style={styles.prazo}>{prazoMaximo} dias</Text>
      </View>

      <Text style={styles.label}>Opções disponíveis</Text>

      {opcoesPermitidas.map((opcao) => {
        const selecionado =
          parcelamentoSelecionado?.parcelas === opcao.parcelas;

        return (
          <TouchableOpacity
            key={opcao.parcelas}
            style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
            onPress={() => selecionarParcelamento(opcao)}
          >
            <View
              style={[styles.radio, selecionado && styles.radioSelecionado]}
            >
              {selecionado && <View style={styles.radioInterno} />}
            </View>

            <View style={styles.opcaoInfo}>
              <Text style={styles.parcelas}>{opcao.parcelas}x</Text>

              <Text style={styles.dias}>{opcao.dias.join(' / ')} dias</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* <TouchableOpacity style={styles.botao} onPress={confirmarParcelamento}>
        <Text style={styles.textoBotao}>Confirmar parcelamento</Text>
      </TouchableOpacity> */}
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

  infoPrazo: {
    backgroundColor: '#f5e9ed',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },

  infoTexto: {
    fontSize: 13,
    color: '#777',
    marginBottom: 5,
  },

  prazo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a55f78',
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#302323',
    marginBottom: 10,
  },

  opcao: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },

  opcaoSelecionada: {
    borderColor: '#c48b9f',
    borderWidth: 2,
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#bbb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  radioSelecionado: {
    borderColor: '#c48b9f',
  },

  radioInterno: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#c48b9f',
  },

  opcaoInfo: {
    flex: 1,
  },

  parcelas: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#302323',
  },

  dias: {
    fontSize: 13,
    color: '#777',
    marginTop: 3,
  },

  botao: {
    backgroundColor: '#c48b9f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },

  textoBotao: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
