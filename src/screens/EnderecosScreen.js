import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function EnderecosScreen() {
  const { usuario } = useContext(AuthContext);

  // =========================
  // DADOS DO ENDEREÇO
  // =========================

  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');

  // =========================
  // CONTROLES
  // =========================

  const [editando, setEditando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [temEndereco, setTemEndereco] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoEditando, setEnderecoEditando] = useState(null);

  // =========================
  // CARREGAR ENDEREÇO
  // =========================

  useEffect(() => {
    async function inicializarEnderecos() {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }

      console.log('==============================');
      console.log('📍 CARREGANDO ENDEREÇOS');
      console.log('USUARIO:', usuario);

      try {
        // Carrega os dados antigos do usuário
        setCep(usuario.cep || '');
        setRua(usuario.endereco || '');
        setBairro(usuario.bairro || '');
        setCidade(usuario.cidade || '');
        setEstado(usuario.estado || '');
        setNumero(usuario.numero || '');
        setComplemento(usuario.complemento || '');

        // Primeiro garante a migração
        await migrarEnderecoPrincipal();

        // Depois carrega os endereços
        const ref = collection(db, 'users', usuario.uid, 'enderecos');

        const snapshot = await getDocs(ref);

        const lista = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        console.log('📍 ENDEREÇOS ENCONTRADOS:', lista);

        setEnderecos(lista);

        // Se existe pelo menos um endereço,
        // considera que o usuário já possui endereço.
        setTemEndereco(lista.length > 0);
      } catch (error) {
        console.error('❌ Erro ao inicializar endereços:', error);
      } finally {
        setLoading(false);
      }
    }

    inicializarEnderecos();
  }, [usuario?.uid]);
  // =========================
  // BUSCAR CEP
  // =========================

  async function buscarCep(valor) {
    const cepLimpo = valor.replace(/\D/g, '');

    setCep(cepLimpo);

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      setBuscandoCep(true);

      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );

      const dados = await response.json();

      if (dados.erro) {
        Alert.alert('CEP inválido', 'Não encontramos esse CEP.');

        return;
      }

      setRua(dados.logradouro || '');
      setBairro(dados.bairro || '');
      setCidade(dados.localidade || '');
      setEstado(dados.uf || '');
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);

      Alert.alert('Erro', 'Não foi possível consultar o CEP.');
    } finally {
      setBuscandoCep(false);
    }
  }

  async function tornarPrincipal(endereco) {
    try {
      if (!usuario?.uid) {
        Alert.alert('Erro', 'Usuário não identificado.');
        return;
      }

      Alert.alert(
        'Alterar endereço principal',
        'Deseja tornar este endereço o principal?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sim',
            onPress: async () => {
              try {
                setSalvando(true);

                const ref = collection(db, 'users', usuario.uid, 'enderecos');

                // Buscar todos os endereços
                const snapshot = await getDocs(ref);

                // Deixar todos como não principais
                for (const item of snapshot.docs) {
                  await updateDoc(item.ref, {
                    principal: false,
                  });
                }

                // Definir o escolhido como principal
                const enderecoRef = doc(
                  db,
                  'users',
                  usuario.uid,
                  'enderecos',
                  endereco.id,
                );

                await updateDoc(enderecoRef, {
                  principal: true,
                });

                console.log('⭐ NOVO ENDEREÇO PRINCIPAL:', endereco.id);

                // Atualizar lista na tela
                setEnderecos((listaAtual) =>
                  listaAtual.map((item) => ({
                    ...item,
                    principal: item.id === endereco.id,
                  })),
                );

                Alert.alert('Sucesso', 'Endereço principal alterado! ⭐');
              } catch (error) {
                console.error('❌ Erro ao alterar endereço principal:', error);

                Alert.alert(
                  'Erro',
                  'Não foi possível alterar o endereço principal.',
                );
              } finally {
                setSalvando(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error(error);
    }
  }

  // async function migrarEnderecoPrincipal() {
  //   try {
  //     if (!usuario?.uid) {
  //       return;
  //     }

  //     const refEnderecos = collection(db, 'users', usuario.uid, 'enderecos');

  //     const snapshot = await getDocs(refEnderecos);

  //     // Verifica se o endereço antigo já foi migrado
  //     const enderecoAntigoExiste = snapshot.docs.some((item) => {
  //       const dados = item.data();

  //       return (
  //         dados.endereco === usuario.endereco &&
  //         dados.numero === usuario.numero &&
  //         dados.complemento === usuario.complemento &&
  //         dados.cep === usuario.cep
  //       );
  //     });

  //     if (enderecoAntigoExiste) {
  //       console.log('ℹ️ Endereço atual já existe na subcoleção.');

  //       return;
  //     }

  //     // ==========================================
  //     // CRIAR ENDEREÇO ANTIGO
  //     // ==========================================

  //     const novoEndereco = {
  //       endereco: usuario.endereco || '',
  //       cep: usuario.cep || '',
  //       numero: usuario.numero || '',
  //       complemento: usuario.complemento || '',
  //       bairro: usuario.bairro || '',
  //       cidade: usuario.cidade || '',
  //       estado: usuario.estado || '',

  //       // IMPORTANTE:
  //       // Não será principal porque já existe
  //       // outro endereço principal.
  //       principal: false,

  //       criadoEm: new Date(),
  //     };

  //     const documento = await addDoc(refEnderecos, novoEndereco);

  //     console.log('✅ ENDEREÇO ANTIGO ADICIONADO À SUBCOLEÇÃO:', documento.id);

  //     setEnderecos((listaAtual) => [
  //       ...listaAtual,
  //       {
  //         id: documento.id,
  //         ...novoEndereco,
  //       },
  //     ]);
  //   } catch (error) {
  //     console.error('❌ Erro ao migrar endereço:', error);
  //   }
  // }

  async function migrarEnderecoPrincipal() {
    try {
      if (!usuario?.uid) {
        return;
      }

      // Só migra se realmente existir um endereço antigo
      const possuiEnderecoAntigo =
        usuario.cep ||
        usuario.endereco ||
        usuario.numero ||
        usuario.bairro ||
        usuario.cidade;

      if (!possuiEnderecoAntigo) {
        console.log('ℹ️ Usuário não possui endereço antigo para migrar.');
        return;
      }

      const refEnderecos = collection(db, 'users', usuario.uid, 'enderecos');

      const snapshot = await getDocs(refEnderecos);

      // Verifica se esse endereço já existe
      const enderecoAntigoExiste = snapshot.docs.some((item) => {
        const dados = item.data();

        return (
          dados.endereco === usuario.endereco &&
          dados.numero === usuario.numero &&
          dados.cep === usuario.cep
        );
      });

      if (enderecoAntigoExiste) {
        console.log('ℹ️ Endereço atual já existe na subcoleção.');
        return;
      }

      const novoEndereco = {
        endereco: usuario.endereco || '',
        cep: usuario.cep || '',
        numero: usuario.numero || '',
        complemento: usuario.complemento || '',
        bairro: usuario.bairro || '',
        cidade: usuario.cidade || '',
        estado: usuario.estado || '',

        // Se está migrando o endereço antigo,
        // ele será o principal.
        principal: true,

        criadoEm: new Date(),
      };

      const documento = await addDoc(refEnderecos, novoEndereco);

      console.log('✅ ENDEREÇO PRINCIPAL MIGRADO:', documento.id);
    } catch (error) {
      console.error('❌ Erro ao migrar endereço:', error);
    }
  }

  function iniciarEdicao(endereco) {
    console.log('✏️ EDITANDO ENDEREÇO:', endereco);

    setEnderecoEditando(endereco);

    setCep(endereco.cep || '');
    setRua(endereco.endereco || '');
    setBairro(endereco.bairro || '');
    setCidade(endereco.cidade || '');
    setEstado(endereco.estado || '');
    setNumero(endereco.numero || '');
    setComplemento(endereco.complemento || '');

    setAdicionando(false);
    setEditando(true);
  }

  async function excluirEndereco(endereco) {
    if (!usuario?.uid) {
      Alert.alert('Erro', 'Usuário não identificado.');
      return;
    }

    // Não permite excluir o principal
    if (endereco.principal) {
      Alert.alert(
        'Endereço principal',
        'O endereço principal não pode ser excluído. Primeiro escolha outro endereço como principal.',
      );
      return;
    }

    Alert.alert('Excluir endereço', 'Deseja realmente excluir este endereço?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setSalvando(true);

            const ref = doc(db, 'users', usuario.uid, 'enderecos', endereco.id);

            await deleteDoc(ref);

            console.log('🗑️ ENDEREÇO EXCLUÍDO:', endereco.id);

            // Remove da lista sem precisar
            // consultar o Firebase novamente
            setEnderecos((listaAtual) =>
              listaAtual.filter((item) => item.id !== endereco.id),
            );

            Alert.alert('Sucesso', 'Endereço excluído com sucesso.');
          } catch (error) {
            console.error('❌ Erro ao excluir endereço:', error);

            Alert.alert('Erro', 'Não foi possível excluir o endereço.');
          } finally {
            setSalvando(false);
          }
        },
      },
    ]);
  }
  // =========================
  // SALVAR ENDEREÇO
  // =========================

  async function salvarEndereco() {
    try {
      if (!usuario?.uid) {
        Alert.alert('Erro', 'Usuário não identificado.');
        return;
      }

      if (!cep.trim()) {
        Alert.alert('Atenção', 'Digite o CEP.');
        return;
      }

      if (cep.replace(/\D/g, '').length !== 8) {
        Alert.alert('Atenção', 'Digite um CEP válido.');
        return;
      }

      if (!rua.trim()) {
        Alert.alert('Atenção', 'Informe o endereço.');
        return;
      }

      if (!numero.trim()) {
        Alert.alert('Atenção', 'Digite o número.');
        return;
      }

      setSalvando(true);

      // ==========================================
      // NOVO ENDEREÇO
      // ==========================================

      if (adicionando) {
        const ref = collection(db, 'users', usuario.uid, 'enderecos');

        const novoEndereco = {
          endereco: rua.trim(),
          cep: cep.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
          principal: false,
          criadoEm: new Date(),
        };

        const documento = await addDoc(ref, novoEndereco);

        console.log('✅ NOVO ENDEREÇO CRIADO:', documento.id);

        // Atualiza a lista na tela
        setEnderecos((listaAtual) => [
          ...listaAtual,
          {
            id: documento.id,
            ...novoEndereco,
          },
        ]);

        setAdicionando(false);

        // Volta para o endereço principal
        setCep(usuario?.cep || '');
        setRua(usuario?.endereco || '');
        setBairro(usuario?.bairro || '');
        setCidade(usuario?.cidade || '');
        setEstado(usuario?.estado || '');
        setNumero(usuario?.numero || '');
        setComplemento(usuario?.complemento || '');

        Alert.alert('Sucesso', 'Novo endereço adicionado! 📍');

        return;
      }

      // ==========================================
      // ATUALIZAR ENDEREÇO PRINCIPAL ATUAL
      // ==========================================
      if (!enderecoEditando?.id) {
        Alert.alert('Erro', 'Nenhum endereço foi selecionado para edição.');
        return;
      }

      const ref = doc(
        db,
        'users',
        usuario.uid,
        'enderecos',
        enderecoEditando.id,
      );

      await updateDoc(ref, {
        cep: cep.trim(),
        endereco: rua.trim(),
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        numero: numero.trim(),
        complemento: complemento.trim(),
      });
      setEnderecos((listaAtual) =>
        listaAtual.map((item) =>
          item.id === enderecoEditando.id
            ? {
                ...item,
                cep: cep.trim(),
                endereco: rua.trim(),
                bairro: bairro.trim(),
                cidade: cidade.trim(),
                estado: estado.trim(),
                numero: numero.trim(),
                complemento: complemento.trim(),
              }
            : item,
        ),
      );
      setEnderecoEditando(null);
      setEditando(false);

      console.log('✅ ENDEREÇO PRINCIPAL ATUALIZADO');

      setEditando(false);

      Alert.alert('Sucesso', 'Endereço atualizado! 📍');
    } catch (error) {
      console.error('❌ ERRO AO SALVAR ENDEREÇO:', error);

      Alert.alert('Erro', 'Não foi possível salvar o endereço.');
    } finally {
      setSalvando(false);
    }
  }

  async function carregarEnderecos() {
    try {
      if (!usuario?.uid) {
        return;
      }

      const ref = collection(db, 'users', usuario.uid, 'enderecos');

      const snapshot = await getDocs(ref);

      const lista = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      console.log('📍 ENDEREÇOS ENCONTRADOS:', lista);

      setEnderecos(lista);
      setTemEndereco(lista.length > 0);
    } catch (error) {
      console.error('❌ Erro ao carregar endereços:', error);
    }
  }
  // =========================
  // CANCELAR
  // =========================

  function cancelarEdicao() {
    // Volta para os dados originais do usuário

    setCep(usuario?.cep || '');
    setRua(usuario?.endereco || '');
    setBairro(usuario?.bairro || '');
    setCidade(usuario?.cidade || '');
    setEstado(usuario?.estado || '');
    setNumero(usuario?.numero || '');
    setComplemento(usuario?.complemento || '');

    setEditando(false);
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#c48b9f" />

        <Text style={styles.loadingText}>Carregando endereço...</Text>
      </View>
    );
  }

  // =========================
  // TELA
  // =========================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.titulo}>📍 Meus Endereços</Text>

      {/* ================================= */}
      {/* ENDEREÇO 1 */}
      {/* ================================= */}

      {/* {temEndereco && !editando && (
        <View style={styles.card}>
          <View style={styles.topoCard}>
            <Text style={styles.cardTitulo}>Endereço 1</Text>

            <View style={styles.principalBadge}>
              <Text style={styles.principalText}>Principal</Text>
            </View>
          </View>

          <View style={styles.linha} />

          <Text style={styles.enderecoTexto}>
            {rua}, {numero}
          </Text>

          {complemento ? (
            <Text style={styles.enderecoSecundario}>{complemento}</Text>
          ) : null}

          <Text style={styles.enderecoSecundario}>{bairro}</Text>

          <Text style={styles.enderecoSecundario}>
            {cidade} - {estado}
          </Text>

          <Text style={styles.enderecoSecundario}>CEP: {cep}</Text>

          <TouchableOpacity
            style={styles.botao}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.textoBotao}>✏️ Editar endereço</Text>
          </TouchableOpacity>
        </View>
      )} */}

      {!editando && !adicionando && enderecos.length > 0 && (
        <>
          {enderecos.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.topoCard}>
                <Text style={styles.cardTitulo}>Endereço {index + 1}</Text>

                {item.principal && (
                  <View style={styles.principalBadge}>
                    <Text style={styles.principalText}>Principal</Text>
                  </View>
                )}
              </View>

              <View style={styles.linha} />

              <Text style={styles.enderecoTexto}>
                {item.endereco}, {item.numero}
              </Text>

              {item.complemento ? (
                <Text style={styles.enderecoSecundario}>
                  {item.complemento}
                </Text>
              ) : null}

              <Text style={styles.enderecoSecundario}>{item.bairro}</Text>

              <Text style={styles.enderecoSecundario}>
                {item.cidade} - {item.estado}
              </Text>

              <Text style={styles.enderecoSecundario}>CEP: {item.cep}</Text>

              {!item.principal && (
                // Tornar principal
                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={() => tornarPrincipal(item)}
                >
                  <Text style={styles.textoBotaoSecundario}>
                    ⭐ Tornar principal
                  </Text>
                </TouchableOpacity>
              )}

              {/* Editar endereço */}
              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => iniciarEdicao(item)}
              >
                <Text style={styles.textoBotaoEditar}>✏️ Editar endereço</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoExcluir}
                onPress={() => excluirEndereco(item)}
              >
                <Text style={styles.textoBotaoExcluir}>
                  🗑️ Excluir endereço
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {/* {!editando && enderecos.length > 0 && (
        <>
          {enderecos.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.topoCard}>
                <Text style={styles.cardTitulo}>Endereço {index + 2}</Text>

                {item.principal && (
                  <View style={styles.principalBadge}>
                    <Text style={styles.principalText}>Principal</Text>
                  </View>
                )}
              </View>

              <View style={styles.linha} />

              <Text style={styles.enderecoTexto}>
                {item.endereco}, {item.numero}
              </Text>

              {item.complemento ? (
                <Text style={styles.enderecoSecundario}>
                  {item.complemento}
                </Text>
              ) : null}

              <Text style={styles.enderecoSecundario}>{item.bairro}</Text>

              <Text style={styles.enderecoSecundario}>
                {item.cidade} - {item.estado}
              </Text>

              <Text style={styles.enderecoSecundario}>CEP: {item.cep}</Text>

              {!item.principal && (
                <TouchableOpacity
                  style={styles.botaoSecundario}
                  onPress={() => tornarPrincipal(item)}
                >
                  <Text style={styles.textoBotaoSecundario}>
                    ⭐ Tornar principal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </>
      )} */}

      {/* ================================= */}
      {/* FORMULÁRIO */}
      {/* ================================= */}

      {(!temEndereco || editando || adicionando) && (
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            {adicionando
              ? 'Novo endereço'
              : temEndereco
                ? 'Editar endereço'
                : 'Cadastrar endereço'}
          </Text>

          {/* CEP */}

          <Text style={styles.label}>CEP</Text>

          <TextInput
            style={styles.input}
            value={cep}
            onChangeText={buscarCep}
            placeholder="Digite seu CEP"
            keyboardType="numeric"
            editable={!salvando}
            maxLength={8}
          />

          {buscandoCep && (
            <View style={styles.buscaCep}>
              <ActivityIndicator size="small" color="#c48b9f" />

              <Text style={styles.buscaCepTexto}>Consultando CEP...</Text>
            </View>
          )}

          {/* RUA */}

          <Text style={styles.label}>Rua / Logradouro</Text>

          <TextInput
            style={styles.input}
            value={rua}
            onChangeText={setRua}
            placeholder="Rua"
            editable={!salvando}
          />

          {/* NÚMERO */}

          <Text style={styles.label}>Número</Text>

          <TextInput
            style={styles.input}
            value={numero}
            onChangeText={setNumero}
            placeholder="Número"
            keyboardType="numeric"
            editable={!salvando}
          />

          {/* COMPLEMENTO */}

          <Text style={styles.label}>Complemento</Text>

          <TextInput
            style={styles.input}
            value={complemento}
            onChangeText={setComplemento}
            placeholder="Ex: Casa, Apto 2..."
            editable={!salvando}
          />

          {/* BAIRRO */}

          <Text style={styles.label}>Bairro</Text>

          <TextInput
            style={styles.input}
            value={bairro}
            onChangeText={setBairro}
            placeholder="Bairro"
            editable={!salvando}
          />

          {/* CIDADE */}

          <Text style={styles.label}>Cidade</Text>

          <TextInput
            style={styles.input}
            value={cidade}
            onChangeText={setCidade}
            placeholder="Cidade"
            editable={!salvando}
          />

          {/* ESTADO */}

          <Text style={styles.label}>Estado</Text>

          <TextInput
            style={styles.input}
            value={estado}
            onChangeText={setEstado}
            placeholder="Estado"
            autoCapitalize="characters"
            maxLength={2}
            editable={!salvando}
          />

          {/* SALVAR */}

          <TouchableOpacity
            style={styles.botao}
            onPress={salvarEndereco}
            disabled={salvando}
          >
            <Text style={styles.textoBotao}>
              {salvando ? 'Salvando...' : '💾 Salvar endereço'}
            </Text>
          </TouchableOpacity>

          {/* CANCELAR */}

          {(temEndereco || adicionando) && (
            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => {
                if (adicionando) {
                  setAdicionando(false);

                  setCep(usuario?.cep || '');
                  setRua(usuario?.endereco || '');
                  setBairro(usuario?.bairro || '');
                  setCidade(usuario?.cidade || '');
                  setEstado(usuario?.estado || '');
                  setNumero(usuario?.numero || '');
                  setComplemento(usuario?.complemento || '');

                  return;
                }

                cancelarEdicao();
              }}
              disabled={salvando}
            >
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ================================= */}
      {/* ADICIONAR OUTRO */}
      {/* ================================= */}

      <TouchableOpacity
        style={styles.botaoAdicionar}
        onPress={() => {
          setAdicionando(true);

          setCep('');
          setRua('');
          setBairro('');
          setCidade('');
          setEstado('');
          setNumero('');
          setComplemento('');
        }}
      >
        <Text style={styles.textoAdicionar}>＋ Adicionar outro endereço</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// =====================================
// ESTILOS
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#302323',
  },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    marginBottom: 15,
  },

  topoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#302323',
  },

  principalBadge: {
    backgroundColor: '#f3dfe6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  principalText: {
    color: '#a55f78',
    fontSize: 11,
    fontWeight: 'bold',
  },

  linha: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },

  enderecoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#302323',
    marginBottom: 5,
  },

  enderecoSecundario: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#777',
    marginBottom: 5,
  },

  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e5d5da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: '#333',
  },

  buscaCep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 10,
  },

  buscaCepTexto: {
    marginLeft: 8,
    color: '#777',
    fontSize: 12,
  },

  botao: {
    backgroundColor: '#c48b9f',
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  botaoCancelar: {
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },

  textoCancelar: {
    color: '#777',
    fontWeight: 'bold',
  },

  botaoAdicionar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#c48b9f',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },

  textoAdicionar: {
    color: '#a55f78',
    fontWeight: 'bold',
    fontSize: 15,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5f2',
  },

  loadingText: {
    marginTop: 10,
    color: '#777',
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: '#c48b9f',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotaoSecundario: {
    color: '#a55f78',
    fontWeight: 'bold',
  },
  botaoEditar: {
    backgroundColor: '#f5f0f2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotaoEditar: {
    color: '#8f596c',
    fontWeight: 'bold',
  },
  botaoExcluir: {
    backgroundColor: '#fff0f0',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5b5b5',
  },

  textoBotaoExcluir: {
    color: '#c0392b',
    fontWeight: 'bold',
  },
});
