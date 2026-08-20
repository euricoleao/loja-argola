import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';

import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { db } from '../firebase/config';
import { formatarPreco } from '../utils/formatarPreco';

export default function CartScreen() {
  const { usuario } = useContext(AuthContext);
  const isAdmin = usuario?.tipo === 'admin';
  const [creditoAprovado, setCreditoAprovado] = useState(false);
  const [prazoPagamento, setPrazoPagamento] = useState(null);
  const [carregandoCredito, setCarregandoCredito] = useState(true);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [parcelas, setParcelas] = useState(1);
  const navigation = useNavigation();

  const [toast, setToast] = useState({
    visible: false,
    message: '',
  });

  const {
    carrinho,
    aumentarQuantidade,
    diminuirQuantidade,
    limparCarrinho,
    removerDoCarrinho,
  } = useContext(CartContext);

  // 💰 TOTAL
  const total = carrinho.reduce((soma, item) => {
    return soma + item.precoVenda * item.quantidade;
  }, 0);

  // 💳 LIMITE DE PARCELAS PELO VALOR DA COMPRA
  let limiteParcelasValor = 1;

  if (total >= 100 && total <= 200) {
    limiteParcelasValor = 2;
  } else if (total > 200) {
    limiteParcelasValor = 4;
  }

  // 📅 LIMITE DE PARCELAS PELO PRAZO DO CLIENTE
  const limiteParcelasPrazo = prazoPagamento
    ? Math.floor(prazoPagamento / 30)
    : 1;

  // 🔒 LIMITE FINAL = menor entre valor e prazo
  const limiteParcelas = Math.min(limiteParcelasValor, limiteParcelasPrazo, 4);

  //TOAST
  function mostrarToast(msg) {
    setToast({ visible: true, message: msg });

    setTimeout(() => {
      setToast({ visible: false, message: '' });
    }, 2000);
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            limparCarrinho(); // limpa

            mostrarToast('Carrinho limpo 🗑️', 'erro'); // 🔥 toast bonito
          }}
          style={{
            marginRight: 15,
            backgroundColor: '#f8e1e7',
            padding: 8,
            borderRadius: 10,
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#c48b9f" />
        </TouchableOpacity>
      ),
    });
  }, []);

  useEffect(() => {
    async function verificarCredito() {
      if (!usuario?.uid) {
        setCreditoAprovado(false);
        setPrazoPagamento(null);
        setCarregandoCredito(false);
        return;
      }

      try {
        const usuarioRef = doc(db, 'usuarios', usuario.uid);
        const snapshot = await getDoc(usuarioRef);

        if (snapshot.exists()) {
          const dados = snapshot.data();

          setCreditoAprovado(dados.creditoAprovado === true);
          setPrazoPagamento(dados.prazoPagamento || null);
        }
      } catch (error) {
        console.log('❌ Erro ao verificar crédito:', error);
        setCreditoAprovado(false);
        setPrazoPagamento(null);
      } finally {
        setCarregandoCredito(false);
      }
    }

    verificarCredito();
  }, [usuario]);

  // 🔒 Garante que a parcela selecionada nunca ultrapasse o limite
  useEffect(() => {
    if (parcelas > limiteParcelas) {
      setParcelas(limiteParcelas);
    }
  }, [limiteParcelas, parcelas]);

  if (carrinho.length === 0) {
    return (
      <LinearGradient
        colors={['#fdf2f5', '#f8d7e1', '#d4c4c8']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        {toast.visible && (
          <View
            style={[styles.toast, toast.tipo === 'erro' && styles.toastErro]}
          >
            <Text style={styles.toastText}>
              {toast.tipo === 'erro' ? '🗑️ ' : '✅ '}
              {toast.message}
            </Text>
          </View>
        )}
        <Text style={styles.iconeVazio}>🛍️</Text>

        <Text style={styles.tituloVazio}>Seu carrinho está vazio</Text>

        <Text style={styles.subtituloVazio}>
          Adicione produtos para continuar
        </Text>

        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.textoBotaoVoltar}>Ver produtos</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#fdf2f5', '#f8d7e1', '#d4c4c8']}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        {/* LISTA */}
        <FlatList
          data={carrinho}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnRemover}
                onPress={() => {
                  Alert.alert('Remover item', 'Deseja remover este produto?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Remover',
                      onPress: () => removerDoCarrinho(item.id),
                    },
                  ]);
                }}
              >
                <Ionicons name="trash-outline" size={18} color="#c48b9f" />
              </TouchableOpacity>

              <Image
                source={{ uri: item.imagens?.[0] }}
                style={styles.imagem}
              />

              <View style={{ flex: 1, marginLeft: 40 }}>
                <Text style={styles.nome}>{item.nome}</Text>

                <Text style={styles.preco}>
                  {formatarPreco(item.precoVenda)}
                </Text>

                {/* QUANTIDADE */}
                <View style={styles.qtdContainer}>
                  <TouchableOpacity
                    style={styles.btnQtd}
                    onPress={() => diminuirQuantidade(item.id)}
                  >
                    <Text>-</Text>
                  </TouchableOpacity>

                  <Text style={styles.qtd}>{item.quantidade}</Text>

                  <TouchableOpacity
                    style={styles.btnQtd}
                    onPress={() => aumentarQuantidade(item.id)}
                  >
                    <Text>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>

      {/* TOTAL + BOTÃO */}
      <View style={styles.footer}>
        <Text style={styles.total}>Total: {formatarPreco(total)}</Text>

        <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
          Forma de pagamento:
        </Text>

        <View style={styles.pagamentosContainer}>
          {/* PAGAMENTO EM PIX */}
          <TouchableOpacity
            style={[
              styles.btnPagamento,
              formaPagamento === 'pix' && styles.btnAtivo,
            ]}
            onPress={() => setFormaPagamento('pix')}
          >
            <Text
              style={[
                styles.textoPagamento,
                formaPagamento === 'pix' && styles.textoAtivo,
              ]}
            >
              📲 PIX {formaPagamento === 'pix' ? '✓' : ''}
            </Text>
          </TouchableOpacity>

          {/* PAGAMENTO EM DINHEIRO */}
          <TouchableOpacity
            style={[
              styles.btnPagamento,
              formaPagamento === 'dinheiro' && styles.btnAtivo,
            ]}
            onPress={() => setFormaPagamento('dinheiro')}
          >
            <Text
              style={[
                styles.textoPagamento,
                formaPagamento === 'dinheiro' && styles.textoAtivo,
              ]}
            >
              💵 Dinheiro {formaPagamento === 'dinheiro' ? '✓' : ''}
            </Text>
          </TouchableOpacity>

          {/* PAGAMENTO EM CARTÃO */}
          <TouchableOpacity
            style={[
              styles.btnPagamento,
              formaPagamento === 'cartao' && styles.btnAtivo,
            ]}
            onPress={() => setFormaPagamento('cartao')}
          >
            <Text
              style={[
                styles.textoPagamento,
                formaPagamento === 'cartao' && styles.textoAtivo,
              ]}
            >
              💳 Cartão {formaPagamento === 'cartao' ? '✓' : ''}
            </Text>
          </TouchableOpacity>

          {/* PAGAMENTO A PRAZO - SOMENTE CLIENTES AUTORIZADOS */}
          {creditoAprovado && prazoPagamento && (
            <TouchableOpacity
              style={[
                styles.btnPagamento,
                formaPagamento === 'prazo' && styles.btnAtivo,
              ]}
              onPress={() => setFormaPagamento('prazo')}
            >
              <Text
                style={[
                  styles.textoPagamento,
                  formaPagamento === 'prazo' && styles.textoAtivo,
                ]}
              >
                📅 {prazoPagamento} dias {formaPagamento === 'prazo' ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          )}

          {formaPagamento === 'prazo' && prazoPagamento && (
            <View style={styles.parcelamentoContainer}>
              <Text style={styles.parcelamentoTitulo}>Parcelamento</Text>

              <View style={styles.parcelasRow}>
                {Array.from(
                  { length: limiteParcelas },
                  (_, index) => index + 1,
                ).map((numero) => (
                  <TouchableOpacity
                    key={numero}
                    style={[
                      styles.btnParcela,
                      parcelas === numero && styles.btnParcelaAtivo,
                    ]}
                    onPress={() => setParcelas(numero)}
                  >
                    <View style={styles.conteudoParcela}>
                      <Text
                        style={[
                          styles.textoParcela,
                          parcelas === numero && styles.textoParcelaAtivo,
                        ]}
                      >
                        {numero}x
                      </Text>

                      <Text
                        style={[
                          styles.valorParcela,
                          parcelas === numero && styles.textoParcelaAtivo,
                        ]}
                      >
                        {formatarPreco(total / numero)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* BOTÃO DE FINALIZAR PEDIDO */}
        <TouchableOpacity
          style={styles.botao}
          onPress={() => {
            navigation.navigate('Checkout', {
              formaPagamento,
              parcelas,
            });
            console.log('ENVIANDO:', formaPagamento);
          }}
        >
          <Text style={styles.textoBotao}>Finalizar Pedido</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  imagemProduto: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 60,
  },

  infoProduto: {
    flex: 1,
  },

  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  boxCliente: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
  },

  titulo: {
    fontWeight: 'bold',
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginTop: 5,
    borderRadius: 8,
  },

  footer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 15,
    borderTopWidth: 1,
    borderColor: '#f1d5dd',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  total: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c48b9f',
  },

  botao: {
    backgroundColor: '#c48b9f',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  Button: {
    marginLeft: 10,
    backgroundColor: '#c48b9f',
    padding: 10,
    borderRadius: 8,
  },

  //estilos novos
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    margin: 10,
    borderRadius: 15,
    padding: 10,
    elevation: 3,
  },

  imagem: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },

  nome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  preco: {
    color: '#c48b9f',
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 10,
  },

  qtdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  btnQtd: {
    backgroundColor: '#f8e1e7',
    padding: 6,
    borderRadius: 8,
    marginHorizontal: 5,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtd: {
    fontWeight: 'bold',
  },
  btnRemover: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffe6eb',
    padding: 6,
    borderRadius: 20,
    elevation: 3,
  },

  pagamentosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  // btnPagamento: {
  //   flex: 1,
  //   minWidth: 85,
  //   paddingVertical: 11,
  //   paddingHorizontal: 8,
  //   backgroundColor: '#f8e1e7',
  //   borderRadius: 10,
  //   marginRight: 5,
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  btnPagamento: {
    width: '48%',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,

    alignItems: 'center',
    justifyContent: 'center',

    // sombra Android
    elevation: 4,

    // sombra iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,

    borderWidth: 1,
    borderColor: '#f1dce2',
  },

  textoPagamento: {
    color: '#8f596c',
    fontWeight: '700',
    fontSize: 14,
  },

  btnAtivo: {
    backgroundColor: '#c48b9f',
    borderColor: '#c48b9f',

    elevation: 7,

    shadowColor: '#c48b9f',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  textoAtivo: {
    color: '#fff',
  },

  iconeVazio: {
    fontSize: 60,
    marginBottom: 10,
  },

  tituloVazio: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c48b9f',
  },

  subtituloVazio: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    marginBottom: 20,
  },

  botaoVoltar: {
    backgroundColor: '#c48b9f',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },

  textoBotaoVoltar: {
    color: '#fff',
    fontWeight: 'bold',
  },

  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#c48b9f',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 999,
    elevation: 10,
  },

  toastErro: {
    backgroundColor: '#a06a7d',
  },

  toastText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },

  parcelamentoContainer: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fdf2f5',
    borderRadius: 12,
  },

  parcelamentoTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#a06a7d',
    marginBottom: 10,
  },

  parcelasRow: {
    flexDirection: 'row',
    gap: 8,
  },

  btnParcela: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d8a7b1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudoParcela: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  valorParcela: {
    marginTop: 3,
    fontSize: 12,
    color: '#777',
    fontWeight: 'bold',
  },

  btnParcelaAtivo: {
    backgroundColor: '#c48b9f',
  },

  textoParcela: {
    color: '#a06a7d',
    fontWeight: 'bold',
  },

  textoParcelaAtivo: {
    color: '#fff',
  },
});
