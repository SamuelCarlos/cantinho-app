import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const icons = (label: string) => {
  let icon;
  switch (label) {
    case "Estoque":
      icon = require("./list.png");
      break;
    case "Vender":
      icon = require("./attach_money.png");
      break;
    case "Adicionar":
      icon = require("./add.png");
      break;
    case "Perfil":
      icon = require("./account.png");
      break;
    default:
      icon = require("./default_icon.png");
      break;
  }

  return icon;
};

export default function Footer({ state, descriptors, navigation }) {
  return (
    <View style={styles.footer}>
      {state.routes.map((route, index: number) => {
        const { options } = descriptors[route.key];

        const label: string =
          options.topBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        return (
          <TouchableOpacity
            style={
              !isFocused
                ? styles.button
                : { ...styles.button, backgroundColor: "#806099" }
            }
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            key={label}
          >
            <Image source={icons(label)} style={styles.icon} />

            <Text style={styles.text}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    display: "flex",
    flexDirection: "row",
    height: 55,
    backgroundColor: "#6200AF",
    width: "100%",
  },
  button: {
    backgroundColor: "#6200AF",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  text: {
    color: "#ffffff",
    fontWeight: "400",
    fontSize: 15,
  },
  icon: {
    width: 30,
    height: 30,
  },
});
