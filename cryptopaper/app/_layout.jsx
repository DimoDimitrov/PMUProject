import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import AppTopHeader from "../components/AppTopHeader";

export default function RootLayout() {
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
