import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View, useColorScheme } from "react-native";
import { appTheme } from "../constants/theme";

export default function PageHeader({ title }) {
  const colorScheme = useColorScheme();
  const colors = appTheme[colorScheme] ?? appTheme.light;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/");
  };

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      <Pressable onPress={handleBack} style={styles.backButton}>
        <Text style={[styles.backArrow, { color: colors.title }]}>{"\u2190"}</Text>
      </Pressable>
      <Text style={[styles.title, { color: colors.title }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backArrow: {
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 26,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
});
