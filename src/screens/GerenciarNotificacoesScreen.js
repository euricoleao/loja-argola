import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function GerenciarNotificacoesScreen() {
  const { usuario } = useContext(AuthContext);

  const [carregando, setCarregando] = useState(true);

  const [config, setConfig] = useState({
    gerais: true,
    pedidos: true,
    vencimentos: true,
    aprovado: true,
    recusado: true,
  });

  useEffect(() => {
    carregarConfiguracoes();
  }, [usuario?.uid]);

  async function carregarConfiguracoes() {
    if (!usuario?.uid) {
      setCarregando(false);
      return;
    }

    try {
      const ref = doc(
        db,
        'usuarios',
        usuario.uid,
        'configuracoes',
        'notificacoes',
      );

      const snapshot = await getDoc(ref);

      if (snapshot.exists()) {
        setConfig((atual) => ({
          ...atual,
          ...snapshot.data(),
        }));
      } else {
        // Primeira vez que o cliente entra
        await setDoc(ref, {
          gerais: true,
          pedidos: true,
          vencimentos: true,
          aprovado: true,
          recusado: true,
        });
      }
    } catch (error) {
      console.log('❌ Erro ao carregar notificações:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function alterarConfiguracao(chave, valor) {
    try {
      const novaConfig = {
        ...config,
        [chave]: valor,
      };

      setConfig(novaConfig);

      const ref = doc(
        db,
        'usuarios',
        usuario.uid,
        'configuracoes',
        'notificacoes',
      );

      await setDoc(ref, novaConfig, {
        merge: true,
      });

      console.log(`🔔 ${chave}:`, valor ? 'ATIVADO' : 'DESATIVADO');
    } catch (error) {
      console.log('❌ Erro ao salvar configuração:', error);
    }
  }

  function OpcaoNotificacao({ icone, titulo, descricao, chave }) {
    return (
      <View style={styles.opcao}>
        <View style={styles.iconeContainer}>
          <Ionicons name={icone} size={22} color="#c48b9f" />
        </View>

        <View style={styles.info}>
          <Text style={styles.titulo}>{titulo}</Text>

          <Text style={styles.descricao}>{descricao}</Text>
        </View>

        <Switch
          value={config[chave]}
          onValueChange={(valor) => alterarConfiguracao(chave, valor)}
          trackColor={{
            false: '#ddd',
            true: '#e6b6c5',
          }}
          thumbColor={config[chave] ? '#c48b9f' : '#f4f3f4'}
        />
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#c48b9f" />

        <Text style={styles.loadingTexto}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={28} color="#c48b9f" />
        </View>

        <View>
          <Text style={styles.headerTitulo}>Gerenciar notificações</Text>

          <Text style={styles.headerSubtitulo}>
            Escolha quais avisos deseja receber
          </Text>
        </View>
      </View>

      {/* NOTIFICAÇÕES */}

      <View style={styles.card}>
        <OpcaoNotificacao
          icone="notifications-outline"
          titulo="Notificações gerais"
          descricao="Ative ou desative todas as notificações"
          chave="gerais"
        />

        <View style={styles.divisor} />

        <OpcaoNotificacao
          icone="bag-handle-outline"
          titulo="Pedidos"
          descricao="Atualizações sobre seus pedidos"
          chave="pedidos"
        />

        <View style={styles.divisor} />

        <OpcaoNotificacao
          icone="calendar-outline"
          titulo="Vencimento de parcelas"
          descricao="Lembretes sobre parcelas próximas do vencimento"
          chave="vencimentos"
        />

        <View style={styles.divisor} />

        <OpcaoNotificacao
          icone="checkmark-circle-outline"
          titulo="Pedido aprovado"
          descricao="Aviso quando seu pedido for aprovado"
          chave="aprovado"
        />

        <View style={styles.divisor} />

        <OpcaoNotificacao
          icone="close-circle-outline"
          titulo="Pedido recusado"
          descricao="Aviso quando seu pedido for recusado"
          chave="recusado"
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#c48b9f" />

        <Text style={styles.infoTexto}>
          Você pode alterar essas opções a qualquer momento.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5f2',
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  headerIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: '#f3dfe6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  headerTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#302323',
  },

  headerSubtitulo: {
    marginTop: 3,
    fontSize: 13,
    color: '#888',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  opcao: {
    minHeight: 78,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconeContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#fdf2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  info: {
    flex: 1,
    marginRight: 10,
  },

  titulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d3033',
  },

  descricao: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  divisor: {
    height: 1,
    backgroundColor: '#f1e8eb',
    marginLeft: 73,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 14,
    backgroundColor: '#fdf2f5',
    borderRadius: 12,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 8,
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f5f2',
  },

  loadingTexto: {
    marginTop: 10,
    color: '#777',
  },
});
