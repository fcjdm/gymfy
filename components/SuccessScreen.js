import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SuccessScreen() {
  return (
    <View style={styles.container}>
      <Text>Logueo exitoso</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});