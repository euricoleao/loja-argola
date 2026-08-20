import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';

import { useContext, useEffect, useState } from 'react';

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function CreditoPrazoScreen() {
  const { usuario } = useContext(AuthContext);

  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const [creditoAprovado, setCreditoAprovado] = useState(false);

  const [prazoPagamento, setPrazoPagamento] = useState(120);

  const [limiteParcelas, setLimiteParcelas] = useState(4);

  useEffect(() => {
    if (usuario?.tipo === 'admin') {
      carregarClientes();
    }
  }, [usuario]);

  async function carregarClientes() {
    try {
      const snapshot = await getDocs(collection(db, 'usuarios'));

      const lista = snapshot.docs
        .map((docItem) => ({
          id: docItem.id,
          ...docItem.data(),
        }))
        .filter((cliente) => cliente.tipo !== 'admin');

      setClientes(lista);
    } catch (error) {
      console.log('❌ Erro ao carregar clientes:', error);
    }
  }

  function selecionarCliente(cliente) {
    setClienteSelecionado(cliente);

    setCreditoAprovado(cliente.creditoAprovado === true);

    setPrazoPagamento(Number(cliente.prazoPagamento) || 120);

    setLimiteParcelas(Number(cliente.limiteParcelas) || 4);
  }

  async function salvarCredito() {
    if (!clienteSelecionado) {
      Alert.alert('Atenção', 'Selecione um cliente.');
      return;
    }

    try {
      await updateDoc(doc(db, 'usuarios', clienteSelecionado.id), {
        creditoAprovado,
        prazoPagamento,
        limiteParcelas,
      });

      // Atualiza a lista local
      setClientes((lista) =>
        lista.map((cliente) =>
          cliente.id === clienteSelecionado.id
            ? {
                ...cliente,
                creditoAprovado,
                prazoPagamento,
                limiteParcelas,
              }
            : cliente,
        ),
      );

      setClienteSelecionado((cliente) => ({
        ...cliente,
        creditoAprovado,
        prazoPagamento,
        limiteParcelas,
      }));

      Alert.alert('Sucesso', 'Crédito e prazo atualizados com sucesso.');
    } catch (error) {
      console.log('❌ Erro ao salvar crédito:', error);

      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  }

  if (usuario?.tipo !== 'admin') {
    return (
      <View style={styles.semAcesso}>
        <Text style={styles.semAcessoTexto}>
          Acesso restrito ao administrador.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>💳 Crédito / Prazo</Text>

      <Text style={styles.subtitulo}>
        Selecione um cliente para configurar sua compra a prazo.
      </Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        ListHeaderComponent={
          <>
            <Text style={styles.tituloLista}>👥 Clientes</Text>

            {clienteSelecionado && (
              <View style={styles.configuracao}>
                <Text style={styles.clienteTitulo}>
                  👤 {clienteSelecionado.nome || 'Cliente'}{' '}
                  {clienteSelecionado.sobrenome || ''}
                </Text>

                <Text style={styles.email}>{clienteSelecionado.email}</Text>

                {/* CRÉDITO */}

                <Text style={styles.label}>💳 Crédito</Text>

                <TouchableOpacity
                  style={[
                    styles.botaoOpcao,
                    creditoAprovado && styles.opcaoAtiva,
                  ]}
                  onPress={() => setCreditoAprovado(!creditoAprovado)}
                >
                  <Text
                    style={[
                      styles.textoOpcao,
                      creditoAprovado && styles.textoAtivo,
                    ]}
                  >
                    {creditoAprovado
                      ? '🟢 Crédito autorizado'
                      : '🔴 Crédito não autorizado'}
                  </Text>
                </TouchableOpacity>

                {creditoAprovado && (
                  <>
                    {/* PRAZO */}

                    <Text style={styles.label}>📅 Prazo máximo</Text>

                    <View style={styles.opcoesLinha}>
                      {[30, 60, 90, 120].map((dias) => (
                        <TouchableOpacity
                          key={dias}
                          style={[
                            styles.prazoBotao,
                            prazoPagamento === dias && styles.prazoAtivo,
                          ]}
                          onPress={() => {
                            setPrazoPagamento(dias);

                            // Limita parcelas
                            // conforme o prazo
                            const maxParcelas = dias / 30;

                            if (limiteParcelas > maxParcelas) {
                              setLimiteParcelas(maxParcelas);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.prazoTexto,
                              prazoPagamento === dias && styles.prazoTextoAtivo,
                            ]}
                          >
                            {dias} dias
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* PARCELAS */}

                    <Text style={styles.label}>💰 Limite de parcelas</Text>

                    <View style={styles.opcoesLinha}>
                      {[1, 2, 3, 4].map((quantidade) => {
                        const permitido = quantidade <= prazoPagamento / 30;

                        return (
                          <TouchableOpacity
                            key={quantidade}
                            disabled={!permitido}
                            style={[
                              styles.parcelaBotao,

                              limiteParcelas === quantidade &&
                                styles.parcelaAtiva,

                              !permitido && styles.parcelaDesabilitada,
                            ]}
                            onPress={() => setLimiteParcelas(quantidade)}
                          >
                            <Text
                              style={[
                                styles.parcelaTexto,

                                limiteParcelas === quantidade &&
                                  styles.parcelaTextoAtivo,

                                !permitido && styles.parcelaTextoDesabilitado,
                              ]}
                            >
                              {quantidade}x
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {/* RESUMO */}

                    <View style={styles.resumo}>
                      <Text style={styles.resumoTitulo}>📋 Configuração</Text>

                      <Text style={styles.resumoTexto}>
                        Prazo máximo: {prazoPagamento} dias
                      </Text>

                      <Text style={styles.resumoTexto}>
                        Limite: {limiteParcelas}x
                      </Text>

                      <Text style={styles.resumoTexto}>Vencimentos:</Text>

                      <Text style={styles.vencimentos}>
                        {Array.from(
                          {
                            length: limiteParcelas,
                          },
                          (_, index) => `${(index + 1) * 30} dias`,
                        ).join('  •  ')}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.botaoSalvar}
                      onPress={salvarCredito}
                    >
                      <Text style={styles.textoBotaoSalvar}>
                        💾 Salvar autorização
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            <Text style={styles.instrucao}>
              Toque em um cliente abaixo para configurar.
            </Text>
          </>
        }
        renderItem={({ item }) => {
          const autorizado = item.creditoAprovado === true;

          const selecionado = clienteSelecionado?.id === item.id;

          return (
            <TouchableOpacity
              style={[
                styles.clienteCard,
                selecionado && styles.clienteSelecionado,
              ]}
              onPress={() => selecionarCliente(item)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarTexto}>
                  {item.nome?.charAt(0)?.toUpperCase() || '👤'}
                </Text>
              </View>

              <View style={styles.clienteInfo}>
                <Text style={styles.nome}>
                  {item.nome || 'Cliente'} {item.sobrenome || ''}
                </Text>

                <Text style={styles.emailLista}>{item.email}</Text>

                <Text
                  style={[
                    styles.status,
                    autorizado ? styles.statusAtivo : styles.statusInativo,
                  ]}
                >
                  {autorizado
                    ? `🟢 ${item.prazoPagamento || 0} dias • ${item.limiteParcelas || 1}x`
                    : '🔴 Não autorizado'}
                </Text>
              </View>

              <Text style={styles.seta}>→</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#a06a7d',
    margin: 15,
    marginBottom: 5,
  },

  subtitulo: {
    marginHorizontal: 15,
    color: '#777',
    fontSize: 14,
    marginBottom: 10,
  },

  tituloLista: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a06a7d',
    margin: 15,
    marginTop: 10,
  },

  configuracao: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 3,
  },

  clienteTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#333',
  },

  email: {
    marginTop: 4,
    color: '#777',
  },

  label: {
    marginTop: 18,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
  },

  botaoOpcao: {
    borderWidth: 1,
    borderColor: '#eee',
    padding: 13,
    borderRadius: 10,
  },

  opcaoAtiva: {
    backgroundColor: '#eaf7ed',
    borderColor: '#4CAF50',
  },

  textoOpcao: {
    textAlign: 'center',
    color: '#777',
    fontWeight: 'bold',
  },

  textoAtivo: {
    color: '#4CAF50',
  },

  opcoesLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  prazoBotao: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
  },

  prazoAtivo: {
    backgroundColor: '#c48b9f',
    borderColor: '#c48b9f',
  },

  prazoTexto: {
    color: '#555',
    fontWeight: '600',
  },

  prazoTextoAtivo: {
    color: '#fff',
  },

  parcelaBotao: {
    width: 55,
    paddingVertical: 10,
    borderRadius: 9,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },

  parcelaAtiva: {
    backgroundColor: '#c48b9f',
    borderColor: '#c48b9f',
  },

  parcelaDesabilitada: {
    backgroundColor: '#eee',
    opacity: 0.5,
  },

  parcelaTexto: {
    color: '#555',
    fontWeight: 'bold',
  },

  parcelaTextoAtivo: {
    color: '#fff',
  },

  parcelaTextoDesabilitado: {
    color: '#999',
  },

  resumo: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#fdf2f5',
    borderRadius: 10,
  },

  resumoTitulo: {
    fontWeight: 'bold',
    color: '#a06a7d',
    marginBottom: 5,
  },

  resumoTexto: {
    marginTop: 3,
    color: '#555',
  },

  vencimentos: {
    marginTop: 4,
    color: '#a06a7d',
    fontWeight: 'bold',
  },

  botaoSalvar: {
    marginTop: 18,
    backgroundColor: '#a06a7d',
    padding: 14,
    borderRadius: 11,
    alignItems: 'center',
  },

  textoBotaoSalvar: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  instrucao: {
    marginHorizontal: 15,
    marginBottom: 5,
    color: '#888',
    fontSize: 13,
  },

  clienteCard: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },

  clienteSelecionado: {
    borderWidth: 2,
    borderColor: '#c48b9f',
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#f8e1e7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#a06a7d',
  },

  clienteInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  emailLista: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  status: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },

  statusAtivo: {
    color: '#4CAF50',
  },

  statusInativo: {
    color: '#e53935',
  },

  seta: {
    fontSize: 22,
    color: '#a06a7d',
  },

  semAcesso: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  semAcessoTexto: {
    color: '#777',
    fontSize: 16,
  },
});
