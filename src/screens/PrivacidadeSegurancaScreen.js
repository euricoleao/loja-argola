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

export default function PrivacidadeSegurancaScreen() {
  const navigation = useNavigation();

  function dadosPrivacidade() {
    Alert.alert(
      'Dados e privacidade 🛡️',
      'Aqui você poderá consultar como seus dados são utilizados e armazenados.',
    );
  }

  function sessoesDispositivos() {
    Alert.alert(
      'Sessões e dispositivos 📱',
      'O gerenciamento de dispositivos estará disponível em breve.',
    );
  }

  function excluirConta() {
    Alert.alert(
      'Excluir minha conta',
      'Esta ação é permanente. Todos os seus dados e informações da conta poderão ser removidos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Excluir conta',
              'A confirmação definitiva da exclusão será adicionada posteriormente.',
            );
          },
        },
      ],
    );
  }

  function ItemSeguranca({
    icone,
    titulo,
    descricao,
    onPress,
    perigo = false,
  }) {
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <View style={[styles.iconeContainer, perigo && styles.iconePerigo]}>
          <Ionicons
            name={icone}
            size={23}
            color={perigo ? '#c0392b' : '#c48b9f'}
          />
        </View>

        <View style={styles.textos}>
          <Text style={[styles.tituloItem, perigo && styles.tituloPerigo]}>
            {titulo}
          </Text>

          <Text style={styles.descricaoItem}>{descricao}</Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={perigo ? '#c0392b' : '#b9a2a9'}
        />
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
          <Ionicons name="shield-checkmark-outline" size={29} color="#c48b9f" />
        </View>

        <View>
          <Text style={styles.headerTitulo}>Privacidade e segurança</Text>

          <Text style={styles.headerSubtitulo}>
            Proteja sua conta e seus dados
          </Text>
        </View>
      </View>

      {/* SEGURANÇA */}

      <Text style={styles.secao}>SEGURANÇA</Text>

      <View style={styles.card}>
        <ItemSeguranca
          icone="phone-portrait-outline"
          titulo="Sessões e dispositivos"
          descricao="Gerencie os dispositivos conectados"
          onPress={sessoesDispositivos}
        />

        <View style={styles.divisor} />

        <ItemSeguranca
          icone="lock-closed-outline"
          titulo="Segurança da conta"
          descricao="Informações sobre a proteção da sua conta"
          onPress={() =>
            Alert.alert(
              'Segurança da conta 🔒',
              'Sua conta possui autenticação e proteção por senha.',
            )
          }
        />
      </View>

      {/* PRIVACIDADE */}

      <Text style={styles.secao}>PRIVACIDADE</Text>

      <View style={styles.card}>
        <ItemSeguranca
          icone="shield-outline"
          titulo="Dados e privacidade"
          descricao="Saiba como seus dados são utilizados"
          onPress={dadosPrivacidade}
        />

        <View style={styles.divisor} />

        <ItemSeguranca
          icone="document-text-outline"
          titulo="Política de privacidade"
          descricao="Consulte nossa política de privacidade"
          onPress={() =>
            Alert.alert(
              'Política de privacidade',
              'A política de privacidade será adicionada nesta área.',
            )
          }
        />
      </View>

      {/* CONTA */}

      <Text style={styles.secao}>CONTA</Text>

      <View style={styles.card}>
        <ItemSeguranca
          icone="trash-outline"
          titulo="Excluir minha conta"
          descricao="Remover permanentemente sua conta"
          onPress={excluirConta}
          perigo
        />
      </View>

      {/* AVISO */}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={21} color="#c48b9f" />

        <Text style={styles.infoTexto}>
          Nunca compartilhe sua senha ou códigos de acesso com outras pessoas.
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
    fontSize: 21,
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
    minHeight: 75,
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

  iconePerigo: {
    backgroundColor: '#fff0f0',
  },

  textos: {
    flex: 1,
    marginRight: 10,
  },

  tituloItem: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3d3033',
  },

  tituloPerigo: {
    color: '#c0392b',
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

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
