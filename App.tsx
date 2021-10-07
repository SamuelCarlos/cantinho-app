import React from "react";

import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/contexts/auth";

import Buypage from "./src/pages/buypage";
import SettingsPage from "./src/pages/settings";
import EditPage from "./src/pages/inventory/edit";
import ItemPage from "./src/pages/inventory/item";
import Homepage from "./src/pages/inventory/homepage";
import SignInPage from "./src/pages/authentication/SignIn";
import SignUpPage from "./src/pages/authentication/SignUp";
import BarcodeReader from "./src/components/BarcodeReader";
import AuthenticationPage from "./src/pages/authentication";
import TokenConfirmPage from "./src/pages/authentication/ConfirmToken";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { useAuth } from "./src/hooks/useAuth";
import Footer from "./src/components/footer";

const InventoryStack = createStackNavigator();
const InventoryStackPage = () => (
  <InventoryStack.Navigator screenOptions={{ headerShown: false }}>
    <InventoryStack.Screen name="Estoque Home" component={Homepage} />
    <InventoryStack.Screen name="BarcodeReader" component={BarcodeReader} />
    <InventoryStack.Screen name="Item" component={ItemPage} />
    <InventoryStack.Screen name="Edit" component={EditPage} />
  </InventoryStack.Navigator>
);

const AppStack = createBottomTabNavigator();
const AppStackPage = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }} tabBar={Footer}>
    <AppStack.Screen name="Estoque" component={InventoryStackPage} />
    <AppStack.Screen name="Vender" component={Buypage} />
    <AppStack.Screen name="Adicionar" component={Buypage} />
    <AppStack.Screen name="Perfil" component={SettingsPage} />
  </AppStack.Navigator>
);

const AuthStack = createStackNavigator();
const AuthStackPage = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="AuthMenu" component={AuthenticationPage} />
    <AuthStack.Screen name="SignIn" component={SignInPage} />
    <AuthStack.Screen name="SignUp" component={SignUpPage} />
    <AuthStack.Screen name="TokenConfirm" component={TokenConfirmPage} />
  </AuthStack.Navigator>
);

const MainStack = createStackNavigator();
const MainStackComponent = () => {
  const { token } = useAuth();
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <MainStack.Screen name="Main" component={AppStackPage} />
      ) : (
        <MainStack.Screen name="Authentication" component={AuthStackPage} />
      )}
    </MainStack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <MainStackComponent />
      </NavigationContainer>
    </AuthProvider>
  );
}
