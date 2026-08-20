import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConfiguracoesScreen() {
  const navigation = useNavigation();

  function abrirDadosConta() {
    navigation.navigate('DadosConta');
  }

  function alterarSenha() {
    navigation.navigate('AlterarSenha');
  }

  function abrirAparencia() {
    Alert.alert(
      'Aparência 🌙',
      'A opção de personalização da aparência estará disponível em breve.',
      [
        {
          text: 'OK',
        },
      ],
    );
  }

  function abrirGerenciarNotificacoes() {
    navigation.navigate('GerenciarNotificacoes');
  }

  function abrirLembretes() {
    Alert.alert(
      'Lembretes de pagamento',
      'Aqui vamos permitir que você ative ou desative os lembretes de vencimento das parcelas.',
    );
  }

  function sairDaConta() {
    Alert.alert('Sair da conta', 'Deseja realmente sair da sua conta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          // Vamos conectar ao AuthContext depois
          console.log('🚪 Sair da conta');
        },
      },
    ]);
  }

  function ItemConfiguracao({ icone, titulo, descricao, onPress }) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={styles.iconeContainer}>
          <Ionicons name={icone} size={23} color="#c48b9f" />
        </View>

        <View style={styles.textos}>
          <Text style={styles.tituloItem}>{titulo}</Text>

          {descricao ? (
            <Text style={styles.descricaoItem}>{descricao}</Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={20} color="#b9a2a9" />
      </TouchableOpacity>
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
          <Ionicons name="settings-outline" size={28} color="#c48b9f" />
        </View>

        <View>
          <Text style={styles.headerTitulo}>Configurações</Text>

          <Text style={styles.headerSubtitulo}>
            Personalize sua experiência
          </Text>
        </View>
      </View>

      {/* CONTA */}

      <Text style={styles.secao}>CONTA</Text>

      <View style={styles.card}>
        <ItemConfiguracao
          icone="person-outline"
          titulo="Dados da conta"
          descricao="Nome, telefone e e-mail"
          onPress={abrirDadosConta}
        />

        <View style={styles.divisor} />

        <ItemConfiguracao
          icone="lock-closed-outline"
          titulo="Alterar senha"
          descricao="Altere sua senha de acesso"
          onPress={alterarSenha}
        />
      </View>

      {/* PERSONALIZAÇÃO */}

      <Text style={styles.secao}>PERSONALIZAÇÃO</Text>

      <View style={styles.card}>
        <ItemConfiguracao
          icone="moon-outline"
          titulo="Aparência"
          descricao="Claro, escuro ou automático"
          onPress={abrirAparencia}
        />
      </View>

      {/* NOTIFICAÇÕES */}

      <Text style={styles.secao}>NOTIFICAÇÕES</Text>

      <View style={styles.card}>
        <ItemConfiguracao
          icone="notifications-outline"
          titulo="Gerenciar notificações"
          descricao="Controle suas notificações"
          onPress={abrirGerenciarNotificacoes}
        />

        <View style={styles.divisor} />

        <ItemConfiguracao
          icone="calendar-outline"
          titulo="Lembretes de pagamento"
          descricao="Avisos de vencimento das parcelas"
          onPress={abrirLembretes}
        />
      </View>

      {/* SEGURANÇA */}

      <Text style={styles.secao}>SEGURANÇA</Text>

      <View style={styles.card}>
        <ItemConfiguracao
          icone="shield-checkmark-outline"
          titulo="Privacidade e segurança"
          descricao="Proteja sua conta e seus dados"
          onPress={() => navigation.navigate('PrivacidadeSeguranca')}
        />

        <View style={styles.divisor} />

        <ItemConfiguracao
          icone="document-text-outline"
          titulo="Termos de uso"
          descricao="Leia os termos do aplicativo"
          onPress={() => navigation.navigate('TermosUso')}
        />

        <View style={styles.divisor} />

        <ItemConfiguracao
          icone="information-circle-outline"
          titulo="Sobre o aplicativo"
          descricao="Informações, versão e desenvolvedor"
          onPress={() => navigation.navigate('SobreAplicativo')}
        />
      </View>

      {/* SAIR */}

      <TouchableOpacity
        style={styles.botaoSair}
        onPress={sairDaConta}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={22} color="#c0392b" />

        <Text style={styles.textoSair}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.versao}>Versão 1.0.0</Text>
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
    fontSize: 25,
    fontWeight: 'bold',
    color: '#302323',
  },

  headerSubtitulo: {
    marginTop: 3,
    fontSize: 13,
    color: '#888',
  },

  secao: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a06a7d',
    marginBottom: 8,
    marginLeft: 5,
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 22,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  item: {
    minHeight: 72,
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

  textos: {
    flex: 1,
  },

  tituloItem: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d3033',
  },

  descricaoItem: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  divisor: {
    height: 1,
    backgroundColor: '#f1e8eb',
    marginLeft: 73,
  },

  botaoSair: {
    height: 55,
    borderRadius: 14,
    backgroundColor: '#fff0f0',
    borderWidth: 1,
    borderColor: '#f0cccc',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },

  textoSair: {
    marginLeft: 8,
    color: '#c0392b',
    fontWeight: 'bold',
    fontSize: 15,
  },

  versao: {
    textAlign: 'center',
    marginTop: 18,
    color: '#aaa',
    fontSize: 12,
  },
});
