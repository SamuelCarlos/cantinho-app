import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

export default function AuthenticationPage({
  navigation,
}: {
  navigation: StackNavigationProp<any, any>;
}): JSX.Element {
  return (
    <View style={styles.container}>
      <Image source={require("./cantinho-logo.png")} style={styles.logo} />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.push("SignIn")}
      >
        <Text style={styles.text}>Entrar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.push("SignUp")}
      >
        <Text style={styles.text}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: {
    color: "#fff",
  },
  button: {
    width: "60%",
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6200AF",
    borderRadius: 100,
    marginTop: 20,
  },
  logo: {
    width: 230,
    height: 200,
    resizeMode: "contain",
  },
});
