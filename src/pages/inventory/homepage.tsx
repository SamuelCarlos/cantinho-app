import React from "react";
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Keyboard,
  FlatList,
  ActivityIndicator,
} from "react-native";

import { useIsFocused } from "@react-navigation/native";

import api from "../../connection/api";
import { AxiosResponse } from "axios";

export interface Product {
  SKU: string;
  buy_price: number;
  sell_price: number;
  sell_price_cash: number;
  name: string;
  inventory: number;
  created_at: Date;
  qr_code: string;
  updated_at: Date | null;
  deleted_at: Date | null;
}

import { StackNavigationProp } from "@react-navigation/stack";

export const Homepage = ({
  navigation,
}: {
  navigation: StackNavigationProp<any, any>;
}) => {
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<{
    type: 0 | 1 | 2;
    direction: "up" | "down";
  } | null>(null);
  const [items, setItems] = React.useState<Product[] | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const step = 20;

  const isFocused = useIsFocused();

  const handleItemList = async () => {
    setIsLoading(true);
    try {
      const with_deleted = false;

      const response = (await api.get(
        `/products?search=${search}&page=${page}&step=${step}&with_deleted=${with_deleted}`
      )) as AxiosResponse<{
        products: Product[];
      }>;
      setPage(page + 1);

      if (response.data.products.length > 0) {
        if (!items || items?.length === 0) {
          setItems(response.data.products);
        } else if (items) {
          setItems([...items, ...response.data.products]);
        }
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    Keyboard.dismiss();
    setItems(null);
    setPage(1);
  };

  React.useEffect(() => {
    if (items === null && page === 1) {
      handleItemList();
    }
  }, [items, page]);

  navigation.addListener("focus", () => {
    setItems(null);
    setPage(1);
    handleItemList();
  });

  React.useEffect(() => {
    if (items && items.length > 0 && filter !== null) {
      const newItems = [...items];
      const reorganizedItems = newItems?.sort((a, b) => {
        switch (filter.type) {
          case 0:
            if (filter.direction === "up") {
              if (a.inventory < b.inventory) return 1;
              return -1;
            }
            if (a.inventory > b.inventory) return 1;
            return -1;
          case 1:
            if (filter.direction === "up") {
              if (a.buy_price < b.buy_price) return 1;
              return -1;
            }
            if (a.buy_price > b.buy_price) return 1;
            return -1;
          case 2:
            if (filter.direction === "up") {
              if (a.sell_price < b.sell_price) return 1;
              return -1;
            }
            if (a.sell_price > b.sell_price) return 1;
            return -1;
          default:
            return -1;
        }
      });
      setItems(reorganizedItems);
    }
  }, [filter]);

  React.useEffect(() => {
    handleItemList();
  }, [search]);

  const ItemComponentList = (item: Product): JSX.Element => (
    <TouchableOpacity
      key={item.SKU}
      onPress={() => navigation.push("Item", { SKU: item.SKU })}
    >
      <View style={styles.item}>
        <Text style={styles.itemName}>{item?.name || ""}</Text>
        <View style={styles.itemAttributes}>
          <View style={styles.itemEachAttribute}>
            <Text>{item.inventory}</Text>
          </View>
          <View style={styles.itemEachAttribute}>
            <Text>R$ {Number(item.buy_price).toFixed(2)}</Text>
          </View>
          <View style={styles.itemEachAttribute}>
            <Text>R$ {Number(item.sell_price).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TouchableOpacity
          onPress={() => navigation.push("BarcodeReader inventory")}
        >
          <Image
            source={require("../assets/camera.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
        <TextInput
          value={search}
          onChangeText={(text) => {
            setSearch(text);
          }}
          style={styles.searchField}
          placeholder="Busca"
        />
        <TouchableOpacity onPress={() => handleSearch()}>
          <Image
            source={require("../assets/search.png")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>
      <SafeAreaView style={styles.searchResult}>
        <View style={styles.filters}>
          <TouchableOpacity
            onPress={() => {
              if (filter && filter.type !== 0) {
                setFilter({ type: 0, direction: "down" });
              } else {
                setFilter({
                  type: 0,
                  direction: filter?.direction === "up" ? "down" : "up",
                });
              }
            }}
          >
            <View style={styles.eachFilter}>
              <Text style={styles.filterText}>QTD.</Text>
              <Image
                source={require("../assets/arrow-up.png")}
                style={[
                  styles.filterArrow,
                  filter &&
                    filter.type === 0 &&
                    filter.direction === "down" && {
                      transform: [{ rotate: "180deg" }],
                    },
                ]}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (filter && filter.type !== 1) {
                setFilter({ type: 1, direction: "down" });
              } else {
                setFilter({
                  type: 1,
                  direction: filter?.direction === "up" ? "down" : "up",
                });
              }
            }}
          >
            <View style={styles.eachFilter}>
              <Text style={styles.filterText}>Compra</Text>
              <Image
                source={require("../assets/arrow-up.png")}
                style={[
                  styles.filterArrow,
                  filter &&
                    filter.type === 1 &&
                    filter.direction === "down" && {
                      transform: [{ rotate: "180deg" }],
                    },
                ]}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (filter && filter.type !== 2) {
                setFilter({ type: 2, direction: "down" });
              } else {
                setFilter({
                  type: 2,
                  direction: filter?.direction === "up" ? "down" : "up",
                });
              }
            }}
          >
            <View style={styles.eachFilter}>
              <Text style={styles.filterText}>V (cartão)</Text>
              <Image
                source={require("../assets/arrow-up.png")}
                style={[
                  styles.filterArrow,
                  filter &&
                    filter.type === 2 &&
                    filter.direction === "down" && {
                      transform: [{ rotate: "180deg" }],
                    },
                ]}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.scrollView}>
          {items ? (
            <FlatList<Product>
              data={items}
              renderItem={({ item }) => ItemComponentList(item)}
              onEndReached={() => {
                if (items.length >= page * step) handleItemList();
              }}
              onEndReachedThreshold={0.1}
              keyExtractor={(item) => item.SKU}
              extraData={isFocused}
              ListFooterComponent={
                isLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <></>
                )
              }
            />
          ) : isLoading ? (
            <ActivityIndicator size="small" color="#B090C9" />
          ) : (
            <Text style={{ alignSelf: "center", marginTop: 20 }}>
              Nenhum item encontrado.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#f3f3f3",
  },
  searchResult: {
    width: "90%",
    height: "80%",
    backgroundColor: "#ffffff",
    zIndex: 1,
    borderRadius: 10,
  },
  searchBar: {
    backgroundColor: "#ffffff",
    width: "90%",
    height: 50,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    borderRadius: 50,
    top: 50,
    zIndex: 10,
    marginBottom: 70,
  },
  searchField: {
    flex: 1,
    height: "100%",
    color: "#000000",
  },
  searchIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 10,
    marginLeft: 10,
  },
  filters: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 10,
    borderBottomColor: "#aaaaaa",
    borderBottomWidth: 2,
  },
  eachFilter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  filterArrow: {
    width: 16,
    height: 16,
    resizeMode: "contain",
    marginLeft: 5,
  },
  filterText: {
    fontSize: 14,
  },
  item: {
    width: "100%",
    height: 60,
    borderBottomColor: "#aaaaaa",
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 10,
  },
  itemName: {
    width: "30%",
  },
  itemAttributes: {
    flexDirection: "row",
    alignItems: "center",
    width: "70%",
  },
  itemEachAttribute: {
    width: "33.3%",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    padding: 1,
    height: 600,
  },
});

export default Homepage;
