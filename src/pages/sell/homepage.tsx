import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";

import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";
import { CompleteProduct } from "../inventory/item";
import api from "../../connection/api";
import { AxiosResponse } from "axios";
import { useIsFocused } from "@react-navigation/native";
import showToast from "../../utils/showToast";

export default function SellPage({
  route,
  navigation,
}: {
  route: RouteProp<{ SKU: { SKU: string } }, "SKU">;
  navigation: StackNavigationProp<any, any>;
}) {
  const [SKU, setSKU] = React.useState<string | null>(null);
  const [canSell, setCanSell] = React.useState<boolean>(true);
  const [quantity, setQuantity] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<CompleteProduct | null>(null);
  const [discount, setDiscount] = React.useState<{
    value: string;
    type: "percentage" | "value";
  }>({ value: "0", type: "percentage" });
  const [sellType, setSellType] = React.useState<"cash" | "portion">("portion");

  const [isConfirming, setIsConfirming] = React.useState<boolean>(false);

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (route.params.SKU) {
      setSKU(route.params.SKU);
    } else {
      setSKU(null);
    }
  }, [route.params.SKU]);

  const fetchData = async () => {
    try {
      const response = (await api.get(`/product/${SKU}`)) as AxiosResponse<{
        product: CompleteProduct;
      }>;

      if (response) {
        if (response.data.product.deleted_at) {
          showToast("Esse item foi excluido e não pode ser vendido.");
          navigation.popToTop();
          return;
        }
        setData(response.data.product);
      } else {
        setData(null);
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  React.useEffect(() => {
    if (SKU) {
      fetchData();
    }
  }, [SKU]);

  const handleDiscountChange = (text: string) => {
    if (Number.isNaN(Number(text))) {
      setCanSell(false);
      showToast("O campo de desconto deve ser um número.");
      return;
    }
    if (
      discount.type === "percentage" &&
      (Number(text) < 0 || Number(text) > 100)
    ) {
      setCanSell(false);
      showToast("O campo de desconto deve conter um valor entre 0 e 100.");
      return;
    }

    if (discount.type === "value" && data && Number(text) > data?.sell_price) {
      setCanSell(false);
      showToast(
        "O valor de desconto não pode ser maior do que o valor do item."
      );
      return;
    }

    if (discount.type === "value" && data && Number(text) < 0) {
      setCanSell(false);
      showToast("O valor de desconto deve ser maior que 0.");
      return;
    }

    if (
      discount.type === "percentage" &&
      data &&
      Number(text) >=
        ((Number(data.sell_price) - Number(data.buy_price)) * 100) /
          Number(data.buy_price)
    ) {
      showToast("Você está dando um desconto alto demais e não obterá lucro.");
    }

    setDiscount({ ...discount, value: text });
    setCanSell(true);
  };

  const handleQuantityChange = (text: "-" | "+") => {
    if (text === "-") {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      } else {
        showToast("Quantidade deve ser maior que 0.");
      }
    }
    if (text === "+") {
      if (data && quantity < data?.inventory) {
        setQuantity(quantity + 1);
      } else {
        showToast("Quantidade tem que ser menor que o estoque.");
      }
    }
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setIsConfirming(true);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (data) {
        await api.post(`/sell/${SKU}`, {
          quantity,
          discount:
            discount.type === "value"
              ? Number(discount.value)
              : (Number(discount.value) / 100) * data.sell_price,
        });
        showToast("Vendido!");
        navigation.popToTop();
      }
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  if (isConfirming && data) {
    const currentPrice =
      sellType === "portion" ? data.sell_price : data.sell_price_cash;
    const discountInPrice =
      discount.type === "value"
        ? Number(discount.value)
        : (Number(discount.value) / 100) * currentPrice;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setIsConfirming(false)}
        >
          <Image
            source={require("../../pages/assets/arrow-back-gray.png")}
            style={styles.arrowBack}
          />
          <Text style={{ color: "#9A9A9A" }}>Voltar</Text>
        </TouchableOpacity>
        <SafeAreaView style={styles.itemView}>
          <ScrollView style={{ padding: 10 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 30 }}>Confirmar venda:</Text>
            </View>
            <View style={itemStyles.priceBar}>
              <View
                style={[itemStyles.sellPrice, { backgroundColor: "#efefef" }]}
              >
                <Text style={{ fontSize: 16, color: "#303030" }}>
                  Preço original individual:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#303030",
                    letterSpacing: -1,
                  }}
                >
                  R$ {Number(currentPrice).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={[itemStyles.priceBar, { marginTop: -5 }]}>
              <View
                style={[itemStyles.sellPrice, { backgroundColor: "#efefef" }]}
              >
                <Text style={{ fontSize: 16, color: "#303030" }}>
                  Vendendo por (c/ desconto):
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#303030",
                    letterSpacing: -1,
                  }}
                >
                  R$ {(currentPrice - discountInPrice).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={[itemStyles.priceBar, { marginTop: -5 }]}>
              <View
                style={[itemStyles.sellPrice, { backgroundColor: "#efefef" }]}
              >
                <Text style={{ fontSize: 16, color: "#303030" }}>
                  Total de itens:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#303030",
                    letterSpacing: -1,
                  }}
                >
                  {quantity}
                </Text>
              </View>
            </View>
            <View style={[itemStyles.priceBar, { marginTop: -5 }]}>
              <View
                style={[itemStyles.sellPrice, { backgroundColor: "#efefef" }]}
              >
                <Text style={{ fontSize: 16, color: "#303030" }}>
                  Total da venda sem desconto:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#303030",
                    letterSpacing: -1,
                  }}
                >
                  R$ {(quantity * currentPrice).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={[itemStyles.priceBar, { marginTop: -5 }]}>
              <View
                style={[itemStyles.sellPrice, { backgroundColor: "#efefef" }]}
              >
                <Text style={{ fontSize: 16, color: "#303030" }}>
                  Total da venda com desconto:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#0C7717",
                    letterSpacing: -1,
                  }}
                >
                  R$ {(quantity * (currentPrice - discountInPrice)).toFixed(2)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.enter}
              disabled={!canSell || isLoading}
              onPress={() => handleConfirm()}
            >
              <Text style={{ color: "#ffffff" }}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  "Confirmar venda"
                )}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

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
      {data && (
        <SafeAreaView style={styles.itemView}>
          <ScrollView>
            <View style={itemStyles.titleBar}>
              <View style={itemStyles.nameView}>
                <Text style={itemStyles.name}>{data.name}</Text>
              </View>
              <View style={itemStyles.tag}>
                <Text style={itemStyles.tagTitle}>qtd</Text>
                <Text style={itemStyles.inventory}>{data.inventory}</Text>
              </View>
            </View>
            <View style={itemStyles.datesBar}>
              <View style={itemStyles.buyDateRow}>
                <View style={itemStyles.dateTitleView}>
                  <Image
                    source={require("../../pages/assets/calendar.png")}
                    style={itemStyles.icon}
                  />
                  <Text style={itemStyles.dateTitle}>Data da compra</Text>
                </View>
                <Text>
                  {new Date(data.created_at).toLocaleDateString("pt-BR") || "-"}
                </Text>
              </View>
              <View style={itemStyles.buyDateRow}>
                <View style={itemStyles.dateTitleView}>
                  <Image
                    source={require("../../pages/assets/update.png")}
                    style={itemStyles.icon}
                  />
                  <Text style={itemStyles.dateTitle}>Última atualização</Text>
                </View>
                <Text style={itemStyles.date}>
                  {data.updated_at
                    ? new Date(data.updated_at).toLocaleDateString("pt-BR")
                    : "-"}
                </Text>
              </View>
            </View>
            <Text
              style={[
                itemStyles.discountTag,
                { alignSelf: "center", marginBottom: -15 },
              ]}
            >
              Tipo da venda:
            </Text>
            <View style={itemStyles.priceBar}>
              <View style={itemStyles.sellPrice}>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    backgroundColor: "#efefef",
                  }}
                  onPress={() =>
                    setSellType(sellType === "portion" ? "cash" : "portion")
                  }
                >
                  <Text style={{ color: "#000000" }}>{"<"}</Text>
                </TouchableOpacity>
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Text style={{ fontSize: 16, color: "#000000" }}>
                    {sellType === "portion" ? "Cartão" : "À vista"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#000000",
                      letterSpacing: -1,
                    }}
                  >
                    R${" "}
                    {Number(
                      sellType === "portion"
                        ? data.sell_price
                        : data.sell_price_cash
                    ).toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 4,
                    backgroundColor: "#efefef",
                  }}
                  onPress={() =>
                    setSellType(sellType === "portion" ? "cash" : "portion")
                  }
                >
                  <Text style={{ color: "#000000" }}>{">"}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={itemStyles.discount}>
              <Text style={itemStyles.discountTag}>Quantidade:</Text>
              <View
                style={[
                  styles.input,
                  {
                    height: 60,
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                  },
                ]}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "#eeeeee",
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 15,
                    paddingLeft: 15,
                    paddingRight: 20,
                    borderRadius: 100,
                  }}
                  onPress={() => handleQuantityChange("-")}
                >
                  <Text style={{ fontSize: 40 }}>{"<"}</Text>
                </TouchableOpacity>

                <Text style={{ fontSize: 25, fontWeight: "bold" }}>
                  {quantity}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#eeeeee",
                    justifyContent: "center",
                    alignItems: "center",
                    marginLeft: 20,
                    paddingLeft: 15,
                    paddingRight: 15,
                    borderRadius: 100,
                  }}
                  onPress={() => handleQuantityChange("+")}
                >
                  <Text style={{ fontSize: 40 }}>{">"}</Text>
                </TouchableOpacity>
              </View>
              <Text style={itemStyles.discountTag}>Desconto:</Text>
              <View style={styles.input}>
                <TextInput
                  value={discount.value}
                  onChangeText={(text) => {
                    handleDiscountChange(text);
                  }}
                  style={styles.textField}
                  keyboardType="number-pad"
                />
              </View>
              <Text style={itemStyles.discountTag}>Tipo:</Text>
              <View style={itemStyles.discountTypes}>
                <TouchableOpacity
                  style={[
                    itemStyles.discountTypeButton,
                    discount.type === "percentage" && {
                      backgroundColor: "#B090C9",
                    },
                  ]}
                  onPress={() =>
                    setDiscount({ ...discount, type: "percentage" })
                  }
                >
                  <Text
                    style={{
                      color:
                        discount.type === "percentage" ? "#ffffff" : "#000000",
                      fontSize: 28,
                    }}
                  >
                    %
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    itemStyles.discountTypeButton,
                    discount.type === "value" && {
                      backgroundColor: "#B090C9",
                    },
                  ]}
                  onPress={() => setDiscount({ ...discount, type: "value" })}
                >
                  <Text
                    style={{
                      color: discount.type === "value" ? "#ffffff" : "#000000",
                      fontSize: 28,
                    }}
                  >
                    $
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.enter}
                disabled={!canSell || isLoading}
                onPress={() => handleSubmit()}
              >
                <Text style={{ color: "#ffffff" }}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    "Vender"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      )}
    </View>
  );
}

