import { Pressable, StyleSheet, Text, View } from "react-native";

export default function PaperTradingSection({ colors }) {
  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Paper Trading</Text>
      <Text style={[styles.description, { color: colors.text }]}>
        Trading controls will be enabled after user profiles, role checks, and
        account restrictions are integrated.
      </Text>

      <View style={styles.actionRow}>
        <Pressable
          disabled
          style={[
            styles.actionButton,
            styles.actionButtonDisabled,
            { borderColor: colors.border },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Buy</Text>
        </Pressable>
        <Pressable
          disabled
          style={[
            styles.actionButton,
            styles.actionButtonDisabled,
            { borderColor: colors.border },
          ]}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>Sell</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
