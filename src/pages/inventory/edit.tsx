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
} from "react-native";
import { CompleteProduct } from "./item";

interface EditItem {
  name?: string;
  buy_price?: number;
  sell_price?: number;
  inventory?: number;
}

export default function EditPage({
  route,
  navigation,
}: {
  route: RouteProp<{ data: { data: CompleteProduct } }, "data">;
  navigation: StackNavigationProp<any, any>;
}) {
  const [formData, setFormData] = React.useState<EditItem>({});
  const [originalData, setOriginalData] = React.useState<EditItem>({});

  React.useEffect(() => {
    const itemData = route.params.data;

    setOriginalData({
      name: itemData.name,
      buy_price: itemData.buy_price,
      sell_price: itemData.sell_price,
      inventory: itemData.inventory,
    });
  }, [route.params.data]);

  React.useEffect(() => {
    setFormData(originalData);
  }, [originalData]);

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
                value={formData.buy_price || 0}
                onChangeText={(text) => {
                  setFormData({ ...formData, buy_price: text });
                }}
                style={styles.textField}
                keyboardType="number-pad"
              />
            </View>
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
});
