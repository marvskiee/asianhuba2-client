import { StyleSheet, Text, View, Image, ToastAndroid } from "react-native";
import React, { useEffect, useState } from "react";
import axios_config from "../config/axios_config";
import { colors } from "../config/colors";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import CardList from "../components/CardList";
import { BackSvg, HeartOutlineSvg, HeartSolidSvg } from "../components/svg";
import { connect } from "react-redux";
import { setFavorites } from "../redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { common_styles } from "../config/externalstyles";
import { badges } from "../var";
const { width, height } = Dimensions.get("screen");
export const carousel_height = height - 250;

const Info = (props) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [dramaInfo, setDramaInfo] = useState(null);
  const setFavoriteFromStorage = async (newFavorite) => {
    try {
      await AsyncStorage.setItem(
        "favorite_storage",
        JSON.stringify(newFavorite)
      );
    } catch (e) {
      console.log("Warning set in Info.js: " + e);
    }
  };
  const heartHandler = () => {
    const { id, image, title } = dramaInfo;
    const newData = {
      id,
      image,
      title,
    };
    if (props?.favorite.filter((i) => i.id == dramaInfo?.id)?.length > 0) {
      ToastAndroid.show("Drama Remove to Favorite's.", ToastAndroid.SHORT);
      let newFavorite = [
        ...props?.favorite.filter((i) => i.id != dramaInfo?.id),
      ];
      props.setFavorites(newFavorite);
      setFavoriteFromStorage(newFavorite);
    } else {
      ToastAndroid.show("Added to Favorite Drama", ToastAndroid.SHORT);
      let newFavorite = [...new Set([...props?.favorite, newData])];
      props.setFavorites(newFavorite);
      setFavoriteFromStorage(newFavorite);
    }

    setIsFavorite(!isFavorite);
  };
  const [error, setError] = useState(false);
  const watchHandler = async (item) => {
    props.navigation.navigate({
      name: `watch_page`,
      params: { item },
      merge: true,
    });
  };
  const load = async (id) => {
    let count = 0;
    await axios_config
      .get("info?id=" + id)
      .then((res) => {
        count += 1;
        console.log(res.data);
        setDramaInfo(res.data);
      })
      .catch((e) => {
        if (e?.message != "Network Error") {
          setError(1);
        } else {
          setError(2);
        }
        console.log(e?.message);
      });
  };

  useEffect(() => {
    const data = props.route.params?.item;
    // console.log("hi", data);
    load(data?.id);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {dramaInfo ? (
        <View>
          <LinearGradient
            x={10}
            style={styles.header}
            colors={["rgba(0,0,0,0)", "transparent"]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => props.navigation.goBack()}
            >
              <View style={styles.navigation}>
                <BackSvg />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => heartHandler()}
            >
              <View style={styles.navigation}>
                {props?.favorite.filter((i) => i.id == dramaInfo?.id)?.length >
                0 ? (
                  <HeartSolidSvg />
                ) : (
                  <HeartOutlineSvg />
                )}
              </View>
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView>
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
                  source={{ uri: props.route.params?.item?.image }}
                />
                <Image
                  style={{
                    width: width,
                    resizeMode: "contain",
                    height: carousel_height,
                  }}
                  source={{ uri: dramaInfo?.image }}
                />
              </View>
              <LinearGradient
                x={10}
                style={styles.gradient}
                colors={["transparent", "rgba(0,0,0,1)"]}
              />
              <View style={styles.card_image}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => watchHandler(dramaInfo)}
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
                  paddingBottom: 5,
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
                  {dramaInfo?.totalEpisodes ? (
                    <Text style={styles.episode_text}>
                      Episode Aired: {dramaInfo?.totalEpisodes}
                    </Text>
                  ) : (
                    <Text />
                  )}
                  {dramaInfo?.rating && (
                    <Text style={styles.ratings_text}>
                      Ratings:{" "}
                      <Text style={{ color: colors.primary }}>
                        {dramaInfo?.rating}%
                      </Text>
                    </Text>
                  )}
                </View>
                <Text numberOfLines={2} style={styles.title}>
                  {dramaInfo?.title}
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {badges?.map((keys, index) => (
                    <Text style={styles.badge} key={index}>
                      Released Date: {dramaInfo[keys]}
                    </Text>
                  ))}
                </View>
                {/* <Text style={styles.label}>Genres:</Text>
                <Text style={styles.genres}>
                  {dramaInfo?.genre?.join(", ")}
                </Text> */}
              </View>
            </View>
            <Text style={[styles.label, { paddingHorizontal: 10 }]}>
              Description:
            </Text>
            <View>
              <Text style={styles.description}>
                {dramaInfo?.description?.split("<br>").join(" ") ||
                  "No available description."}
              </Text>
            </View>
            <View style={{ padding: 10 }} />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.error_card}>
          {error > 0 ? (
            <View>
              {error == 1 ? (
                <>
                  <Text style={styles.simple_text}>
                    Sorry but server is too busy as of now.{"\n"} Try again
                    after 1 minute!
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => props.navigation.goBack()}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={[
                          styles.episode_text,
                          { fontSize: 15, marginTop: 10 },
                        ]}
                      >
                        Go Back
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.simple_text, { margin: 30 }]}>
                    Something went wrong. Please make sure you are connected to
                    the internet.
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
                </>
              )}
            </View>
          ) : (
            <Text style={styles.simple_text}>Fetching Data. Please Wait.</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};
const mapStateToProps = (state) => {
  return {
    favorite: state.favorite.favorite,
  };
};
export default connect(mapStateToProps, { setFavorites })(Info);

const styles = StyleSheet.create({
  ...common_styles({ width, carousel_height, height }),
  description: {
    opacity: 0.85,
    // marginBottom: 20,
    fontFamily: "montserrat_medium",
    color: colors.white,
    textAlign: "justify",
    lineHeight: 23,
    padding: 10,
    fontSize: 15,
    paddingVertical: 5,
  },
  genres: {
    fontFamily: "montserrat_medium",
    color: colors.white,
    opacity: 0.85,
    fontSize: 15,
  },
});
