import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { colors } from "../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import CardList from "../components/CardList";
import { TouchableOpacity } from "react-native";
import { SearchSvg } from "../components/svg";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native";
import { HeartListSvg } from "../components/svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect } from "react-redux";
import { setFavorites } from "../redux";
import { common_styles } from "../config/externalstyles";
import axios from "axios";

const { width, height } = Dimensions.get("screen");
const carousel_height = height - 250;

const Home = (props) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allData, setAllData] = useState(null);
  const slidesRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  const getFavoriteFromStorage = async () => {
    try {
      const favoriteStorage = await AsyncStorage.getItem("favorite_storage");

      if (favoriteStorage !== null) {
        let stored = JSON.parse(favoriteStorage);
        props.setFavorites([...stored]);
      }
    } catch (e) {
      console.log("Warning get in Home.js: " + e.message);
    }
  };

  const watchHandler = async (item) => {
    let newItem = { ...item, id: item.link };

    console.log("presenting: ", newItem);
    props.navigation.navigate({
      name: `watch_page`,
      params: { item: newItem },
      merge: true,
    });
  };
  const custom_axios = axios.create({
    baseURL: "https://hmyww333a2.execute-api.us-west-2.amazonaws.com/",
  });
  const load = async () => {
    let count = 0;
    setIsLoading(true);
    setHasError(false);
    await custom_axios
      .get("")
      .then(async (res) => {
        count += 1;
        setAllData(res.data?.links);
      })
      .catch((e) => {
        setHasError(true);
        console.log(e);
      });

    setIsLoading(false);
    // setTimeout(() => {
    if (count != 1) {
      setHasError(true);
    }
    // }, 10000);
  };
  useEffect(() => {
    getFavoriteFromStorage();
    load();
  }, []);

  const Indicator = ({ scrollX, scrollTo }) => {
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
            justifyContent: "center",
            width,
            marginVertical: 10,
            marginBottom: 18,
          }}
        >
          {allData?.slice(0, 10)?.map((_, i) => {
            const inputRange = [
              (i - 2) * width,
              (i - 1) * width,
              i * width,
              (i + 1) * width,
              (i + 2) * width,
            ];

            const color = scrollX.interpolate({
              inputRange,
              outputRange: [
                colors.lightgray,
                colors.lightgray,
                colors.primary,
                colors.lightgray,
                colors.lightgray,
              ],
            });
            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [7, 7, 21, 7, 7],
              extrapolate: "clamp",
            });
            return (
              <View key={`indicator-${i}`}>
                <TouchableOpacity
                  onPress={() => {
                    scrollTo(i);
                  }}
                >
                  <Animated.View
                    style={{
                      backgroundColor: color,
                      borderRadius: 5,
                      height: 7,
                      width: scale,
                    }}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <LinearGradient
        x={10}
        style={styles.header}
        colors={["rgba(0,0,0,0)", "transparent"]}
      >
        <View style={{ gap: 10, flexDirection: "row" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => props.navigation.navigate("search_page")}
          >
            <View style={styles.navigation}>
              <SearchSvg />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => props.navigation.navigate("favorite_page")}
          >
            <View style={styles.navigation}>
              <HeartListSvg />
            </View>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            styles.logo_text,
            {
              backgroundColor: "rgba(0,0,0,.5)",
              padding: 15,
              paddingVertical: 5,
              borderRadius: 100,
            },
          ]}
        >
          ASIAN
          <Text style={[styles.logo_text, { color: colors.primary }]}>
            HUBA
          </Text>
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View
          style={{
            height: height - 100,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <Text
            style={[
              styles.simple_text,
              {
                fontSize: 15,
                paddingTop: 60,
              },
            ]}
          >
            This takes some time to load.
          </Text>
        </View>
      ) : (
        <>
          {hasError ? (
            <View
              style={{
                height: height - 100,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 40,
              }}
            >
              <Text style={[styles.simple_text, { paddingTop: 60 }]}>
                Something went wrong. Please make sure you are connected to the
                internet.
              </Text>
              <TouchableOpacity activeOpacity={0.6} onPress={load}>
                <View style={{ alignItems: "center" }}>
                  <Text
                    style={[
                      styles.episode_text,
                      { fontSize: 15, marginTop: 10 },
                    ]}
                  >
                    Reload
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView>
              <Animated.FlatList
                ref={slidesRef}
                data={allData?.slice(0, 10)}
                horizontal
                scrollEventThrottle={32}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                renderItem={({ item }) => {
                  return (
                    <View style={styles.carousel}>
                      <View>
                        <Image
                          blurRadius={2}
                          resizeMode="cover"
                          style={{
                            position: "absolute",
                            zIndex: 0,
                            width: width,
                            height: carousel_height,
                          }}
                          source={{ uri: item?.image }}
                        />
                        <Image
                          style={{
                            width: width,
                            resizeMode: "contain",
                            height: carousel_height,
                          }}
                          source={{ uri: item?.image }}
                        />
                      </View>
                      <LinearGradient
                        x={10}
                        style={styles.gradient}
                        colors={["transparent", colors.black]}
                      />
                      <View style={styles.card_image}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => watchHandler(item)}
                        >
                          <View style={styles.play_btn}>
                            <Image
                              source={require("../assets/images/play.png")}
                              style={{
                                width: width * 0.05,
                                height: width * 0.05,
                                margin: 25,
                                resizeMode: "contain",
                              }}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={{
                          padding: 10,
                          zIndex: 2,
                          width,
                          position: "absolute",
                          bottom: 0,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text style={styles.episode_text}>
                            Episode Aired: {item?.episode}
                          </Text>
                        </View>
                        <Text numberOfLines={2} style={styles.title}>
                          {item?.title}
                        </Text>
                      </View>
                    </View>
                  );
                }}
              />
              <Indicator
                scrollTo={(id) =>
                  slidesRef.current.scrollToIndex({ index: id })
                }
                scrollX={scrollX}
              />
              <CardList
                title="Recently Drama"
                data={allData?.slice(10, 23)}
                {...props}
              />
              <CardList
                title="Featured Drama"
                data={allData?.slice(23, 36)}
                {...props}
              />
              <CardList
                title="Trending"
                data={allData?.slice(36, 50)}
                {...props}
              />
              <CardList title="Asian Drama" data={allData?.all_tv} {...props} />

              <View
                style={{
                  padding: 15,
                }}
              />
            </ScrollView>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default connect(null, { setFavorites })(Home);

const styles = StyleSheet.create({
  ...common_styles({ width, carousel_height }),
  logo_text: {
    textAlign: "center",
    fontFamily: "montserrat_extrabold",
    fontSize: 25,
    color: colors.white,
  },
});
