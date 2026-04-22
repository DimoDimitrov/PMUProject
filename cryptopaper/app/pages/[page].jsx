import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View, useColorScheme } from "react-native";
import AssetChartSection from "../../components/AssetChartSection";
import AssetDetailsSection from "../../components/AssetDetailsSection";
import CryptoListSection from "../../components/CryptoListSection";
import DashboardSection from "../../components/DashboardSection";
import PageHeader from "../../components/PageHeader";
import PaperTradingSection from "../../components/PaperTradingSection";
import ProfileSection from "../../components/ProfileSection";
import NewsFeedSection from "../../components/NewsFeedSection";
import UserManagementSection from "../../components/UserManagementSection";
import LoginSection from "../../components/auth/LoginSection";
import LogoutSection from "../../components/auth/LogoutSection";
import RegisterSection from "../../components/auth/RegisterSection";
import { appTheme } from "../../constants/theme";

const PAGE_TITLES = {
  login: "Login",
  register: "Register",
  logout: "Log out",
  dashboard: "Dashboard",
  "crypto-list": "Cryptocurrency Listing",
  "asset-detail": "Asset Detail",
  profile: "User Profile",
  "user-management": "User Management",
  "news-feed": "News Feed",
};

const PAGE_NOTES = {
  "crypto-list":
    "Each crypto card will include an Asset Detail button that opens the asset details screen.",
  "asset-detail":
    "This screen is where trading actions (buy/sell) will be implemented for the selected asset.",
};

function normalizePageKey(pageValue) {
  if (Array.isArray(pageValue)) {
    return pageValue[0];
  }

  return pageValue;
}

export default function GenericPage() {
  const colorScheme = useColorScheme();
  const colors = appTheme[colorScheme] ?? appTheme.light;
  const { page, coinId, coinName } = useLocalSearchParams();
  const pageKey = normalizePageKey(page);
  const pageTitle = PAGE_TITLES[pageKey] ?? "Page";
  const selectedCoinId = normalizePageKey(coinId) ?? "btc-bitcoin";
  const selectedCoinName = normalizePageKey(coinName) ?? "Bitcoin";
  const pageNote =
    PAGE_NOTES[pageKey] ??
    "This is a starter page. Next we can build the real content and features here.";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title={pageTitle} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {pageKey === "dashboard" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Overview of bought crypto assets for all users.
            </Text>
            <DashboardSection colors={colors} />
          </>
        ) : pageKey === "crypto-list" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Live base market data from CoinPaprika.
            </Text>
            <CryptoListSection colors={colors} />
          </>
        ) : pageKey === "asset-detail" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>Asset Detail</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Base details and 30-day chart. Trading actions will be added here.
            </Text>
            <AssetChartSection
              colors={colors}
              coinId={selectedCoinId}
              coinName={selectedCoinName}
            />
            <AssetDetailsSection colors={colors} coinId={selectedCoinId} />
            <PaperTradingSection
              colors={colors}
              coinId={selectedCoinId}
              coinName={selectedCoinName}
            />
          </>
        ) : pageKey === "news-feed" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Latest crypto headlines from the API.
            </Text>
            <NewsFeedSection colors={colors} />
          </>
        ) : pageKey === "profile" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Manage account details and profile photo.
            </Text>
            <ProfileSection colors={colors} />
          </>
        ) : pageKey === "user-management" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              View all system users and manage account credentials.
            </Text>
            <UserManagementSection colors={colors} />
          </>
        ) : pageKey === "login" || pageKey === "register" || pageKey === "logout" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Authentication.
            </Text>
            {pageKey === "login" ? (
              <LoginSection colors={colors} />
            ) : pageKey === "register" ? (
              <RegisterSection colors={colors} />
            ) : (
              <LogoutSection colors={colors} />
            )}
          </>
        ) : (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              {pageNote}
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 28,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 10,
  },
  pageDescription: {
    fontSize: 16,
    lineHeight: 22,
  },
});
