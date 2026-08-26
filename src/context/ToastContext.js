import { createContext, useContext, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    tipo: 'success',
  });

  const mostrarToast = (message, tipo = 'success') => {
    setToast({
      visible: true,
      message,
      tipo,
    });

    setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        visible: false,
      }));
    }, 2500);
  };

  const icones = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loja: '💎',
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {toast.visible && (
        <View style={[styles.toast, styles[toast.tipo]]}>
          <Text style={styles.texto}>
            {icones[toast.tipo]} {toast.message}
          </Text>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }

  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',

    // 📍 MESMA POSIÇÃO EM TODAS AS TELAS
    top: 55,
    left: 20,
    right: 20,

    paddingVertical: 14,
    paddingHorizontal: 18,

    borderRadius: 14,

    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,

    zIndex: 9999,
  },

  success: {
    backgroundColor: '#2E7D32', // Verde
  },

  error: {
    backgroundColor: '#D32F2F', // Vermelho
  },

  warning: {
    backgroundColor: '#F57C00', // Laranja
  },

  info: {
    backgroundColor: '#1976D2', // Azul
  },

  loja: {
    backgroundColor: '#C48B9F', // Rosa da Loja Joias
  },

  texto: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
