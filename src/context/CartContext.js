import { createContext, useState } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);

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

  function limparCarrinho() {
    setCarrinho([]);
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
