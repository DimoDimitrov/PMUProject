import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

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

function DetailRow({ label, value, colors }) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.title }]}>{value}</Text>
    </View>
  );
}

export default function AssetDetailsSection({ colors, coinId }) {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDetails() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`);
        if (!response.ok) {
          throw new Error(`Could not load details (${response.status})`);
        }

        const payload = await response.json();
        if (isMounted) {
          setDetails(payload);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Could not load asset details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      isMounted = false;
    };
  }, [coinId]);

  if (isLoading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Loading asset details...
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

  if (!details) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Asset details are not available right now.
        </Text>
      </View>
    );
  }

  const usdQuote = details.quotes?.USD ?? {};

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Asset Details</Text>

      <DetailRow label="Rank" value={`#${details.rank ?? "N/A"}`} colors={colors} />
      <DetailRow label="Current Price" value={formatMoney(usdQuote.price)} colors={colors} />
      <DetailRow
        label="24h Change"
        value={formatPercent(usdQuote.percent_change_24h)}
        colors={colors}
      />
      <DetailRow
        label="24h Volume"
        value={formatCompactNumber(usdQuote.volume_24h)}
        colors={colors}
      />
      <DetailRow
        label="Market Cap"
        value={formatCompactNumber(usdQuote.market_cap)}
        colors={colors}
      />
      <DetailRow
        label="Circulating Supply"
        value={formatCompactNumber(details.circulating_supply)}
        colors={colors}
      />
      <DetailRow
        label="Total Supply"
        value={formatCompactNumber(details.total_supply)}
        colors={colors}
      />
      <DetailRow
        label="All Time High"
        value={formatMoney(usdQuote.ath_price)}
        colors={colors}
      />
      <DetailRow
        label="From ATH"
        value={formatPercent(usdQuote.percent_from_price_ath)}
        colors={colors}
      />
      <View style={styles.lastRow}>
        <Text style={[styles.detailLabel, { color: colors.text }]}>ATH Date</Text>
        <Text style={[styles.detailValue, { color: colors.title }]}>
          {usdQuote.ath_date ? new Date(usdQuote.ath_date).toLocaleDateString() : "N/A"}
        </Text>
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
    marginBottom: 8,
  },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  lastRow: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  feedbackContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 12,
  },
  feedbackText: {
    fontSize: 14,
    textAlign: "center",
  },
});
