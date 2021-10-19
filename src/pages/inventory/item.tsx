import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Modal,
  Share,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import { useFonts, Montserrat_400Regular } from "@expo-google-fonts/montserrat";

import showToast from "../../utils/showToast";

import { useIsFocused } from "@react-navigation/native";

import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";

import api from "../../connection/api";

import { Product } from "./homepage";
import { AxiosResponse } from "axios";
import ViewShot, { captureRef } from "react-native-view-shot";

interface ProductState {
  state: Partial<Product>;
}

export interface CompleteProduct extends Product {
  __v: number;
  _id: string;
  user_SKU: string;
  states: ProductState[];
}

export default function ItemPage({
  route,
  navigation,
}: {
  route: RouteProp<{ SKU: { SKU: string } }, "SKU">;
  navigation: StackNavigationProp<any, any>;
}) {
  const [data, setData] = React.useState<CompleteProduct | null>(null);
  const [SKU, setSKU] = React.useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = React.useState<boolean>(false);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);
  const [isDeleting, setIsDeleting] = React.useState<boolean>(false);
  const [isPrinting, setIsPrinting] = React.useState<boolean>(false);
  const [isLoadingItem, setIsLoadingItem] = React.useState<boolean>(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
  });

  const printView = React.useRef();

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
      setIsLoadingItem(true);
      const response = (await api.get(`/product/${SKU}`)) as AxiosResponse<{
        product: CompleteProduct;
      }>;

      if (response) {
        setData(response.data.product);
      } else {
        setData(null);
      }
      setIsLoadingItem(false);
    } catch (err) {
      showToast("Erro ao carregar este item.");
      setIsLoadingItem(false);
      navigation.goBack();
    }
  };

  React.useEffect(() => {
    if (SKU) {
      fetchData();
    }
  }, [SKU]);

  React.useEffect(() => {
    if (isFocused) {
      if (!route.params.SKU) {
        navigation.popToTop();
      }
    }
  }, [isFocused]);

  const saveFile = async (fileUri: string) => {
    let permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== "granted") {
      permission = await MediaLibrary.requestPermissionsAsync();
    }
    if (permission.status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Cantinho", asset, false);
    }
  };

  const ViewToPrint = () => {
    if (data) {
      return (
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            position: "absolute",
            top: -200000,
          }}
          onPress={() => setIsPrinting(false)}
        >
          <ViewShot ref={printView} options={{ format: "jpg", quality: 0.9 }}>
            <View
              style={{
                padding: 20,
                width: 280,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#ffffff",
              }}
            >
              <Text
                style={{ fontSize: 22, fontFamily: "Montserrat_400Regular" }}
              >
                {data.name}
              </Text>
              <Image
                source={{ uri: data.qr_code }}
                style={itemStyles.QRCode}
                onLoadStart={() => setIsLoadingQR(true)}
                onLoadEnd={() => setIsLoadingQR(false)}
              />
              <Text
                style={{ fontSize: 22, fontFamily: "Montserrat_400Regular" }}
              >
                Cartão: R$ {data.sell_price.toFixed(2)}
              </Text>
              <Text
                style={{ fontSize: 22, fontFamily: "Montserrat_400Regular" }}
              >
                À vista: R$ {data.sell_price_cash.toFixed(2)}
              </Text>
            </View>
          </ViewShot>
        </TouchableOpacity>
      );
    }
    return <></>;
  };

  React.useEffect(() => {}, [printView.current]);

  const downloadFile = async () => {
    setIsPrinting(true);
    setIsDownloading(true);
    if (printView.current && data) {
      const result = await captureRef(printView, {
        format: "jpg",
        quality: 1,
        result: "base64",
      });

      let fileUri = FileSystem.documentDirectory + `qr-${data.SKU}.png`;

      await FileSystem.writeAsStringAsync(fileUri, result, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await saveFile(fileUri);

      setIsDownloading(false);
      setIsPrinting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/product/${data?.SKU}`);

      setIsDeleting(false);
      navigation.goBack();
    } catch (err) {
      console.log(err);
    }
  };

  const handleReactivate = async () => {
    try {
      await api.post(`/product/${data?.SKU}`);
      fetchData();
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoadingItem) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#B090C9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleting}
        onRequestClose={() => setIsDeleting(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>Deseja mesmo excluir o item?</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => handleDelete()}
              >
                <Text style={{ color: "red" }}>Sim</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsDeleting(false)}
              >
                <Text style={{ color: "black" }}>Não</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {ViewToPrint()}
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
              <View
                style={[
                  itemStyles.tag,
                  { backgroundColor: data.deleted_at ? "red" : "#B090C9" },
                ]}
              >
                <Text style={itemStyles.tagTitle}>qtd</Text>
                <Text style={itemStyles.inventory}>
                  {data.deleted_at ? "-" : data.inventory}
                </Text>
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
            <View style={itemStyles.priceBar}>
              <View style={itemStyles.priceBarLeftSide}>
                <View style={itemStyles.buyPrice}>
                  <Text style={{ fontSize: 16, color: "#7A0F0F" }}>
                    Comprado:
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#7A0F0F",
                      letterSpacing: -1,
                    }}
                  >
                    R$ {Number(data.buy_price).toFixed(2)}
                  </Text>
                </View>
                <View style={[itemStyles.sellPrice, { marginBottom: 5 }]}>
                  <Text style={{ fontSize: 16, color: "#0C7717" }}>
                    Vendido (cartão):
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#0C7717",
                      letterSpacing: -1,
                    }}
                  >
                    R$ {Number(data.sell_price).toFixed(2)}
                  </Text>
                </View>
                <View style={itemStyles.sellPrice}>
                  <Text style={{ fontSize: 16, color: "#0C7717" }}>
                    Vendido (à vista):
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#0C7717",
                      letterSpacing: -1,
                    }}
                  >
                    R$ {Number(data.sell_price_cash).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={itemStyles.priceBarRightSide}>
                <Text style={{ fontSize: 20 }}>Lucro (cartão):</Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  {(
                    ((Number(data.sell_price) - Number(data.buy_price)) * 100) /
                    Number(data.buy_price)
                  ).toFixed(2)}
                  %
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  R$
                  {(Number(data.sell_price) - Number(data.buy_price)).toFixed(
                    2
                  )}
                </Text>
                <Text style={{ fontSize: 20, marginTop: 10 }}>
                  Lucro (à vista):
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  {(
                    ((Number(data.sell_price_cash) - Number(data.buy_price)) *
                      100) /
                    Number(data.buy_price)
                  ).toFixed(2)}
                  %
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  R$
                  {(
                    Number(data.sell_price_cash) - Number(data.buy_price)
                  ).toFixed(2)}
                </Text>
              </View>
            </View>
            <View style={itemStyles.QRView}>
              {isLoadingQR && (
                <ActivityIndicator size="small" color="#6200AF" />
              )}
              <Image
                source={{ uri: data.qr_code }}
                style={itemStyles.QRCode}
                onLoadStart={() => setIsLoadingQR(true)}
                onLoadEnd={() => setIsLoadingQR(false)}
              />

              <Text style={{ fontSize: 18 }}>{data.SKU}</Text>
            </View>
            <View style={itemStyles.buttonRow}>
              <TouchableOpacity
                style={itemStyles.button}
                onPress={() => downloadFile()}
                disabled={isDownloading || isLoadingQR}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#B090C9" />
                ) : (
                  <Image
                    style={itemStyles.icon}
                    source={require("../assets/download.png")}
                  />
                )}
                <Text style={itemStyles.buttonText}>Baixar QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={itemStyles.button}
                onPress={() => navigation.push("Edit", { data })}
              >
                <Image
                  style={itemStyles.icon}
                  source={require("../assets/edit.png")}
                />
                <Text style={itemStyles.buttonText}>Editar Item</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={itemStyles.button}
                onPress={() =>
                  data.deleted_at ? handleReactivate() : setIsDeleting(true)
                }
              >
                <Image
                  style={itemStyles.icon}
                  source={
                    data.deleted_at
                      ? require("../assets/reactivate.png")
                      : require("../assets/delete.png")
                  }
                />
                <Text style={itemStyles.buttonText}>
                  {data.deleted_at ? "Reativar item" : "Excluir item"}
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
  priceBarRightSide: {
    width: "50%",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 20,
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
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 5,
    backgroundColor: "#2199427D",
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "#f3f3f3",
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
});
