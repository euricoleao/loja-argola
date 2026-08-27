import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function PerfilScreen({ navigation }) {
  const { usuario, logout, setUsuario } = useContext(AuthContext);
  useEffect(() => {
    console.log('USUARIO PERFIL:', usuario);
  }, [usuario]);

  const [totalPedidos, setTotalPedidos] = useState(0);
  const [totalFavoritos, setTotalFavoritos] = useState(0);
  const [totalCompras, setTotalCompras] = useState(0);
  const [imagem, setImagem] = useState(null);
  const [naoLidas, setNaoLidas] = useState(0);
  const [zoomVisivel, setZoomVisivel] = useState(false);
  const ultimoToque = useRef(0);

  const handleDoubleTap = () => {
    const agora = Date.now();

    if (agora - ultimoToque.current < 300) {
      setZoomVisivel(true);
    }

    ultimoToque.current = agora;
  };

  useEffect(() => {
    if (!usuario?.uid) return;

    const notificacoesRef = collection(
      db,
      'usuarios',
      usuario.uid,
      'notificacoes',
    );

    const q = query(notificacoesRef, where('lida', '==', false));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNaoLidas(snapshot.size);
    });

    return () => unsubscribe();
  }, [usuario?.uid]);

  useEffect(() => {
    carregarDados();
  }, []);

  async function escolherFoto() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0]);

      // já faz upload automaticamente
      await salvarFotoPerfil(result.assets[0]);
    }
  }

  async function carregarDados() {
    if (!usuario) return;

    const userRef = doc(db, 'usuarios', usuario.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const dados = userSnap.data();

      setUsuario((prev) => ({
        ...prev,
        fotoUrl: dados.fotoUrl,
      }));
    }

    try {
      const q = query(
        collection(db, 'pedidos'),
        where('uid', '==', usuario.uid),
      );

      const snapshot = await getDocs(q);

      setTotalPedidos(snapshot.size);

      let total = 0;

      snapshot.forEach((doc) => {
        total += Number(doc.data().total || 0);
      });

      setTotalCompras(total);

      const favoritosQuery = query(
        collection(db, 'favorites'),
        where('uid', '==', usuario.uid),
      );

      const favoritosSnapshot = await getDocs(favoritosQuery);

      setTotalFavoritos(favoritosSnapshot.size);
    } catch (e) {
      console.log(e);
    }
  }
  // const escolherFoto = async () => {
  //   const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

  //   if (!permissao.granted) {
  //     alert('Permita o acesso à galeria.');
  //     return;
  //   }

  //   const resultado = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [1, 1],
  //     quality: 0.7,
  //   });

  //   if (!resultado.canceled) {
  //     const imagem = resultado.assets[0].uri;

  //     enviarFoto(imagem);
  //   }
  // };

  // const enviarFoto = async (uri) => {
  //   try {
  //     const response = await fetch(uri);
  //     const blob = await response.blob();

  //     const nomeArquivo = `usuarios/${usuario.uid}.jpg`;

  //     const imagemRef = ref(storage, nomeArquivo);

  //     await uploadBytes(imagemRef, blob);

  //     const urlFoto = await getDownloadURL(imagemRef);

  //     await updateDoc(doc(db, 'usuarios', usuario.uid), {
  //       fotoUrl: urlFoto,
  //     });

  //     setUsuario({
  //       ...usuario,
  //       fotoUrl: urlFoto,
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  async function salvarFotoPerfil(imagemSelecionada) {
    try {
      const formData = new FormData();

      formData.append('file', {
        uri: imagemSelecionada.uri,
        type: 'image/jpeg',
        name: 'perfil.jpg',
      });

      formData.append('upload_preset', 'products');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dnbcqe62j/image/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      const data = await response.json();

      await updateDoc(doc(db, 'usuarios', usuario.uid), {
        fotoUrl: data.secure_url,
      });

      carregarDados(); // atualiza a tela
    } catch (erro) {
      console.log(erro);
    }
  }

  function falarComALoja() {
    const telefoneLoja = '5577981156809'; // 👈 coloque o WhatsApp da loja

    const mensagem = encodeURIComponent(
      'Olá! Gostaria de falar com a loja. 😊',
    );

    const url = `https://wa.me/${telefoneLoja}?text=${mensagem}`;

    Linking.openURL(url);
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}

      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {/* Foto do perfil - 2 toques para ampliar */}
          <Pressable onPress={handleDoubleTap} style={styles.avatar}>
            {usuario?.fotoUrl ? (
              <Image
                source={{ uri: usuario.fotoUrl }}
                style={styles.avatarImagem}
              />
            ) : (
              <Text style={styles.avatarTexto}>{usuario?.nome?.charAt(0)}</Text>
            )}
          </Pressable>

          {/* Editar foto */}
          <TouchableOpacity style={styles.botaoEditar} onPress={escolherFoto}>
            <MaterialIcons
              name="edit"
              size={12}
              color="#fff"
              activeOpacity={0.7}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.nome}>
          {`${usuario?.nome || ''} ${usuario?.sobrenome || ''}`}
        </Text>

        <Text style={styles.email}>{usuario?.email}</Text>
        <Text style={styles.email}>💎 Cliente Ouro</Text>
      </View>

      <ScrollView>
        <View style={styles.cardsContainer}>
          <View style={styles.cardInfo}>
            <Text style={styles.numero}>{totalPedidos}</Text>
            <Text style={styles.label}>📦 Pedidos</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.numero}>{totalFavoritos}</Text>
            <Text style={styles.label}>❤️ Favoritos</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.numerob}>R$ {totalCompras.toFixed(2)}</Text>
            <Text style={styles.label}>💰 Compras</Text>
          </View>
        </View>

        {/* Meus pedidos */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('MeusPedidos')}
        >
          <Text style={styles.texto}>📦 Meus Pedidos</Text>

          <Text>›</Text>
        </TouchableOpacity>

        {/* Meus favoritos */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Favoritos')}
        >
          <Text style={styles.texto}>❤️ Favoritos</Text>

          <Text>›</Text>
        </TouchableOpacity>

        {/* Meus endereços */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('MeusEnderecos')}
        >
          <Text style={styles.texto}>📍 Meus Endereços</Text>
          <Text>›</Text>
        </TouchableOpacity>

        {/* Meus pagamentos */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('FormasPagamento')}
        >
          <Text style={styles.texto}>💳 Formas de pagamento</Text>

          <Text style={styles.texto}>›</Text>
        </TouchableOpacity>

        {/* Minhas notificações */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Notificacoes')}
        >
          <View style={styles.notificacaoLinha}>
            <Text style={styles.texto}>🔔 Notificações</Text>

            {naoLidas > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeTexto}>
                  {naoLidas > 99 ? '99+' : naoLidas}
                </Text>
              </View>
            )}
          </View>

          <Text>›</Text>
        </TouchableOpacity>

        {/* Falar com a loja */}
        <TouchableOpacity style={styles.item} onPress={falarComALoja}>
          <Text style={styles.texto}>💬 Falar com a Loja</Text>
          <Text>›</Text>
        </TouchableOpacity>

        {/* minhas configuraçôes*/}
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Configuracoes')}
        >
          <Text style={styles.texto}>
            <Ionicons name="settings-outline" size={24} color="#c48b9f" />{' '}
            Configurações
          </Text>
          <Text>›</Text>
        </TouchableOpacity>

        {/* Sair da conta */}
        <TouchableOpacity style={styles.sair} onPress={logout}>
          <Text style={styles.sairTexto}>🚪 Sair da Conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={zoomVisivel} transparent animationType="fade">
        <Pressable
          style={styles.modalZoom}
          onPress={() => setZoomVisivel(false)}
        >
          <Image
            source={{ uri: usuario?.fotoUrl }}
            style={styles.fotoZoom}
            resizeMode="contain"
          />

          <Text style={styles.textoFechar}>Toque para fechar</Text>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    backgroundColor: '#C48B9F',
    alignItems: 'center',
    paddingVertical: 35,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    marginBottom: 2,
    marginHorizontal: 5,
  },

  nome: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
  },

  email: {
    color: '#F8EDEB',
    marginTop: 5,
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 20,
    marginBottom: 15,
  },

  item: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 20,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    elevation: 3,
  },

  texto: {
    fontSize: 16,
  },

  sair: {
    margin: 20,
    backgroundColor: '#C48B9F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  sairTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -25,
    marginBottom: 20,
  },

  cardInfo: {
    backgroundColor: '#fff',
    width: 105,
    height: 95,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginTop: 32,
  },

  numero: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  numerob: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },

  label: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 45,
    backgroundColor: '#d8a0a8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#D4AF37',
  },

  avatarTexto: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },

  avatarContainer: {
    width: 90,
    height: 90,
    position: 'relative',
  },

  avatarImagem: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },

  botaoEditar: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 14,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  notificacaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C48B9F',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 5,
  },

  badgeTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalZoom: {
    flex: 1,
    backgroundColor: 'rgba(196,139,159,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fotoZoom: {
    width: '80%',
    height: '50%',
    borderRadius: 25, // 👈 Arredonda as pontas
  },

  textoFechar: {
    color: '#FFF',
    marginTop: -50,
    fontSize: 16,
    fontWeight: '600',
  },
});
