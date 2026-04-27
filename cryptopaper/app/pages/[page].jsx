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
  login: "Вход",
  register: "Регистрация",
  logout: "Изход",
  dashboard: "Табло",
  "crypto-list": "Списък с криптовалути",
  "asset-detail": "Детайли за актива",
  profile: "Потребителски профил",
  "user-management": "Управление на потребители",
  "news-feed": "Новини",
};

const PAGE_NOTES = {
  "crypto-list":
    "Всяка карта с крипто включва бутон 'Детайли за актива', който отваря екрана с детайли за актива.",
  "asset-detail":
    "Този екран е за действията по търговия (купуване/продаване) за избрания актив.",
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
    "Това е начална страница. Тук може да се изгради реалното съдържание и функционалности.";

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
              Преглед на закупените крипто активи за всички потребители.
            </Text>
            <DashboardSection colors={colors} />
          </>
        ) : pageKey === "crypto-list" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Пазарни данни в реално време от CoinPaprika.
            </Text>
            <CryptoListSection colors={colors} />
          </>
        ) : pageKey === "asset-detail" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>Детайли за актива</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Основни детайли и 30-дневна графика. Тук ще бъдат добавени действията по търговия.
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
              Най-новите крипто заглавия от API.
            </Text>
            <NewsFeedSection colors={colors} />
          </>
        ) : pageKey === "profile" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Управление на данните на акаунта и профилната снимка.
            </Text>
            <ProfileSection colors={colors} />
          </>
        ) : pageKey === "user-management" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Преглед на всички потребители в системата и управление на акаунтните данни.
            </Text>
            <UserManagementSection colors={colors} />
          </>
        ) : pageKey === "login" || pageKey === "register" || pageKey === "logout" ? (
          <>
            <Text style={[styles.pageTitle, { color: colors.title }]}>{pageTitle}</Text>
            <Text style={[styles.pageDescription, { color: colors.text }]}>
              Автентикация.
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
