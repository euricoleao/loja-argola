import axios from 'axios';
import * as Clipboard from 'expo-clipboard';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';

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
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { db } from '../firebase/config';

export default function CheckoutScreen({ navigation, route }) {
  const { usuario } = useContext(AuthContext);
  // console.log('ROUTE PARAMS:', route.params);
  const [cep, setCep] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  // const [numero, setNumero] = useState('');
  const [mostrarPix, setMostrarPix] = useState(false);
  // const [complementoNumero, setComplementoNumero] = useState('');
  const { carrinho, limparCarrinho } = useContext(CartContext);
  const [pedidoAtual, setPedidoAtual] = useState(null);
  const [codigoPix, setCodigoPix] = useState('');

  const formaInicial = route.params?.formaPagamento || 'pix';
  const parcelasSelecionadas = route.params?.parcelas || 1;
  const parcelasInicial = route.params?.parcelas || 1;
  const [formaPagamento, setFormaPagamento] = useState(formaInicial);
  const [parcelas, setParcelas] = useState(parcelasInicial);
  const [creditoAprovado, setCreditoAprovado] = useState(false);
  const [prazoPagamento, setPrazoPagamento] = useState(null);
  // console.log('FORMA NO CHECKOUT:', formaPagamento);
  const total = carrinho.reduce((soma, item) => {
    return soma + (item.precoVenda || 0) * (item.quantidade || 0);
  }, 0);

  const [qrPix, setQrPix] = useState(null);

  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    contato: '',
    cep: '',
    endereco: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: 'Bahia',
  });

  const [toast, setToast] = useState({
    visible: false,
    message: '',
    tipo: 'sucesso', // 👈 ADICIONE ISSO
  });

  useEffect(() => {
    if (!pedidoAtual) return;

    const pedidoRef = doc(db, 'pedidos', pedidoAtual);

    const unsubscribe = onSnapshot(pedidoRef, async (snapshot) => {
      if (!snapshot.exists()) return;

      const pedido = snapshot.data();

      console.log('STATUS FIRESTORE:', pedido.statusPagamento);

      if (pedido.statusPagamento === 'pago') {
        const estoqueOk = await baixarEstoquePedido(pedidoAtual);

        if (!estoqueOk) {
          return;
        }

        mostrarToast('Pagamento aprovado ✅');

        limparCarrinho();

        setTimeout(() => {
          navigation.navigate('MainTabs', {
            screen: 'Home',
          });
        }, 1500);
      }
    });

    return () => unsubscribe();
  }, [pedidoAtual]);
  function atualizar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  useEffect(() => {
    if (usuario?.uid) {
      carregarCliente();
    }
  }, [usuario]);

  function gerarParcelas(valorTotal, quantidadeParcelas) {
    const diasVencimento = [30, 60, 90, 120];

    const parcelasGeradas = [];

    // Trabalhamos em centavos para evitar problemas de arredondamento
    const totalCentavos = Math.round(valorTotal * 100);

    const valorBaseCentavos = Math.floor(totalCentavos / quantidadeParcelas);

    let valorAcumuladoCentavos = 0;

    for (let i = 0; i < quantidadeParcelas; i++) {
      const numero = i + 1;

      let valorCentavos;

      // A última parcela recebe a diferença do arredondamento
      if (numero === quantidadeParcelas) {
        valorCentavos = totalCentavos - valorAcumuladoCentavos;
      } else {
        valorCentavos = valorBaseCentavos;
      }

      valorAcumuladoCentavos += valorCentavos;

      // Data de vencimento
      const vencimento = new Date();
      vencimento.setDate(vencimento.getDate() + diasVencimento[i]);

      parcelasGeradas.push({
        numero,
        valor: valorCentavos / 100,
        dias: diasVencimento[i],
        vencimento,
        status: 'pendente',
      });
    }

    return parcelasGeradas;
  }

  async function salvarPedido(status = 'aguardando') {
    try {
      // Atualiza dados do cliente
      if (usuario?.uid) {
        await updateDoc(doc(db, 'usuarios', usuario.uid), {
          cep: form.cep,
          numero: form.numero,
          complemento: form.complemento,
          endereco: form.endereco,
          bairro: form.bairro,
          cidade: form.cidade,
          estado: form.estado,
        });
      }

      // 💳 GERA AS PARCELAS SOMENTE PARA PAGAMENTO A PRAZO
      const parcelasGeradas =
        formaPagamento === 'prazo' ? gerarParcelas(total, parcelas) : [];

      console.log('💰 Parcelas geradas:', parcelasGeradas);

      // Cria pedido e pega o ID
      const pedidoRef = await addDoc(collection(db, 'pedidos'), {
        cliente: form.nome + ' ' + form.sobrenome,

        uid: usuario?.uid || '',

        email: usuario?.email || '',

        contato: form.contato,

        endereco: form.endereco,
        numero: form.numero,
        complemento: form.complemento,
        bairro: form.bairro,
        cidade: form.cidade,
        estado: form.estado,

        produtos: carrinho.map((item) => ({
          id: item.id,

          nome: item.nome,

          quantidade: Number(item.quantidade) || 0,

          precoVenda: Number(item.precoVenda) || 0,

          precoCompra: Number(item.precoCompra) || 0,

          totalVenda:
            (Number(item.precoVenda) || 0) * (Number(item.quantidade) || 0),

          totalCusto:
            (Number(item.precoCompra) || 0) * (Number(item.quantidade) || 0),

          lucro:
            ((Number(item.precoVenda) || 0) - (Number(item.precoCompra) || 0)) *
            (Number(item.quantidade) || 0),
        })),

        total: total,

        formaPagamento: formaPagamento,

        // 💰 PARCELAS
        parcelas: parcelasGeradas,

        // aguardando, pago ou aguardando_aprovacao
        statusPagamento: status,

        data: new Date(),
      });

      console.log('✅ Pedido criado:', pedidoRef.id);
      console.log('💳 Parcelas salvas:', parcelasGeradas);

      return pedidoRef.id;
    } catch (error) {
      console.log('❌ Erro salvar pedido:', error);

      return null;
    }
  }

  async function carregarCliente() {
    try {
      const userRef = doc(db, 'usuarios', usuario.uid);

      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const dados = snap.data();

        setCreditoAprovado(dados.creditoAprovado === true);
        setPrazoPagamento(dados.prazoPagamento || null);

        setForm((prev) => ({
          ...prev,
          nome: dados.nome || '',
          sobrenome: dados.sobrenome || '',
          email: dados.email || '',
          contato: dados.telefone || '',

          cep: dados.cep || '',
          endereco: dados.endereco || '',
          bairro: dados.bairro || '',
          cidade: dados.cidade || '',
          estado: dados.estado || 'Bahia',
        }));
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function baixarEstoquePedido(pedidoId) {
    try {
      await runTransaction(db, async (transaction) => {
        const pedidoRef = doc(db, 'pedidos', pedidoId);
        const pedidoSnap = await transaction.get(pedidoRef);

        if (!pedidoSnap.exists()) {
          throw new Error('Pedido não encontrado.');
        }

        const pedido = pedidoSnap.data();

        // 🛑 Evita baixar o mesmo pedido duas vezes
        if (pedido.estoqueBaixado === true) {
          console.log('📦 Estoque deste pedido já foi baixado.');
          return;
        }

        // 🔎 Verifica todos os produtos primeiro
        const produtosAtualizados = [];

        for (const item of pedido.produtos || []) {
          const produtoRef = doc(db, 'products', item.id);
          const produtoSnap = await transaction.get(produtoRef);

          if (!produtoSnap.exists()) {
            throw new Error(`Produto "${item.nome}" não encontrado.`);
          }

          const produto = produtoSnap.data();

          const estoqueAtual = Number(produto.quantidade) || 0;
          const quantidadeComprada = Number(item.quantidade) || 0;

          if (estoqueAtual < quantidadeComprada) {
            throw new Error(
              `Estoque insuficiente para o produto "${item.nome}".`,
            );
          }

          produtosAtualizados.push({
            ref: produtoRef,
            novaQuantidade: estoqueAtual - quantidadeComprada,
          });
        }

        // 📦 Faz as baixas
        produtosAtualizados.forEach((item) => {
          transaction.update(item.ref, {
            quantidade: item.novaQuantidade,
          });
        });

        // 🔒 Marca o pedido como estoque já baixado
        transaction.update(pedidoRef, {
          estoqueBaixado: true,
          estoqueBaixadoEm: new Date(),
        });
      });

      console.log('📦 Estoque atualizado com sucesso!');
      return true;
    } catch (error) {
      console.log('❌ Erro ao baixar estoque:', error);
      mostrarToast(error.message || 'Erro ao atualizar estoque.', 'erro');
      return false;
    }
  }

  async function confirmarPagamento(pedidoId) {
    await updateDoc(doc(db, 'pedidos', pedidoId), {
      statusPagamento: 'pago',
    });

    const estoqueOk = await baixarEstoquePedido(pedidoId);

    if (!estoqueOk) {
      return;
    }

    mostrarToast('Pagamento aprovado ✅');

    limparCarrinho();

    navigation.navigate('MainTabs', {
      screen: 'Home',
    });
  }

  async function finalizar() {
    if (!form.nome) {
      mostrarToast('Digite seu nome', 'erro');
      return;
    }

    // PIX
    if (formaPagamento === 'pix') {
      const pedidoId = await salvarPedido('aguardando');

      if (!pedidoId) {
        mostrarToast('Erro ao criar pedido', 'erro');

        return;
      }
      setPedidoAtual(pedidoId);

      await gerarPixMP(total, pedidoId);

      return;
    }

    if (formaPagamento === 'cartao') {
      const pedidoId = await salvarPedido('pago');

      if (!pedidoId) {
        mostrarToast('Erro ao criar pedido', 'erro');
        return;
      }

      mostrarToast('Processando cartão...');

      setTimeout(() => {
        confirmarPagamento(pedidoId);
      }, 3000);

      return;
    }

    if (formaPagamento === 'dinheiro') {
      await salvarPedido('aguardando');

      mostrarToast('Pedido enviado 💵');

      limparCarrinho();

      setTimeout(() => {
        navigation.navigate('MainTabs', {
          screen: 'Home',
        });
      }, 1500);
      return;
    }

    if (formaPagamento === 'prazo') {
      // Segurança: confirma novamente a autorização
      if (!creditoAprovado || !prazoPagamento) {
        mostrarToast('Compra a prazo não autorizada.', 'erro');
        return;
      }

      // 🔒 Limite de parcelas pelo prazo autorizado
      const limiteParcelasPrazo = Math.floor(prazoPagamento / 30);

      // 🔒 Limite de parcelas pelo valor
      let limiteParcelasValor = 1;

      if (total >= 100 && total <= 200) {
        limiteParcelasValor = 2;
      } else if (total > 200) {
        limiteParcelasValor = 4;
      }

      // 🔒 Limite final
      const limiteParcelas = Math.min(
        limiteParcelasPrazo,
        limiteParcelasValor,
        4,
      );

      if (parcelas < 1 || parcelas > limiteParcelas) {
        mostrarToast(
          `Número de parcelas não autorizado. Máximo: ${limiteParcelas}x`,
          'erro',
        );
        return;
      }

      const pedidoId = await salvarPedido('aguardando_aprovacao');

      if (!pedidoId) {
        mostrarToast('Erro ao criar pedido.', 'erro');
        return;
      }

      await updateDoc(doc(db, 'pedidos', pedidoId), {
        prazoPagamento: prazoPagamento,
        statusPagamento: 'aguardando_aprovacao',
      });

      mostrarToast(`Pedido enviado para aprovação (${parcelas}x).`);

      limparCarrinho();

      setTimeout(() => {
        navigation.navigate('MainTabs', {
          screen: 'Home',
        });
      }, 2000);

      return;
    }
  }

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '');

    console.log('CEP digitado:', cepLimpo); // 👈 TESTE

    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();
      console.log('RESPOSTA API:', data); // 👈 MUITO IMPORTANTE

      // 🔥 ESSA LINHA É A QUE FALTA
      // setComplemento(data.complemento || "");

      if (data.erro) {
        mostrarToast('CEP não encontrado ❌');
        return;
      }

      // 👇 preenche automático
      setForm((prev) => ({
        ...prev,
        endereco: `${data.logradouro}${data.complemento ? ' ' + data.complemento : ''}`,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        cep: data.cep,
      }));
    } catch (error) {
      console.log(error);
      mostrarToast('Erro ao buscar CEP ❌');
    }
  }

  function formatarCep(valor) {
    return valor.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2');
  }
  function mostrarToast(msg, tipo = 'sucesso') {
    setToast({ visible: true, message: msg, tipo });

    setTimeout(() => {
      setToast({ visible: false, message: '', tipo: 'sucesso' });
    }, 2000);
  }

  async function copiarPix() {
    await Clipboard.setStringAsync(codigoPix);
    mostrarToast('PIX copiado com sucesso ✅');
  }

  async function gerarPixMP(total, pedidoId) {
    try {
      const response = await axios.post(
        'https://skimming-captive-embezzle.ngrok-free.dev/criar-pix',
        {
          total,
          pedidoId,
        },
      );

      if (!response.data.qr_base64) {
        mostrarToast('Erro ao gerar PIX ❌', 'erro');
        return;
      }

      setQrPix(response.data.qr_base64);
      setCodigoPix(response.data.qr_code);

      setMostrarPix(true);
    } catch (error) {
      console.log(error);
    }
  }

  if (mostrarPix) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        {toast.visible && (
          <View
            style={[styles.toast, toast.tipo === 'erro' && styles.toastErro]}
          >
            <Text style={styles.toastText}>
              {toast.tipo === 'erro' ? '⚠️ ' : '✅ '}
              {toast.message}
            </Text>
          </View>
        )}

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
          Pagamento via PIX
        </Text>

        <Text style={{ marginBottom: 20 }}>Total: R$ {total.toFixed(2)}</Text>

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
            backgroundColor: '#c48b9f',
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>
            Copiar código PIX
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            marginTop: 20,
            color: '#666',
            textAlign: 'center',
          }}
        >
          Aguardando confirmação automática do pagamento...
        </Text>
        <TouchableOpacity
          onPress={() => setMostrarPix(false)}
          style={{
            marginTop: 20,
            backgroundColor: '#c48b9f',
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: '#fff' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {toast.visible && (
            <View
              style={[styles.toast, toast.tipo === 'erro' && styles.toastErro]}
            >
              <Text style={styles.toastText}>
                {toast.tipo === 'erro' ? '⚠️ ' : '✅ '}
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
              placeholder="Nome "
              style={styles.input}
              value={form.nome}
              onChangeText={(v) => atualizar('nome', v)}
            />

            <TextInput
              placeholder="Sobrenome"
              style={styles.input}
              value={form.sobrenome}
              onChangeText={(v) => atualizar('sobrenome', v)}
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
              onChangeText={(v) => atualizar('endereco', v)}
              editable={false} // 🔒 trava edição
            />

            <TextInput
              style={styles.input}
              placeholder="Número"
              keyboardType="numeric"
              value={form.numero}
              onChangeText={(v) => atualizar('numero', v)}
            />

            <TextInput
              placeholder="Complemento (ex: A, Fundos, Casa 2)"
              value={form.complemento}
              onChangeText={(v) => atualizar('complemento', v)}
              style={styles.input}
            />

            <TextInput
              placeholder="Bairro"
              style={styles.input}
              value={form.bairro}
              onChangeText={(v) => atualizar('bairro', v)}
            />

            <TextInput
              placeholder="Cidade"
              style={styles.input}
              value={form.cidade}
              onChangeText={(v) => atualizar('cidade', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Estado"
              value={form.estado}
            />

            <TouchableOpacity style={styles.botao} onPress={finalizar}>
              <Text style={styles.textoBotao}>Finalizar Pedido</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2f5',
    padding: 15,
  },

  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c48b9f',
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },

  botao: {
    backgroundColor: '#c48b9f',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toast: {
    position: 'absolute',
    top: 100,
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
  },
  headerForm: {
    backgroundColor: '#f8e1e7',
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 30,

    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  tituloHeader: {
    fontSize: 24,
    fontFamily: 'Playfair',
    color: '#a06a7d',
    fontWeight: 'bold',
  },

  subtituloHeader: {
    marginTop: 6,
    fontSize: 14,
    color: '#7d5a68',
    textAlign: 'center',
  },
});
