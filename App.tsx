import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import "./global.css";

import Footer from "./src/components/footer";

export default function App() {
  return (
    <View style={styles.container}>
      <Text>GUSTAVO TETA</Text>
      <StatusBar style="auto" />
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
});
