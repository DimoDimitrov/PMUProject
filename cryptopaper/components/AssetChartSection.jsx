import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";

function formatDateForApi(date) {
  return date.toISOString().slice(0, 10);
}

function getHistoricalEndpoint(coinId) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const params = new URLSearchParams({
    start: formatDateForApi(startDate),
    end: formatDateForApi(endDate),
    interval: "1d",
  });

  return `https://api.coinpaprika.com/v1/tickers/${coinId}/historical?${params.toString()}`;
}

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

export default function AssetChartSection({ colors, coinId, coinName }) {
  const { width: screenWidth } = useWindowDimensions();
  const [chartPoints, setChartPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(getHistoricalEndpoint(coinId));
        if (!response.ok) {
          throw new Error(`Could not load chart (${response.status})`);
        }

        const payload = await response.json();
        const points = payload
          .map((entry, index) => {
            const closePrice = entry?.price;
            const timestamp = entry?.timestamp;
            const formattedDay = timestamp
              ? new Date(timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "";

            if (typeof closePrice !== "number") {
              return null;
            }

            return {
              value: Number(closePrice.toFixed(2)),
              label: "",
              dateLabel: formattedDay,
              dataPointText: "",
            };
          })
          .filter(Boolean);

        if (isMounted) {
          setChartPoints(points);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Could not load chart data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [coinId]);

  const latestPoint = useMemo(() => {
    if (!chartPoints.length) {
      return null;
    }

    return chartPoints[chartPoints.length - 1];
  }, [chartPoints]);

  const chartWidth = useMemo(() => {
    const horizontalScreenPadding = 40; // page content padding (20 * 2)
    const cardInternalPadding = 28; // chart card padding (14 * 2)
    const reservedExtra = 48; // y-axis labels + spacing buffer
    const computedWidth =
      screenWidth - horizontalScreenPadding - cardInternalPadding - reservedExtra;

    return Math.max(180, computedWidth);
  }, [screenWidth]);

  const bottomLabels = useMemo(() => {
    if (!chartPoints.length) {
      return [];
    }

    const indexes = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
      Math.min(chartPoints.length - 1, Math.round((chartPoints.length - 1) * ratio)),
    );

    return indexes.map((idx) => chartPoints[idx]?.dateLabel ?? "");
  }, [chartPoints]);

  if (isLoading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Loading 30-day chart...
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

  if (!chartPoints.length) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          No chart data available for this asset.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>
        {coinName} - Last 30 Days
      </Text>
      <Text style={[styles.price, { color: colors.text }]}>
        Latest close: {formatMoney(latestPoint?.value)}
      </Text>

      <LineChart
        data={chartPoints}
        color={colors.primary}
        thickness={2}
        hideDataPoints
        yAxisTextStyle={{ color: colors.text, fontSize: 11 }}
        xAxisLabelTextStyle={{ color: colors.text, fontSize: 10 }}
        xAxisLabelTexts={chartPoints.map(() => "")}
        xAxisColor={colors.border}
        yAxisColor={colors.border}
        rulesColor={colors.border}
        noOfSections={4}
        spacing={10}
        initialSpacing={8}
        width={chartWidth}
        yAxisLabelWidth={42}
        xAxisLabelsVerticalShift={2}
        isAnimated
      />

      <View style={styles.bottomLabelsRow}>
        {bottomLabels.map((label, index) => (
          <Text key={`${label}-${index}`} style={[styles.bottomLabel, { color: colors.text }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    marginTop: 4,
    marginBottom: 10,
    fontSize: 13,
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
  bottomLabelsRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomLabel: {
    fontSize: 10,
  },
});
