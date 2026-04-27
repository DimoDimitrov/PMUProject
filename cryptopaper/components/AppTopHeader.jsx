import { Image, StyleSheet, Text, View, useColorScheme } from "react-native";
import { useSessionState } from "../constants/session";
import { appTheme } from "../constants/theme";

function formatCurrency(amount) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getInitials(username) {
  if (!username) {
    return "U";
  }

  return username.trim().slice(0, 2).toUpperCase();
}

export default function AppTopHeader() {
  const colorScheme = useColorScheme();
  const colors = appTheme[colorScheme] ?? appTheme.light;
  const sessionState = useSessionState();
  const isLoggedIn = sessionState.isLoggedIn;
  const username = sessionState.user?.username ?? "User";
  const availableFunds = sessionState.user?.availableFunds ?? 0;
  const profilePicture = sessionState.user?.profilePicture;

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderBottomColor: colors.border },
      ]}
    >
      {isLoggedIn ? (
        <View style={styles.loggedInRow}>
          <View style={styles.userInfo}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={[styles.avatarImage, { borderColor: colors.border }]}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: colors.primary, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.avatarText, { color: colors.buttonText }]}>
                  {getInitials(username)}
                </Text>
              </View>
            )}
            <View>
              <Text style={[styles.usernameLabel, { color: colors.text }]}>
                @{username}
              </Text>
              <Text style={[styles.statusLabel, { color: colors.text }]}>
                Влезли
              </Text>
            </View>
          </View>

          <View style={styles.fundsBox}>
            <Text style={[styles.fundsLabel, { color: colors.text }]}>
              Налични средства
            </Text>
            <Text style={[styles.fundsValue, { color: colors.title }]}>
              {formatCurrency(availableFunds)}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={[styles.loggedOutText, { color: "#94A3B8" }]}>
          Не сте влезли. Влезте, за да видите детайлите.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 14,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  loggedInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  usernameLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusLabel: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 1,
  },
  fundsBox: {
    alignItems: "flex-end",
  },
  fundsLabel: {
    fontSize: 12,
    opacity: 0.9,
  },
  fundsValue: {
    marginTop: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  loggedOutText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
