import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";

const FooterButton = ({
  title,
  icon,
}: {
  title: string;
  icon: ImageSourcePropType;
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={() => console.log("test")}>
      <Image source={icon} style={styles.icon} />
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default function Footer() {
  return (
    <View style={styles.footer}>
      {FooterButton({ title: "Estoque", icon: require("./list.png") })}
      {FooterButton({
        title: "Vender",
        icon: require("./attach_money.png"),
      })}
      {FooterButton({ title: "Adicionar", icon: require("./add.png") })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    display: "flex",
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    height: 70,
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
    fontWeight: "400",
    fontSize: 16,
  },
  icon: {
    width: 40,
    height: 40,
  },
});
