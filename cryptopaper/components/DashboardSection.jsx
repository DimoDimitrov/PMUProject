import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSessionState } from "../constants/session";
import { listAllPortfolioEntries } from "../database/repositories";

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function DashboardSection({ colors }) {
  const session = useSessionState();
  const isLoggedIn = session.isLoggedIn;
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      setEntries([]);
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);
        const data = await listAllPortfolioEntries();
        setEntries(data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(error.message || "Неуспешно зареждане на данните за табло.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isLoggedIn]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Закупени активи</Text>
      <Text style={[styles.description, { color: colors.text }]}>
        Всички позиции на потребителите с закупени крипто, количество и цена на закупуване.
      </Text>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {!isLoggedIn ? (
        <Text style={[styles.infoText, { color: colors.text }]}>
          Влезте в акаунта си, за да видите данните за табло.
        </Text>
      ) : isLoading ? (
        <Text style={[styles.infoText, { color: colors.text }]}>Loading assets...</Text>
      ) : entries.length === 0 ? (
        <Text style={[styles.infoText, { color: colors.text }]}>
          Няма закупени крипто активи.
        </Text>
      ) : (
        <>
          <View style={[styles.headerRow, { borderColor: colors.border }]}>
            <Text style={[styles.headerUser, { color: colors.title }]}>Потребител</Text>
            <Text style={[styles.headerCrypto, { color: colors.title }]}>Крипто</Text>
            <Text style={[styles.headerQty, { color: colors.title }]}>Количество</Text>
            <Text style={[styles.headerPrice, { color: colors.title }]}>Цена на закупуване</Text>
          </View>

          {entries.map((entry) => (
            <View key={entry.id} style={[styles.dataRow, { borderColor: colors.border }]}>
              <View style={styles.userCell}>
                <Text style={[styles.primaryText, { color: colors.text }]}>@{entry.username}</Text>
                <Text style={[styles.secondaryText, { color: colors.text }]}>{entry.email}</Text>
              </View>
              <Text style={[styles.cryptoCell, { color: colors.text }]}>{entry.crypto_title}</Text>
              <Text style={[styles.qtyCell, { color: colors.text }]}>
                {parseFloat(Number(entry.quantity).toFixed(5))}
              </Text>
              <Text style={[styles.priceCell, { color: colors.text }]}>{formatPrice(entry.price)}</Text>
            </View>
          ))}
        </>
      )}
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
  description: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
  },
  errorText: {
    marginTop: 10,
    color: "#DC2626",
    fontSize: 13,
  },
  infoText: {
    marginTop: 12,
    fontSize: 13,
  },
  headerRow: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerUser: {
    flex: 1.2,
    fontSize: 12,
    fontWeight: "700",
  },
  headerCrypto: {
    flex: 1.1,
    fontSize: 12,
    fontWeight: "700",
  },
  headerQty: {
    flex: 0.6,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  headerPrice: {
    flex: 0.9,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  dataRow: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  userCell: {
    flex: 1.2,
    paddingRight: 8,
  },
  primaryText: {
    fontSize: 13,
    fontWeight: "700",
  },
  secondaryText: {
    marginTop: 2,
    fontSize: 11,
    opacity: 0.85,
  },
  cryptoCell: {
    flex: 1.1,
    fontSize: 12,
  },
  qtyCell: {
    flex: 0.6,
    fontSize: 12,
    textAlign: "right",
  },
  priceCell: {
    flex: 0.9,
    fontSize: 12,
    textAlign: "right",
  },
});
