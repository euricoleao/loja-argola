import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SobreAplicativoScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* LOGO / ÍCONE */}

      <View style={styles.logoContainer}>
        <View style={styles.logo}>
          <Ionicons name="bag-handle-outline" size={55} color="#c48b9f" />
        </View>

        <Text style={styles.nomeApp}>Sua Loja de Compras</Text>

        <Text style={styles.subtitulo}>
          Sua experiência de compra, mais simples.
        </Text>
      </View>

      {/* VERSÃO */}

      <View style={styles.card}>
        <View style={styles.linha}>
          <View style={styles.iconeContainer}>
            <Ionicons name="phone-portrait-outline" size={22} color="#c48b9f" />
          </View>

          <View style={styles.informacao}>
            <Text style={styles.titulo}>Versão do aplicativo</Text>

            <Text style={styles.valor}>1.0.0</Text>
          </View>
        </View>
      </View>

      {/* SOBRE */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>Sobre o aplicativo</Text>

        <Text style={styles.texto}>
          O Sua Loja de Compras foi desenvolvido para proporcionar uma
          experiência simples, rápida e segura para realizar compras, acompanhar
          pedidos, pagamentos e notificações.
        </Text>
      </View>

      {/* DESENVOLVEDOR */}

      <View style={styles.card}>
        <View style={styles.linha}>
          <View style={styles.iconeContainer}>
            <Ionicons name="code-slash-outline" size={22} color="#c48b9f" />
          </View>

          <View style={styles.informacao}>
            <Text style={styles.pequenoTitulo}>Desenvolvido por</Text>

            <Text style={styles.empresa}>LionTech 💻</Text>

            <Text style={styles.descricao}>
              Tecnologia e desenvolvimento de soluções digitais.
            </Text>
          </View>
        </View>
      </View>

      {/* INFORMAÇÕES */}

      <View style={styles.infoBox}>
        <Ionicons name="shield-checkmark-outline" size={22} color="#c48b9f" />

        <Text style={styles.infoTexto}>
          Este aplicativo foi desenvolvido com foco em segurança, praticidade e
          uma experiência simples para nossos clientes.
        </Text>
      </View>

      {/* RODAPÉ */}

      <Text style={styles.direitos}>© 2026 LionTech</Text>

      <Text style={styles.direitos}>Todos os direitos reservados.</Text>
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

  logoContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 25,
  },

  logo: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: '#f3dfe6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,

    elevation: 4,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  nomeApp: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#302323',
  },

  subtitulo: {
    fontSize: 13,
    color: '#888',
    marginTop: 5,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 15,

    elevation: 3,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,

    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  linha: {
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

  informacao: {
    flex: 1,
  },

  titulo: {
    fontSize: 13,
    color: '#999',
  },

  valor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d3033',
    marginTop: 3,
  },

  tituloSecao: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#3d3033',
    marginBottom: 10,
  },

  texto: {
    fontSize: 14,
    color: '#777',
    lineHeight: 21,
  },

  pequenoTitulo: {
    fontSize: 12,
    color: '#999',
  },

  empresa: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#c48b9f',
    marginTop: 3,
  },

  descricao: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf2f5',
    padding: 15,
    borderRadius: 14,
    marginTop: 5,
  },

  infoTexto: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    color: '#777',
    lineHeight: 18,
  },

  direitos: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 12,
    marginTop: 12,
  },
});
