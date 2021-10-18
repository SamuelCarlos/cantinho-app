import { RouteProp } from "@react-navigation/core";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CompleteProduct } from "./item";

interface EditItem {
  name?: string;
  buy_price?: string;
  sell_price?: string;
  sell_price_cash?: string;
  inventory?: string;
}

import api from "../../connection/api";

import showToast from "../../utils/showToast";

export default function EditPage({
  route,
  navigation,
}: {
  route: RouteProp<{ data: { data: CompleteProduct } }, "data">;
  navigation: StackNavigationProp<any, any>;
}) {
  const [SKU, setSKU] = React.useState<string>("");
  const [formData, setFormData] = React.useState<EditItem>({});
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [originalData, setOriginalData] = React.useState<EditItem>({});

  React.useEffect(() => {
    const itemData = route.params.data;
    setSKU(itemData.SKU);
    setOriginalData({
      name: itemData.name,
      buy_price: itemData.buy_price.toString(),
      sell_price: itemData.sell_price.toString(),
      sell_price_cash: itemData.sell_price_cash.toString(),
      inventory: itemData.inventory.toString(),
    });
  }, [route.params.data]);

  React.useEffect(() => {
    setFormData(originalData);
  }, [originalData]);

  const verifyFields = (data: EditItem) => {
    if (!data.name || data.name.length === 0) {
      setCanSubmit(false);
      return;
    }

    if (
      !data.buy_price ||
      data.buy_price.length === 0 ||
      Number.isNaN(Number(data.buy_price))
    ) {
      setCanSubmit(false);
      return;
    }

    if (
      !data.sell_price ||
      data.sell_price.length === 0 ||
      Number.isNaN(Number(data.sell_price))
    ) {
      setCanSubmit(false);
      return;
    }

    if (
      !data.inventory ||
      data.inventory.length === 0 ||
      Number.isNaN(Number(data.inventory))
    ) {
      setCanSubmit(false);
      return;
    }

    if (
      data.name === originalData.name &&
      data.buy_price === originalData.buy_price &&
      data.sell_price === originalData.sell_price &&
      data.inventory === originalData.inventory
    ) {
      setCanSubmit(false);
      return;
    }

    setCanSubmit(true);
  };

  React.useEffect(() => {
    verifyFields(formData);
  }, [formData]);

  const handleSubmit = async () => {
    if (canSubmit && SKU) {
      setIsLoading(true);
      try {
        await api.put(`/product/${SKU}`, {
          name: formData.name,
          buy_price: Number(formData.buy_price),
          sell_price: Number(formData.sell_price),
          inventory: Number(formData.inventory),
        });
        showToast("Item atualizado com sucesso!");
        navigation.goBack();
      } catch (err) {
        console.log(err);
      }
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
          source={require("../../pages/assets/arrow-back-gray.png")}
          style={styles.arrowBack}
        />
        <Text style={{ color: "#9A9A9A" }}>Voltar</Text>
      </TouchableOpacity>
      <SafeAreaView style={styles.itemView}>
        <ScrollView>
          <View style={styles.form}>
            <View style={styles.input}>
              <Text style={{ ...styles.label, ...styles.text }}>Nome:</Text>
              <TextInput
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                }}
                style={styles.textField}
              />
            </View>
            <View style={styles.input}>
              <Text style={{ ...styles.label, ...styles.text }}>
                Comprado por:
              </Text>
              <TextInput
                value={formData.buy_price}
                onChangeText={(text) => {
                  setFormData({ ...formData, buy_price: text });
                }}
                style={styles.textField}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.input}>
              <Text style={{ ...styles.label, ...styles.text }}>
                Vendido por (cartão):
              </Text>
              <TextInput
                value={formData.sell_price}
                onChangeText={(text) => {
                  setFormData({ ...formData, sell_price: text });
                }}
                style={styles.textField}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.input}>
              <Text style={{ ...styles.label, ...styles.text }}>
                Vendido por (à vista):
              </Text>
              <TextInput
                value={formData.sell_price_cash}
                onChangeText={(text) => {
                  setFormData({ ...formData, sell_price_cash: text });
                }}
                style={styles.textField}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.input}>
              <Text style={{ ...styles.label, ...styles.text }}>
                Em estoque:
              </Text>
              <TextInput
                value={formData.inventory}
                onChangeText={(text) => {
                  setFormData({ ...formData, inventory: text });
                }}
                style={styles.textField}
                keyboardType="number-pad"
              />
            </View>
            <TouchableOpacity
              style={styles.enter}
              disabled={!canSubmit || isLoading}
              onPress={() => handleSubmit()}
            >
              <Text style={styles.textWhite}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  "Confirmar"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
  },
  text: {
    color: "#000",
  },
  textWhite: {
    color: "#fff",
  },
  backButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 50,
    left: 30,
    zIndex: 2,
  },
  arrowBack: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 5,
  },
  itemView: {
    width: "90%",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    marginBottom: 20,
    marginTop: 90,
  },
  form: {
    marginTop: 20,
    marginBottom: 40,
    width: "60%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  textField: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 50,
    height: 40,
    paddingLeft: 15,
    color: "#000",
    borderColor: "#B090C9",
    borderWidth: 2,
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
  inputSimulator: {
    width: "100%",
    height: 40,
    borderColor: "#B090C9",
    borderWidth: 2,
    borderRadius: 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  icon: {
    marginLeft: 10,
    marginRight: 10,
    width: 25,
    height: 25,
    resizeMode: "contain",
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
