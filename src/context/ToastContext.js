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

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}

      {toast.visible && (
        <View style={[styles.toast, tipoStyle(toast.tipo)]}>
          <Text style={styles.texto}>{toast.message}</Text>
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

function tipoStyle(tipo) {
  if (tipo === 'error') {
    return styles.error;
  }

  return styles.success;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,

    elevation: 8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,

    zIndex: 9999,
  },

  success: {
    backgroundColor: '#B8860B',
  },

  error: {
    backgroundColor: '#8B5E3C',
  },

  texto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
