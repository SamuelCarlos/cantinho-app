import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const FooterButton = ({ title, icon }: { title: string; icon: string }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={() => console.log("test")}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function Footer() {
  return (
    <View style={styles.footer}>
      {FooterButton({ title: "Estoque", icon: "/assets/icons/list.svg" })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    height: 50,
    backgroundColor: "#6200AF",
    width: "100%",
  },
  button: {
    width: "33.3%",
    backgroundColor: "#6200AF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#ffffff",
    fontFamily: "Montserrat-Regular",
    fontWeight: "400",
    fontSize: 48,
  },
});
