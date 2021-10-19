import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { BarCodeScanner, BarCodeScannerResult } from "expo-barcode-scanner";

import { StackNavigationProp } from "@react-navigation/stack";
import BarcodeMask from "react-native-barcode-mask";

interface BarcodeReaderProps {
  navigation: StackNavigationProp<any, any>;
}

export default function BarcodeReader({ navigation }: BarcodeReaderProps) {
  const [hasReaded, setHasReaded] = React.useState(false);
  const [type, setType] = React.useState<any>(
    BarCodeScanner.Constants.Type.back
  );
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(
    null
  );
  const finderWidth: number = 280;

  const finderHeight: number = 230;
  const width = Dimensions.get("window").width;
  const height = Dimensions.get("window").height;
  const viewMinX = (width - finderWidth) / 2;
  const viewMinY = (height - finderHeight) / 2;

  React.useEffect(() => {
    (async () => {
      let permission = await BarCodeScanner.getPermissionsAsync();
      if (permission.status !== "granted") {
        permission = await BarCodeScanner.requestPermissionsAsync();
      }
      if (permission.status === "granted") {
        setHasPermission(true);
      }
    })();
  }, []);

  const handleBarCodeScanned = (scanningResult: BarCodeScannerResult) => {
    const { type, data, bounds: { origin } = {} } = scanningResult;

    // @ts-ignore
    const { x, y } = origin;

    if (
      x >= viewMinX &&
      y >= viewMinY &&
      x <= viewMinX + finderWidth / 2 &&
      y <= viewMinY + finderHeight / 2
    ) {
      setHasReaded(true);
      if (
        navigation.getState().routes[1] &&
        navigation.getState().routes[1].name.includes("inventory")
      )
        navigation.push("Item", { SKU: data });
      if (navigation.getState().routes[0].name.includes("sell"))
        navigation.push("Sell", { SKU: data });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Pedindo permissão para utilizar a câmera</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Sem acesso à câmera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../../pages/assets/arrow-back-white.png")}
          style={styles.arrowBack}
        />
        <Text style={{ color: "#fff" }}>Voltar</Text>
      </TouchableOpacity>
      <BarCodeScanner
        onBarCodeScanned={hasReaded ? undefined : handleBarCodeScanned}
        type={type}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={[StyleSheet.absoluteFillObject, styles.container]}
      >
        <BarcodeMask edgeColor="#6200AF" showAnimatedLine />
      </BarCodeScanner>
      {hasReaded && (
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 50,
            alignSelf: "center",
            zIndex: 10000,
            backgroundColor: "#6200AF",
            padding: 20,
            borderRadius: 10,
          }}
          onPress={() => setHasReaded(false)}
        >
          <View>
            <Text style={{ color: "#ffffff" }}>Ler novamente</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
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
    width: 15,
    height: 15,
    resizeMode: "contain",
    marginRight: 5,
  },
});
