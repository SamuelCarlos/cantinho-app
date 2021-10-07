import React from "react";

import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../hooks/useAuth";

export default function SettingsPage({
  navigation,
}: {
  navigation: StackNavigationProp<any, any>;
}) {
  const [isSigningOut, setIsSigningOut] = React.useState<boolean>(false);
  const { signOut } = useAuth();

  const handleSignOut = () => {
    setIsSigningOut(true);
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isSigningOut}
        onRequestClose={() => setIsSigningOut(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>Deseja mesmo sair?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.modalButton}>
                <Text
                  style={{ color: "red" }}
                  onPress={() => {
                    setIsSigningOut(false);
                    signOut();
                  }}
                >
                  Sim
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsSigningOut(false)}
              >
                <Text style={{ color: "black" }}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <View style={styles.menu}>
        <Text style={styles.text}>Configurações</Text>
        <View style={styles.options}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleSignOut()}
          >
            <Image
              source={require("../pages/assets/exit.png")}
              style={styles.buttonImage}
            />
            <Text style={styles.buttonLabel}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#f3f3f3",
  },
  menu: {
    width: "80%",
    height: "80%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 10,
  },
  text: {
    fontWeight: "600",
    fontSize: 18,
  },
  options: {
    width: "100%",
  },
  button: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    paddingLeft: 20,
  },
  buttonLabel: {
    color: "red",
    marginLeft: 10,
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  modal: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0, 0.6)",
  },
  modalContent: {
    width: "90%",
    height: 120,
    backgroundColor: "#ffffff",
    padding: 20,
    position: "relative",
  },
  buttonRow: {
    width: "100%",
    flexDirection: "row",
    position: "absolute",
    justifyContent: "space-between",
    bottom: 0,
    alignSelf: "center",
    paddingLeft: 20,
    paddingRight: 20,
  },
  modalButton: {
    width: "50%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
