import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";

const TOP_COINS_LIMIT = 100;

function formatMoney(value) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1 ? 2 : 6,
  }).format(value);
}

function formatCompactNumber(value) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return `${value.toFixed(2)}%`;
}

function getCoinLogoUrl(coinId) {
  return `https://static.coinpaprika.com/coin/${coinId}/logo.png`;
}

async function fetchTopTickers() {
  const params = new URLSearchParams({
    quotes: "USD",
    limit: TOP_COINS_LIMIT.toString(),
  });
  const response = await fetch(`https://api.coinpaprika.com/v1/tickers?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch top coins (${response.status})`);
  }

  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

export default function CryptoListSection({ colors }) {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCoins() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const results = await fetchTopTickers();

        if (isMounted) {
          setCoins(results);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Could not load crypto prices.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCoins();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Loading crypto market data...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: colors.text }]}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {coins.map((coin) => {
        const usdQuote = coin.quotes?.USD ?? {};
        const change24h = usdQuote.percent_change_24h;
        const isPositive = typeof change24h === "number" && change24h >= 0;

        return (
          <View
            key={coin.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.coinIdentityRow}>
                <Image
                  source={{ uri: getCoinLogoUrl(coin.id) }}
                  style={[styles.coinLogo, { borderColor: colors.border }]}
                />
                <View style={styles.coinTextBlock}>
                  <Text style={[styles.coinName, { color: colors.title }]}>
                    {coin.name}
                  </Text>
                  <Text style={[styles.coinSymbol, { color: colors.text }]}>
                    {coin.symbol} • Rank #{coin.rank}
                  </Text>
                </View>
              </View>
              <Text style={[styles.price, { color: colors.title }]}>
                {formatMoney(usdQuote.price)}
              </Text>
            </View>

            <View style={styles.metricsRow}>
              <Text style={[styles.metricText, { color: colors.text }]}>
                24h:{" "}
                <Text style={{ color: isPositive ? "#16A34A" : "#DC2626" }}>
                  {formatPercent(change24h)}
                </Text>
              </Text>
              <Text style={[styles.metricText, { color: colors.text }]}>
                MCap: {formatCompactNumber(usdQuote.market_cap)}
              </Text>
              <Text style={[styles.metricText, { color: colors.text }]}>
                Vol: {formatCompactNumber(usdQuote.volume_24h)}
              </Text>
            </View>

            <Pressable
              style={[styles.assetDetailButton, { backgroundColor: colors.primary }]}
              onPress={() =>
                router.push({
                  pathname: "/pages/asset-detail",
                  params: { coinId: coin.id, coinName: coin.name },
                })
              }
            >
              <Text style={[styles.assetDetailButtonText, { color: colors.buttonText }]}>
                Asset Details
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 12,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: "center",
  },
  listContainer: {
    marginTop: 16,
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  coinIdentityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 6,
  },
  coinTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  coinLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
  },
  coinName: {
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
    flexWrap: "wrap",
    lineHeight: 22,
    width: "100%",
  },
  coinSymbol: {
    marginTop: 2,
    fontSize: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "right",
    minWidth: 96,
    flexShrink: 0,
    marginTop: 2,
  },
  metricsRow: {
    marginTop: 10,
    gap: 3,
  },
  metricText: {
    fontSize: 13,
  },
  assetDetailButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  assetDetailButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
