import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';

import { useEffect, useState } from 'react';

import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../firebase/config';
import { formatarPreco } from '../utils/formatarPreco';

export default function EstoqueScreen() {
  const [produtos, setProdutos] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [quantidadeEntrada, setQuantidadeEntrada] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProdutos(lista);
      },
      (error) => {
        console.error('❌ Erro ao carregar estoque:', error);
      },
    );

    return () => unsubscribe();
  }, []);

  function abrirEntrada(item) {
    setProdutoSelecionado(item);
    setQuantidadeEntrada('');
    setModalVisivel(true);
  }

  async function confirmarEntrada() {
    try {
      const entrada = Number(quantidadeEntrada) || 0;

      if (entrada <= 0) {
        Alert.alert('Atenção', 'Digite uma quantidade válida.');
        return;
      }

      if (!produtoSelecionado) {
        return;
      }

      const quantidadeAtual = Number(produtoSelecionado.quantidade) || 0;

      const novaQuantidade = quantidadeAtual + entrada;

      const precoCompra = Number(produtoSelecionado.precoCompra) || 0;

      const precoVenda = Number(produtoSelecionado.precoVenda) || 0;

      const lucro = precoVenda - precoCompra;

      const custoTotal = novaQuantidade * precoCompra;

      const lucroTotal = novaQuantidade * lucro;

      await updateDoc(doc(db, 'products', produtoSelecionado.id), {
        quantidade: novaQuantidade,
        lucro,
        custoTotal,
        lucroTotal,
      });

      setModalVisivel(false);
      setProdutoSelecionado(null);
      setQuantidadeEntrada('');

      Alert.alert(
        'Estoque atualizado 📦',
        `Novo estoque: ${novaQuantidade} peças`,
      );
    } catch (error) {
      console.error('❌ Erro ao adicionar estoque:', error);

      Alert.alert('Erro', 'Não foi possível atualizar o estoque.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle de Estoque</Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const quantidade = Number(item.quantidade) || 0;

          return (
            <View style={styles.linha}>
              <Text style={styles.nome}>{item.nome}</Text>

              {item.codigo && (
                <Text style={styles.codigo}>Código: {item.codigo}</Text>
              )}

              {/* ESTOQUE */}

              <View
                style={[
                  styles.estoqueBox,

                  quantidade === 0
                    ? styles.estoqueZero
                    : quantidade < 10
                      ? styles.estoqueBaixo
                      : styles.estoqueNormal,
                ]}
              >
                <Text style={styles.estoqueIcone}>📦</Text>

                <View>
                  <Text style={styles.estoqueLabel}>ESTOQUE</Text>

                  <Text
                    style={[
                      styles.estoqueQuantidade,

                      quantidade === 0
                        ? styles.estoqueQuantidadeZero
                        : quantidade < 10
                          ? styles.estoqueQuantidadeBaixo
                          : styles.estoqueQuantidadeNormal,
                    ]}
                  >
                    {quantidade === 0 ? 'SEM ESTOQUE' : `${quantidade} peças`}
                  </Text>
                </View>
              </View>

              {/* VALORES */}

              <Text>Compra: {formatarPreco(item.precoCompra)}</Text>

              <Text>Venda: {formatarPreco(item.precoVenda)}</Text>

              <Text>Lucro por peça: {formatarPreco(item.lucro)}</Text>

              <Text>Custo Total: {formatarPreco(item.custoTotal)}</Text>

              <Text>Lucro Total: {formatarPreco(item.lucroTotal)}</Text>

              {/* ENTRADA */}

              <TouchableOpacity
                style={styles.botaoEntrada}
                onPress={() => abrirEntrada(item)}
              >
                <Text style={styles.textoBotao}>+ Entrada de estoque</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitulo}>Adicionar estoque</Text>

            {produtoSelecionado && (
              <>
                <Text style={styles.modalProduto}>
                  {produtoSelecionado.nome}
                </Text>

                <Text style={styles.modalEstoqueAtual}>
                  Estoque atual: {Number(produtoSelecionado.quantidade) || 0}{' '}
                  peças
                </Text>
              </>
            )}

            <TextInput
              style={styles.modalInput}
              placeholder="Quantidade recebida"
              value={quantidadeEntrada}
              onChangeText={setQuantidadeEntrada}
              keyboardType="numeric"
              autoFocus
            />

            <TouchableOpacity
              style={styles.modalBotaoConfirmar}
              onPress={confirmarEntrada}
            >
              <Text style={styles.modalTextoBotao}>Confirmar entrada</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalBotaoCancelar}
              onPress={() => {
                setModalVisivel(false);
                setProdutoSelecionado(null);
                setQuantidadeEntrada('');
              }}
            >
              <Text style={styles.modalTextoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  linha: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
  },

  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  codigo: {
    color: '#777',
    marginTop: 3,
    marginBottom: 5,
  },

  estoqueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },

  estoqueNormal: {
    backgroundColor: '#e8f5e9',
  },

  estoqueBaixo: {
    backgroundColor: '#fff3cd',
  },

  estoqueZero: {
    backgroundColor: '#fdecea',
  },

  estoqueIcone: {
    fontSize: 28,
    marginRight: 10,
  },

  estoqueLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#777',
  },

  estoqueQuantidade: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  estoqueQuantidadeNormal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  estoqueQuantidadeBaixo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef6c00',
  },

  estoqueQuantidadeZero: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c62828',
  },

  botaoEntrada: {
    backgroundColor: '#c48b9f',
    padding: 11,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },

  modalTitulo: {
    fontSize: 21,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalProduto: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  modalEstoqueAtual: {
    color: '#777',
    marginBottom: 15,
  },

  modalInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },

  modalBotaoConfirmar: {
    backgroundColor: '#c48b9f',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalTextoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },

  modalBotaoCancelar: {
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },

  modalTextoCancelar: {
    color: '#777',
  },
});
