import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const TEMPO_EXPIRACAO = 2 * 60 * 60 * 1000; // 2 horas

  useEffect(() => {
    carregarCarrinho();
  }, []);

  useEffect(() => {
    salvarCarrinho();
  }, [carrinho]);

  async function salvarCarrinho() {
    try {
      await AsyncStorage.setItem(
        '@argola_carrinho',
        JSON.stringify({
          itens: carrinho,
          data: Date.now(),
        }),
      );
    } catch (error) {
      console.log('Erro ao salvar carrinho:', error);
    }
  }
  async function carregarCarrinho() {
    try {
      const dados = await AsyncStorage.getItem('@argola_carrinho');

      if (!dados) return;

      const carrinhoSalvo = JSON.parse(dados);

      const agora = Date.now();

      // Verifica se expirou
      if (agora - carrinhoSalvo.data > TEMPO_EXPIRACAO) {
        console.log('🗑️ Carrinho expirado.');

        await AsyncStorage.removeItem('@argola_carrinho');
        return;
      }

      setCarrinho(carrinhoSalvo.itens);

      console.log(
        `🛒 Carrinho restaurado (${carrinhoSalvo.itens.length} itens).`,
      );
    } catch (error) {
      console.log('Erro ao carregar carrinho:', error);
    }
  }

  function adicionarAoCarrinho(produto) {
    setCarrinho((prev) => {
      const existe = prev.find((item) => item.id === produto.id);

      const estoque = Number(produto.quantidade || 0);

      if (estoque <= 0) {
        console.log('❌ Produto sem estoque:', produto.nome);
        return prev;
      }

      // Produto já está no carrinho
      if (existe) {
        if (existe.quantidade >= estoque) {
          console.log(`⚠️ Limite de estoque atingido: ${produto.nome}`);

          return prev;
        }

        return prev.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                quantidadeEstoque: estoque,
              }
            : item,
        );
      }

      // Primeiro produto no carrinho
      return [
        ...prev,
        {
          ...produto,
          quantidade: 1,

          // Guarda o estoque original
          quantidadeEstoque: estoque,
        },
      ];
    });
  }

  function aumentarQuantidade(id) {
    setCarrinho((prev) =>
      prev.map((item) => {
        const estoque = Number(item.quantidadeEstoque ?? item.quantidade ?? 0);

        if (item.id !== id) {
          return item;
        }

        if (item.quantidade >= estoque) {
          console.log(`⚠️ Estoque máximo atingido: ${item.nome}`);

          return item;
        }

        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      }),
    );
  }

  function diminuirQuantidade(id) {
    setCarrinho((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantidade: item.quantidade - 1,
              }
            : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  }

  function removerDoCarrinho(id) {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  }

  async function limparCarrinho() {
    setCarrinho([]);

    await AsyncStorage.removeItem('@argola_carrinho');
  }

  return (
    <CartContext.Provider
      value={{
        carrinho,
        adicionarAoCarrinho,
        removerDoCarrinho,
        aumentarQuantidade,
        diminuirQuantidade,
        limparCarrinho,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
// antigo
// import { createContext, useState } from "react";

// export const CartContext = createContext();

// export function CartProvider({ children }) {
//   const [carrinho, setCarrinho] = useState([]);

//   function adicionarAoCarrinho(produto) {
//     setCarrinho(prev => {
//       const existe = prev.find(item => item.id === produto.id);

//       if (existe) {
//         return prev.map(item =>
//           item.id === produto.id
//             ? { ...item, quantidade: item.quantidade + 1 }
//             : item
//         );
//       }

//       return [...prev, { ...produto, quantidade: 1 }];
//     });
//   }

//     // Funções para aumentar/diminuir quantidade (opcional)
//   function aumentarQuantidade(id) {
//   setCarrinho(prev =>
//     prev.map(item =>
//       item.id === id
//         ? { ...item, quantidade: item.quantidade + 1 }
//         : item
//     )
//   );
// }

// function diminuirQuantidade(id) {
//   setCarrinho(prev =>
//     prev
//       .map(item =>
//         item.id === id
//           ? { ...item, quantidade: item.quantidade - 1 }
//           : item
//       )
//       .filter(item => item.quantidade > 0)
//   );
// }

//   function removerDoCarrinho(id) {
//     setCarrinho(prev => prev.filter(item => item.id !== id));
//   }

// function limparCarrinho() {
//   setCarrinho([]);
// }

//   return (
//     <CartContext.Provider value={{

//       carrinho,
//       adicionarAoCarrinho,
//       removerDoCarrinho,
//        aumentarQuantidade,
//        diminuirQuantidade,
//         limparCarrinho
//     }}>
//       {children}
//     </CartContext.Provider>
//   );
// }
