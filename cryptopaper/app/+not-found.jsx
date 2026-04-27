import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.title}>Тази страница не съществува.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Отидете на началната страница!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  link: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  linkText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
