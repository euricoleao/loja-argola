import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";

import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { CartProvider } from "./src/context/CartContext";

import Routes from "./src/Routes";


export default function App() {

const [fontsLoaded] = useFonts({
  Playfair: require("./assets/fonts/PlayfairDisplay-VariableFont_wght.ttf"),
});
 if (!fontsLoaded) {
  return (
 
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Carregando fontes...</Text>
    </View>
  );
}
 

  return (



    
    <AuthProvider>
    <CartProvider>
      <LinearGradient colors={["#f8e1e7", "#f1c6d4", "#dba0b4"]}
  style={{ flex: 1 }}
>
      <NavigationContainer>

      <Routes  />
      </NavigationContainer>
      </LinearGradient>
    </CartProvider>
    </AuthProvider>
  );
}