const itemStyles = StyleSheet.create({
  icon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },
  titleBar: {
    width: "100%",
    height: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameView: {
    width: "70%",
    justifyContent: "center",
    flexDirection: "row",
  },
  name: {
    fontWeight: "bold",
    fontSize: 24,
  },
  tag: {
    width: 80,
    backgroundColor: "#B090C9",
    height: "100%",
    marginRight: 40,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tagTitle: {
    color: "#ffffff",
    marginBottom: -10,
  },
  inventory: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 50,
  },
  datesBar: {
    width: "100%",
    marginTop: 10,
    marginBottom: 10,
  },
  buyDateRow: {
    width: "90%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateTitleView: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dateTitle: {
    marginLeft: 10,
    fontSize: 16,
  },
  date: {
    fontSize: 16,
  },
  priceBar: {
    width: "90%",
    marginBottom: 20,
    marginTop: 20,

    flexDirection: "row",
    alignSelf: "center",
  },
  priceBarLeftSide: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
  },

  buyPrice: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    backgroundColor: "#BD393991",
    marginBottom: 5,
  },
  sellPrice: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    paddingLeft: 20,
    paddingRight: 20,
  },
  QRView: {
    width: "100%",
    alignItems: "center",
  },
  QRCode: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  buttonRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
  },
  discount: {
    width: "90%",
    alignSelf: "center",
    display: "flex",
    alignItems: "center",
  },
  discountTag: {
    fontSize: 20,
    marginTop: 20,
  },
  discountTypes: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  discountTypeButton: {
    width: "30%",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderRadius: 10,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
  },
  enter: {
    width: "50%",
    height: 40,
    marginTop: 60,
    marginBottom: 20,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6200AF",
    borderRadius: 100,
    alignSelf: "center",
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
});
