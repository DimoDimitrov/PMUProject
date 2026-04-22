import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { appTheme } from "../constants/theme";
import { sessionState } from "../constants/session";
import appLogo from "../assets/images/5eca783f2637b4df2ade7fd7ebc54ad8.webp";

const MENU_PAGES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "crypto-list", label: "Cryptocurrency Listing" },
  { key: "profile", label: "User Profile" },
  { key: "admin-dashboard", label: "Admin Dashboard", adminOnly: true },
  { key: "user-management", label: "User Management", adminOnly: true },
  { key: "news-feed", label: "News Feed" },
];

export default function Index() {
  const colorScheme = useColorScheme();
  const colors = appTheme[colorScheme] ?? appTheme.light;
  const authState = {
    isLoggedIn: sessionState.isLoggedIn,
    role: sessionState.user?.role ?? "guest",
  };

  const visibleMenuPages = MENU_PAGES.filter((page) => {
    if (!page.adminOnly) {
      return true;
    }

    return authState.isLoggedIn && authState.role === "admin";
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.titleRow}>
            <Image
              source={appLogo}
              style={[
                styles.logo,
                { borderColor: colors.border, backgroundColor: colors.surface },
              ]}
              resizeMode="cover"
            />
            <Text style={[styles.title, { color: colors.title }]}>CryptoPaper</Text>
          </View>
        <Text style={[styles.subtitle, { color: colors.text }]}>Welcome!</Text>
          <Text style={[styles.info, { color: colors.text }]}>
            This is the best paper trading platform for you!
          </Text>
        </View>

        <View style={styles.menuList}>
          {visibleMenuPages.map((page) => (
            <Pressable
              key={page.key}
              style={[styles.menuButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/pages/${page.key}`)}
            >
              <Text style={[styles.menuButtonText, { color: colors.buttonText }]}>
                {page.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
    minHeight: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  info:{
    marginTop: 1,
    marginBottom: 28,
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
    maxWidth: 320,
  },
  menuList: {
    gap: 12,
  },
  menuButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
