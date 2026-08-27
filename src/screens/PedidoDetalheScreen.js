import { Ionicons } from '@expo/vector-icons';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PedidoDetalhe({ route, navigation }) {
  const { pedido } = route.params;

  // =========================================================
  // FORMATA PREÇO
  // =========================================================

  function formatarPreco(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  // =========================================================
  // FORMATA DATA
  // =========================================================

  function formatarData(data) {
    if (!data) return '';

    const dataCompra = data?.toDate ? data.toDate() : new Date(data);

    return dataCompra.toLocaleDateString('pt-BR');
  }

  // =========================================================
  // STATUS
  // =========================================================

  function nomeStatus(status) {
    switch (status) {
      case 'pago':
        return 'Pagamento aprovado';

      case 'aguardando':
        return 'Aguardando pagamento';

      case 'aguardando_aprovacao':
        return 'Aguardando aprovação';

      case 'aprovado':
        return 'Pedido aprovado';

      case 'pendente':
        return 'Pedido pendente';

      case 'recusado':
        return 'Pedido recusado';

      case 'entregue':
        return 'Pedido entregue';

      default:
        return status || 'Em processamento';
    }
  }

  // =========================================================
  // COR DO STATUS
  // =========================================================

  function corStatus(status) {
    switch (status) {
      case 'pago':
        return '#2e7d32';

      case 'aprovado':
        return '#2e7d32';

      case 'aguardando':
        return '#f9a825';

      case 'aguardando_aprovacao':
        return '#f9a825';

      case 'entregue':
        return '#1565c0';

      case 'recusado':
        return '#c62828';

      default:
        return '#ef6c00';
    }
  }

  // =========================================================
  // ABRIR CERTIFICADO
  // =========================================================

  function abrirCertificado(produto) {
    navigation.navigate('CertificadoGarantia', {
      nomeCliente: pedido.cliente || 'Cliente',

      nomeProduto: produto.nome || 'Produto',

      codigoProduto: produto.codigo || produto.codigoProduto || 'Não informado',

      numeroPedido: pedido.id,

      dataCompra: pedido.data,

      // Enviamos também o produto inteiro
      // caso precisemos de outros dados futuramente.
      produto: produto,

      pedido: pedido,
    });
  }

  return (
    <ScrollView style={styles.container}>
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <View style={styles.header}>
        <Text style={styles.titulo}>Detalhes do Pedido</Text>

        <Text style={styles.data}>📅 {formatarData(pedido.data)}</Text>

        <Text style={styles.numeroPedido}>Pedido #{pedido.id}</Text>
      </View>

      {/* =====================================================
          STATUS
      ====================================================== */}

      <View style={styles.statusCard}>
        <Text style={styles.statusTitulo}>Status do pedido</Text>

        <Text
          style={[
            styles.status,
            {
              color: corStatus(pedido.statusPagamento),
            },
          ]}
        >
          ● {nomeStatus(pedido.statusPagamento)}
        </Text>
      </View>

      {/* =====================================================
          PRODUTOS
      ====================================================== */}

      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>🛍️ Produtos</Text>

        {pedido.produtos?.map((produto, index) => (
          <View key={index} style={styles.produtoContainer}>
            <View style={styles.produto}>
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>

                <Text style={styles.quantidade}>
                  Quantidade: {produto.quantidade}
                </Text>

                {/* CÓDIGO DO PRODUTO */}

                {produto.codigo && (
                  <Text style={styles.codigoProduto}>
                    Código: {produto.codigo}
                  </Text>
                )}
              </View>

              <Text style={styles.preco}>
                {formatarPreco(produto.totalVenda)}
              </Text>
            </View>

            {/* =================================================
                CERTIFICADO DE GARANTIA
            ================================================== */}

            {(pedido.statusPagamento === 'pago' ||
              pedido.statusPagamento === 'aprovado' ||
              pedido.statusPagamento === 'entregue') && (
              <TouchableOpacity
                style={styles.botaoCertificado}
                activeOpacity={0.8}
                onPress={() => abrirCertificado(produto)}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={21}
                  color="#fff"
                />

                <Text style={styles.textoCertificado}>
                  Certificado de Garantia
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.linha} />

        <View style={styles.totalContainer}>
          <Text style={styles.totalTexto}>Total</Text>

          <Text style={styles.total}>{formatarPreco(pedido.total)}</Text>
        </View>
      </View>

      {/* =====================================================
          PAGAMENTO
      ====================================================== */}

      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>💳 Pagamento</Text>

        <Text style={styles.info}>Forma de pagamento</Text>

        <Text style={styles.infoValor}>
          {pedido.formaPagamento || 'Não informado'}
        </Text>
      </View>

      {/* =====================================================
          ENDEREÇO
      ====================================================== */}

      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>📍 Endereço de entrega</Text>

        <Text style={styles.endereco}>{pedido.endereco}</Text>

        <Text style={styles.endereco}>Nº {pedido.numero}</Text>

        {pedido.complemento ? (
          <Text style={styles.endereco}>{pedido.complemento}</Text>
        ) : null}

        <Text style={styles.endereco}>{pedido.bairro}</Text>

        <Text style={styles.endereco}>
          {pedido.cidade} - {pedido.estado}
        </Text>
      </View>

      {/* =====================================================
          CLIENTE
      ====================================================== */}

      <View style={styles.card}>
        <Text style={styles.secaoTitulo}>👤 Cliente</Text>

        <Text style={styles.info}>Nome</Text>

        <Text style={styles.infoValor}>{pedido.cliente}</Text>

        <Text style={styles.info}>E-mail</Text>

        <Text style={styles.infoValor}>{pedido.email}</Text>

        <Text style={styles.info}>Telefone</Text>

        <Text style={styles.infoValor}>{pedido.contato}</Text>
      </View>

      <View style={styles.finalEspaco} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // =========================================================
  // CABEÇALHO
  // =========================================================

  header: {
    backgroundColor: '#111',
    paddingTop: 25,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },

  titulo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },

  data: {
    color: '#ccc',
    marginTop: 6,
    fontSize: 14,
  },

  numeroPedido: {
    color: '#d4af37',
    marginTop: 8,
    fontSize: 13,
    fontWeight: 'bold',
  },

  // =========================================================
  // STATUS
  // =========================================================

  statusCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 18,
    borderRadius: 15,
    elevation: 3,
  },

  statusTitulo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },

  status: {
    fontSize: 17,
    fontWeight: 'bold',
  },

  // =========================================================
  // CARDS
  // =========================================================

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 18,
    borderRadius: 15,
    elevation: 3,
  },

  secaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  // =========================================================
  // PRODUTO
  // =========================================================

  produtoContainer: {
    marginBottom: 18,
  },

  produto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  produtoInfo: {
    flex: 1,
    paddingRight: 10,
  },

  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  quantidade: {
    marginTop: 4,
    color: '#777',
    fontSize: 13,
  },

  codigoProduto: {
    marginTop: 4,
    color: '#999',
    fontSize: 12,
  },

  preco: {
    fontWeight: 'bold',
    fontSize: 15,
  },

  // =========================================================
  // CERTIFICADO
  // =========================================================

  botaoCertificado: {
    marginTop: 12,
    backgroundColor: '#8E3B56',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoCertificado: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },

  // =========================================================
  // TOTAL
  // =========================================================

  linha: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
  },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  totalTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },

  // =========================================================
  // INFORMAÇÕES
  // =========================================================

  info: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
  },

  infoValor: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 3,
  },

  endereco: {
    fontSize: 15,
    marginBottom: 5,
    color: '#444',
  },

  finalEspaco: {
    height: 30,
  },
});
