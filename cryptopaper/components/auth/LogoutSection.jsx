import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { logOutUser } from "../../constants/session";

export default function LogoutSection({ colors }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Изход</Text>
      <Text style={[styles.text, { color: colors.text }]}>
        Завършете текущата сесия и се върнете в режим на гост.
      </Text>
      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => {
          logOutUser();
          router.replace("/");
        }}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          Потвърдете изхода
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  text: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
