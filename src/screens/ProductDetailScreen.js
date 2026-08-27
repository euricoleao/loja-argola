import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useContext, useState } from 'react';

import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { CartContext } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatarPreco } from '../utils/formatarPreco';

export default function ProductDetailScreen({ route }) {
  const { adicionarAoCarrinho } = useContext(CartContext);
  const { produto } = route.params;

  const largura = Dimensions.get('window').width;

  const [indexAtual, setIndexAtual] = useState(0);

  const { mostrarToast } = useToast();

  // =========================================================
  // FOTOS DO PRODUTO
  // =========================================================

  const imagensProduto =
    produto.imagens && produto.imagens.length > 0
      ? produto.imagens
      : produto.imagem
        ? [produto.imagem]
        : [];

  return (
    <LinearGradient
      colors={['#fdf2f5', '#f8d7e1', '#d4c4c8']}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.conteudo}
      >
        {/* =====================================================
            FOTOS DO PRODUTO
        ====================================================== */}

        {imagensProduto.length > 0 ? (
          <>
            <FlatList
              data={imagensProduto}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => `${index}-${item}`}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / largura,
                );

                setIndexAtual(index);
              }}
              renderItem={({ item }) => (
                <View style={styles.fotoContainer}>
                  <Image
                    source={{ uri: item }}
                    style={styles.fotoProduto}
                    resizeMode="cover"
                  />
                </View>
              )}
            />

            {/* INDICADORES DAS FOTOS */}

            <View style={styles.indicadores}>
              {imagensProduto.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicador,
                    indexAtual === index && styles.indicadorAtivo,
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.semImagem}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={50}
              color="#b98b99"
            />

            <Text style={styles.semImagemTexto}>Foto não disponível</Text>
          </View>
        )}

        {/* =====================================================
            INFORMAÇÕES DO PRODUTO
        ====================================================== */}

        <Text style={styles.nome}>{produto.nome}</Text>

        <Text style={styles.preco}>{formatarPreco(produto.precoVenda)}</Text>

        <Text style={styles.descricao}>
          Joia de alta qualidade ideal para presentes e ocasiões especiais.
        </Text>

        {/* =====================================================
            INFORMAÇÕES G-JOYA
        ====================================================== */}

        <View style={styles.bannerContainer}>
          {/* CABEÇALHO */}

          <View style={styles.bannerTituloContainer}>
            <MaterialCommunityIcons
              name="diamond-stone"
              size={30}
              color="#8E3B56"
            />

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.bannerTitulo}>Nossas Peças</Text>

              <Text style={styles.bannerSubtitulo}>
                Qualidade e cuidado em cada detalhe.
              </Text>
            </View>
          </View>

          {/* INFORMAÇÃO 1 */}

          <View style={styles.infoItem}>
            <View style={styles.iconeInfo}>
              <MaterialCommunityIcons name="gold" size={24} color="#8E3B56" />
            </View>

            <View style={styles.infoTextoContainer}>
              <Text style={styles.infoTitulo}>Folheadas a Ouro 18K</Text>

              <Text style={styles.infoTexto}>
                Banho premium com brilho intenso e acabamento de alta qualidade.
                Todas as peças que possui pedras são cravejadas com zircônia.
              </Text>
            </View>
          </View>

          {/* INFORMAÇÃO 2 */}

          <View style={styles.infoItem}>
            <View style={styles.iconeInfo}>
              <MaterialCommunityIcons
                name="shield-check"
                size={24}
                color="#8E3B56"
              />
            </View>

            <View style={styles.infoTextoContainer}>
              <Text style={styles.infoTitulo}>Garantia G-Joya</Text>

              <Text style={styles.infoTexto}>
                Garantia contra defeitos de fabricação, e banho.
              </Text>
            </View>
          </View>

          {/* INFORMAÇÃO 3 */}

          <View style={styles.infoItem}>
            <View style={styles.iconeInfo}>
              <MaterialCommunityIcons
                name="truck-fast"
                size={24}
                color="#8E3B56"
              />
            </View>

            <View style={styles.infoTextoContainer}>
              <Text style={styles.infoTitulo}>Entrega rápida e segura</Text>

              <Text style={styles.infoTexto}>
                Embalagem especial com proteção para sua peça, e já pronta para
                presentear.
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            BOTÃO ADICIONAR AO CARRINHO
        ====================================================== */}

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.botao,

            {
              backgroundColor:
                (produto.quantidade || 0) <= 0 ? '#ccc' : '#c48b9f',
            },
          ]}
          disabled={(produto.quantidade || 0) <= 0}
          onPress={() => {
            adicionarAoCarrinho(produto);

            mostrarToast(`${produto.nome} adicionado 🛍️`);
          }}
        >
          <MaterialCommunityIcons name="cart-plus" size={22} color="#fff" />

          <Text style={styles.textoBotao}>
            {(produto.quantidade || 0) <= 0
              ? 'Produto esgotado'
              : 'Adicionar ao Carrinho'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // =========================================================
  // CONTAINER
  // =========================================================

  container: {
    flex: 1,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },

  // =========================================================
  // FOTOS
  // =========================================================

  fotoContainer: {
    width: larguraDaTela(),
    alignItems: 'center',
  },

  fotoProduto: {
    width: '100%',
    height: 500,
    borderRadius: 20,
    backgroundColor: '#eee',
  },

  // =========================================================
  // INDICADORES
  // =========================================================

  indicadores: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 5,
  },

  indicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },

  indicadorAtivo: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#c48b9f',
  },

  // =========================================================
  // SEM IMAGEM
  // =========================================================

  semImagem: {
    height: 500,
    borderRadius: 20,
    backgroundColor: '#f5e8ec',
    justifyContent: 'center',
    alignItems: 'center',
  },

  semImagemTexto: {
    marginTop: 10,
    color: '#8E3B56',
    fontSize: 15,
  },

  // =========================================================
  // PRODUTO
  // =========================================================

  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f3039',
    marginTop: 18,
  },

  preco: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8E3B56',
    marginVertical: 10,
  },

  descricao: {
    fontSize: 16,
    lineHeight: 23,
    color: '#5f4c52',
    marginBottom: 10,
  },

  // =========================================================
  // BLOCO G-JOYA
  // =========================================================

  bannerContainer: {
    marginTop: 24,
    backgroundColor: '#FFF6F8',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F4CBD5',
    padding: 18,
    marginBottom: 20,
  },

  bannerTituloContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  bannerTitulo: {
    color: '#732B45',
    fontSize: 21,
    fontWeight: '800',
  },

  bannerSubtitulo: {
    color: '#8a7078',
    fontSize: 13,
    marginTop: 2,
  },

  // =========================================================
  // INFORMAÇÕES
  // =========================================================

  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  iconeInfo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F9E4EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoTextoContainer: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 2,
  },

  infoTitulo: {
    color: '#732B45',
    fontSize: 16,
    fontWeight: '700',
  },

  infoTexto: {
    color: '#6E5B63',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },

  // =========================================================
  // BOTÃO
  // =========================================================

  botao: {
    minHeight: 52,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 10,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 9,
  },
});

// ===========================================================
// FUNÇÃO PARA PEGAR A LARGURA DA TELA
// ===========================================================

function larguraDaTela() {
  return Dimensions.get('window').width - 40;
}
