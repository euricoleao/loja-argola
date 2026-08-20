import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TermosUsoScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      {/* CABEÇALHO */}

      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="document-text-outline" size={29} color="#c48b9f" />
        </View>

        <View>
          <Text style={styles.headerTitulo}>Termos de uso</Text>

          <Text style={styles.headerSubtitulo}>
            Regras e condições de utilização
          </Text>
        </View>
      </View>

      {/* INTRODUÇÃO */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>1. Aceitação dos termos</Text>

        <Text style={styles.texto}>
          Ao utilizar este aplicativo, o usuário declara estar de acordo com os
          presentes Termos de Uso e com as regras estabelecidas para utilização
          da plataforma.
        </Text>
      </View>

      {/* CONTA */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>2. Cadastro e conta</Text>

        <Text style={styles.texto}>
          Para utilizar determinados recursos do aplicativo, poderá ser
          necessário possuir uma conta cadastrada.
        </Text>

        <Text style={styles.texto}>
          O usuário é responsável por manter seus dados atualizados e por
          proteger suas informações de acesso.
        </Text>
      </View>

      {/* PEDIDOS */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>3. Pedidos e compras</Text>

        <Text style={styles.texto}>
          Os produtos disponíveis no aplicativo estão sujeitos à disponibilidade
          de estoque.
        </Text>

        <Text style={styles.texto}>
          O pedido somente será considerado confirmado após a aprovação do
          pagamento ou autorização correspondente.
        </Text>
      </View>

      {/* PAGAMENTOS */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>4. Pagamentos</Text>

        <Text style={styles.texto}>
          Os pagamentos deverão ser realizados utilizando as formas
          disponibilizadas no aplicativo.
        </Text>

        <Text style={styles.texto}>
          Para compras realizadas a prazo, a aprovação estará sujeita às
          condições e limites definidos pela loja.
        </Text>
      </View>

      {/* RESPONSABILIDADE */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>5. Responsabilidades do usuário</Text>

        <Text style={styles.texto}>
          O usuário deve fornecer informações verdadeiras, completas e
          atualizadas ao utilizar o aplicativo.
        </Text>

        <Text style={styles.texto}>
          Também é responsabilidade do usuário utilizar a plataforma de forma
          adequada e respeitar a legislação aplicável.
        </Text>
      </View>

      {/* PRIVACIDADE */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>6. Privacidade</Text>

        <Text style={styles.texto}>
          As informações fornecidas pelo usuário serão tratadas de acordo com a
          Política de Privacidade da aplicação.
        </Text>
      </View>

      {/* ALTERAÇÕES */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>7. Alterações dos termos</Text>

        <Text style={styles.texto}>
          Estes termos poderão ser atualizados sempre que necessário para
          refletir mudanças no aplicativo, nos serviços oferecidos ou na
          legislação aplicável.
        </Text>
      </View>

      {/* CONTATO */}

      <View style={styles.card}>
        <Text style={styles.tituloSecao}>8. Contato</Text>

        <Text style={styles.texto}>
          Em caso de dúvidas sobre estes termos, o usuário poderá entrar em
          contato com a loja através dos canais oficiais disponibilizados no
          aplicativo.
        </Text>
      </View>

      <View style={styles.rodape}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#c48b9f" />

        <Text style={styles.rodapeTexto}>
          Última atualização: agosto de 2026
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
    fontSize: 23,
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

  tituloSecao: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3d3033',
    marginBottom: 10,
  },

  texto: {
    fontSize: 14,
    lineHeight: 21,
    color: '#777',
    marginBottom: 8,
  },

  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    padding: 15,
  },

  rodapeTexto: {
    marginLeft: 7,
    fontSize: 12,
    color: '#999',
  },
});
