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
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import showToast from "../../utils/showToast";

import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/core";

import api from "../../connection/api";

import { Product } from "./homepage";
import { AxiosResponse } from "axios";

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
  const [isDownloading, setIsDownloading] = React.useState(false);

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

  const saveFile = async (fileUri: string) => {
    let permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status !== "granted") {
      permission = await MediaLibrary.requestPermissionsAsync();
    }
    if (permission.status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
    }
  };

  const downloadFile = () => {
    if (!data?.qr_code) return null;
    setIsDownloading(true);
    const uri = data.qr_code;
    let fileUri = FileSystem.documentDirectory + `qr-${data.SKU}.png`;

    FileSystem.downloadAsync(uri, fileUri)
      .then(async ({ uri }) => {
        await saveFile(uri);
        setIsDownloading(false);
      })
      .catch((error) => {
        setIsDownloading(false);

        showToast(
          "Você deve permitir o download se quiser a imagem na sua galeria"
        );
      });
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
                    R${Number(data.buy_price).toFixed(2)}
                  </Text>
                </View>
                <View style={itemStyles.sellPrice}>
                  <Text style={{ fontSize: 16, color: "#0C7717" }}>
                    Vendido:
                  </Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#0C7717",
                      letterSpacing: -1,
                    }}
                  >
                    R${Number(data.sell_price).toFixed(2)}
                  </Text>
                </View>
              </View>
              <View style={itemStyles.priceBarRightSide}>
                <Text style={{ fontSize: 20 }}>Lucro:</Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  {((Number(data.sell_price) - Number(data.buy_price)) * 100) /
                    Number(data.buy_price)}
                  %
                </Text>
                <Text style={{ fontSize: 28, fontWeight: "bold" }}>
                  R$
                  {(Number(data.sell_price) - Number(data.buy_price)).toFixed(
                    2
                  )}
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
                disabled={isDownloading}
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
              <TouchableOpacity style={itemStyles.button}>
                <Image
                  style={itemStyles.icon}
                  source={require("../assets/delete.png")}
                />
                <Text style={itemStyles.buttonText}>Excluir Item</Text>
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
});
