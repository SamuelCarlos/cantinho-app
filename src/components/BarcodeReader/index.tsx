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
  const [scanned, setScanned] = React.useState<boolean>(false);
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
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = (scanningResult: BarCodeScannerResult) => {
    if (!scanned) {
      const { type, data, bounds: { origin } = {} } = scanningResult;

      // @ts-ignore
      const { x, y } = origin;

      if (
        x >= viewMinX &&
        y >= viewMinY &&
        x <= viewMinX + finderWidth / 2 &&
        y <= viewMinY + finderHeight / 2
      ) {
        setScanned(true);

        navigation.push("Item", { SKU: data });
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Pedindo permissão para utilizar a câmera</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sem acesso à câmera</Text>;
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
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        type={type}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        style={[StyleSheet.absoluteFillObject, styles.container]}
      >
        <BarcodeMask edgeColor="#6200AF" showAnimatedLine />
        {scanned && (
          <Button
            title={"Tap to Scan Again"}
            onPress={() => setScanned(false)}
          />
        )}
      </BarCodeScanner>
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
