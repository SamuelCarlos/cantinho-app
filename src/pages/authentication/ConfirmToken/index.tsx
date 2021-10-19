import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";

import showToast from "../../../utils/showToast";

import { useAuth } from "../../../hooks/useAuth";

export default function TokenConfirmPage({
  navigation,
}: {
  navigation: StackNavigationProp<any, any>;
}) {
  const [formData, setFormData] = React.useState<string>("");
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { confirmToken, phone } = useAuth();

  React.useEffect(() => {
    if (formData.length === 6) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [formData]);

  const handleSubmit = async () => {
    if (canSubmit && phone) {
      setIsLoading(true);
      const response = await confirmToken(formData);

      if (response === 404) {
        navigation.push("SignIn");
      }
      setIsLoading(false);
    }
    if (!phone) {
      showToast("Nenhum telefone informado.");
      navigation.push("SignIn");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../../assets/arrow-back-white.png")}
          style={styles.arrowBack}
        />
        <Text style={styles.text}>Voltar</Text>
      </TouchableOpacity>
      <Image source={require("../cantinho-logo.png")} style={styles.logo} />
      <View style={styles.form}>
        <View style={styles.input}>
          <Text style={{ ...styles.label, ...styles.text }}>
            Insira o token enviado via SMS
          </Text>
          <TextInput
            value={formData}
            onChangeText={(text) => setFormData(text)}
            style={styles.textField}
            maxLength={6}
          />
        </View>
        <TouchableOpacity
          style={styles.enter}
          disabled={!canSubmit}
          onPress={() => handleSubmit()}
        >
          <Text style={styles.text}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : canSubmit ? (
              "Confirmar"
            ) : (
              "Preencha os dados acima"
            )}
          </Text>
        </TouchableOpacity>
      </View>
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
  logo: {
    width: 230,
    height: 200,
    resizeMode: "contain",
  },
  arrowBack: {
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginRight: 5,
  },
  backButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 50,
    left: 30,
  },
  form: {
    marginTop: 20,
    width: "60%",
    height: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  textField: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 50,
    height: 40,
    paddingLeft: 15,
    color: "#000",
  },
  input: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  label: {
    alignSelf: "flex-start",
    marginBottom: 5,
    marginLeft: 5,
    marginTop: 10,
  },
  enter: {
    width: "100%",
    height: 40,
    marginTop: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6200AF",
    borderRadius: 100,
  },
});
