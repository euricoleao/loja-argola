import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";

import { CartProvider } from "./src/context/CartContext";

import Routes from "./src/Routes";


export default function App() {

 

  return (
    <AuthProvider>
    <CartProvider>
      <NavigationContainer>

      <Routes  />
      </NavigationContainer>
    </CartProvider>
    </AuthProvider>
  );
}