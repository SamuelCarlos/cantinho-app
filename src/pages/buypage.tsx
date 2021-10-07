import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

export const Buypage = ({}) => {
  return (
    <View style={styles.container}>
      <Text>TESTE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    position: "relative",
  },
  text: {
    color: "#dadada",
    position: "absolute",
    top: 0,
  },
  main: {
    marginTop: 100,
    height: 250,
    width: "96%",
    marginHorizontal: "2%",
    resizeMode: "contain",
    backgroundColor: "#dddddd",
  },
});

export default Buypage;
