import { createContext, useState } from "react";


export const CartContext = createContext();




export function CartProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);

  function adicionarAoCarrinho(produto) {
    setCarrinho(prev => {
      const existe = prev.find(item => item.id === produto.id);

      if (existe) {
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

    // Funções para aumentar/diminuir quantidade (opcional)
  function aumentarQuantidade(id) {
  setCarrinho(prev =>
    prev.map(item =>
      item.id === id
        ? { ...item, quantidade: item.quantidade + 1 }
        : item
    )
  );
}

function diminuirQuantidade(id) {
  setCarrinho(prev =>
    prev
      .map(item =>
        item.id === id
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      )
      .filter(item => item.quantidade > 0)
  );
}

  function removerDoCarrinho(id) {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  }

function limparCarrinho() {
  setCarrinho([]);
}

  return (
    <CartContext.Provider value={{

      
      carrinho,
      adicionarAoCarrinho,
      removerDoCarrinho,
       aumentarQuantidade,
       diminuirQuantidade,
        limparCarrinho
    }}>
      {children}
    </CartContext.Provider>
  );
}



