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

import { useAuth } from "../../../hooks/useAuth";

export interface SignInForm {
  phone: string;
  password: string;
}

const BLANK_FORM_DATA = {
  phone: "",
  password: "",
};

export default function SignInPage({
  navigation,
}: {
  navigation: StackNavigationProp<any, any>;
}) {
  const [formData, setFormData] = React.useState<SignInForm>(BLANK_FORM_DATA);
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { signIn } = useAuth();

  React.useEffect(() => {
    if (formData.phone.length === 11 && formData.password.length > 0) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [formData]);

  const handleSubmit = async () => {
    if (canSubmit) {
      setIsLoading(true);
      const response = await signIn(formData);
      if (response === 422) navigation.push("TokenConfirm");
      setIsLoading(false);
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
            DDD + Telefone
          </Text>
          <TextInput
            value={formData.phone}
            onChangeText={(text) => {
              if (!Number.isNaN(Number(text)))
                setFormData({ ...formData, phone: text });
            }}
            style={styles.textField}
            keyboardType="numeric"
            maxLength={11}
            textContentType="telephoneNumber"
          />
        </View>
        <View style={styles.input}>
          <Text style={{ ...styles.label, ...styles.text }}>Senha</Text>
          <TextInput
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            style={styles.textField}
            maxLength={11}
            textContentType="password"
            secureTextEntry={true}
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
              "Entrar"
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
