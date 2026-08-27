import { Ionicons } from '@expo/vector-icons';

import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CertificadoGarantiaScreen({ route }) {
  const { nomeCliente, nomeProduto, codigoProduto, numeroPedido, dataCompra } =
    route.params;

  // =========================================================
  // FORMATA DATA
  // =========================================================

  function converterData(data) {
    if (!data) return null;

    if (data?.toDate) {
      return data.toDate();
    }

    const dataConvertida = new Date(data);

    if (isNaN(dataConvertida.getTime())) {
      return null;
    }

    return dataConvertida;
  }

  function formatarData(data) {
    const dataConvertida = converterData(data);

    if (!dataConvertida) {
      return 'Não informada';
    }

    return dataConvertida.toLocaleDateString('pt-BR');
  }

  // =========================================================
  // CALCULA VALIDADE DA GARANTIA
  // =========================================================

  function calcularValidade(data) {
    const dataConvertida = converterData(data);

    if (!dataConvertida) {
      return 'Não informada';
    }

    const validade = new Date(dataConvertida);

    // Garantia de 6 meses
    validade.setMonth(validade.getMonth() + 6);

    return validade.toLocaleDateString('pt-BR');
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* =====================================================
          CERTIFICADO
      ====================================================== */}

      <View style={styles.certificado}>
        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View style={styles.iconeContainer}>
            <Ionicons name="shield-checkmark" size={42} color="#D4AF37" />
          </View>

          <Text style={styles.titulo}>CERTIFICADO DE GARANTIA</Text>

          <Text style={styles.subtitulo}>G-JOYA</Text>

          <View style={styles.linhaDourada} />

          <Text style={styles.textoHeader}>
            Certificamos a autenticidade e a garantia do produto adquirido em
            nossa loja.
          </Text>
        </View>

        {/* =================================================
            DADOS DO CLIENTE
        ================================================== */}

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>👤 Dados do Cliente</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Nome do cliente</Text>

            <Text style={styles.valor}>{nomeCliente || 'Não informado'}</Text>
          </View>
        </View>

        {/* =================================================
            DADOS DO PRODUTO
        ================================================== */}

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>💎 Dados do Produto</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Produto</Text>

            <Text style={styles.valor}>{nomeProduto || 'Não informado'}</Text>

            <Text style={[styles.label, styles.labelEspaco]}>
              Código do produto
            </Text>

            <Text style={styles.valor}>{codigoProduto || 'Não informado'}</Text>
          </View>
        </View>

        {/* =================================================
            DADOS DA COMPRA
        ================================================== */}

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>🧾 Dados da Compra</Text>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Número do pedido</Text>

            <Text style={styles.valor}>#{numeroPedido || 'Não informado'}</Text>

            <Text style={[styles.label, styles.labelEspaco]}>
              Data da compra
            </Text>

            <Text style={styles.valor}>{formatarData(dataCompra)}</Text>

            <Text style={[styles.label, styles.labelEspaco]}>
              Validade da garantia
            </Text>

            <Text style={styles.valorGarantia}>
              {calcularValidade(dataCompra)}
            </Text>
          </View>
        </View>

        {/* =================================================
            GARANTIA
        ================================================== */}

        <View style={styles.garantiaBox}>
          <Ionicons name="shield-checkmark" size={30} color="#8E3B56" />

          <View style={styles.garantiaTextoContainer}>
            <Text style={styles.garantiaTitulo}>Garantia de 6 meses</Text>

            <Text style={styles.garantiaTexto}>
              Este certificado tem garantia para defeitos de fabricação e banho,
              pelo prazo de até 6 meses após a data da compra.
            </Text>
          </View>
        </View>

        {/* =================================================
            TERMOS E CUIDADOS
        ================================================== */}

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}> Termos e Cuidados</Text>

          <View style={styles.termosBox}>
            <Text style={styles.termoDestaque}>
              Nossos produtos são folheados a ouro 18K, prata, ouro velho e
              prata envelhecida.
            </Text>

            <Text style={styles.subtituloTermo}>Cuidados especiais:</Text>

            <Text style={styles.termo}>
              Evite contato com água do mar e piscina, areia, produtos químicos
              (detergentes, cosméticos, perfumes e etc.), umidade, suor
              excessivo e qualquer produto abrasivo.
            </Text>

            <Text style={styles.termo}>
              Após o uso, limpe delicadamente com uma flanela seca, evitando
              atrito entre elas.
            </Text>

            <View style={styles.alertaGarantia}>
              <Ionicons name="time-outline" size={22} color="#8E3B56" />

              <Text style={styles.alertaTexto}>
                GARANTIA VÁLIDA NO PRAZO DE ATÉ 6 MESES APÓS A DATA DA COMPRA.
              </Text>
            </View>
          </View>
        </View>

        {/* =================================================
            RODAPÉ
        ================================================== */}

        <View style={styles.footer}>
          <Ionicons name="diamond-outline" size={25} color="#D4AF37" />

          <Text style={styles.footerTitulo}>G-JOYA</Text>

          <Text style={styles.footerTexto}>
            Obrigado por escolher a G-Joya para realçar ainda mais sua beleza.
          </Text>

          <Text style={styles.footerTexto}>
            Guarde este certificado para futuras solicitações de garantia.
          </Text>
          <Text style={styles.footerTitulo}>VIVA SUA BELEZA!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f1f2',
  },

  content: {
    padding: 15,
    paddingBottom: 40,
  },

  certificado: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },

  // =========================================================
  // HEADER
  // =========================================================

  header: {
    backgroundColor: '#fdf2f5',
    padding: 25,
    alignItems: 'center',
  },

  iconeContainer: {
    width: 75,
    height: 75,
    borderRadius: 38,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#732B45',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  subtitulo: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D4AF37',
    letterSpacing: 2,
  },

  linhaDourada: {
    width: 80,
    height: 2,
    backgroundColor: '#D4AF37',
    marginVertical: 15,
  },

  textoHeader: {
    color: '#6E5B63',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },

  // =========================================================
  // SEÇÕES
  // =========================================================

  secao: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  tituloSecao: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#732B45',
    marginBottom: 10,
  },

  infoBox: {
    backgroundColor: '#faf7f8',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f1d5dd',
  },

  label: {
    color: '#888',
    fontSize: 12,
  },

  valor: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 3,
  },

  valorGarantia: {
    color: '#8E3B56',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 3,
  },

  labelEspaco: {
    marginTop: 12,
  },

  // =========================================================
  // GARANTIA
  // =========================================================

  garantiaBox: {
    marginHorizontal: 18,
    marginTop: 22,
    padding: 16,
    backgroundColor: '#fff8fa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e9c3cf',
    flexDirection: 'row',
    alignItems: 'center',
  },

  garantiaTextoContainer: {
    flex: 1,
    marginLeft: 12,
  },

  garantiaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E3B56',
    marginBottom: 4,
  },

  garantiaTexto: {
    fontSize: 13,
    color: '#6E5B63',
    lineHeight: 19,
  },

  // =========================================================
  // TERMOS
  // =========================================================

  termosBox: {
    backgroundColor: '#faf7f8',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1d5dd',
  },

  termoDestaque: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4f3d44',
    lineHeight: 21,
  },

  subtituloTermo: {
    marginTop: 18,
    marginBottom: 7,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#732B45',
  },

  termo: {
    fontSize: 14,
    color: '#5f5559',
    lineHeight: 21,
    marginBottom: 12,
  },

  alertaGarantia: {
    marginTop: 5,
    padding: 12,
    backgroundColor: '#f8e8ed',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertaTexto: {
    flex: 1,
    marginLeft: 9,
    color: '#8E3B56',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 19,
  },

  // =========================================================
  // FOOTER
  // =========================================================

  footer: {
    marginTop: 25,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#732B45',
  },

  footerTitulo: {
    marginTop: 5,
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },

  footerTexto: {
    marginTop: 7,
    color: '#f5dfe6',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
