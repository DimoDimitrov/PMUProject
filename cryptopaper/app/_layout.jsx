import { Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import AppTopHeader from "../components/AppTopHeader";
import { bootstrapDatabase } from "../database/bootstrap";

export default function RootLayout() {
  useEffect(() => {
    bootstrapDatabase().catch((error) => {
      console.error("Неуспешно зареждане на базата данни:", error);
    });
  }, []);

  return (
    <View style={styles.container}>
      <AppTopHeader />
      <View style={styles.stackContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
});
