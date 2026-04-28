import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { setSessionState, useSessionState } from "../constants/session";
import {
  createPortfolioEntry,
  deletePortfolioEntry,
  listPortfolioByUserId,
  updatePortfolioEntry,
  updateUser,
} from "../database/repositories";

function formatMoney(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Не е налична";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value > 1 ? 2 : 6,
  }).format(value);
}

export default function PaperTradingSection({ colors, coinId, coinName }) {
  const session = useSessionState();
  const [quantity, setQuantity] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [ownedQuantity, setOwnedQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);

  const user = session.user;
  const isLoggedIn = session.isLoggedIn;

  const tradeQuantity = Number(quantity);
  const estimatedValue = useMemo(() => {
    if (!currentPrice || !Number.isFinite(tradeQuantity) || tradeQuantity <= 0) {
      return 0;
    }

    return currentPrice * tradeQuantity;
  }, [currentPrice, tradeQuantity]);

  useEffect(() => {
    let isMounted = true;

    async function loadPrice() {
      try {
        setIsLoadingPrice(true);
        const response = await fetch(`https://api.coinpaprika.com/v1/tickers/${coinId}`);
        if (!response.ok) {
          throw new Error(`Неуспешно зареждане на текущата цена (${response.status})`);
        }
        const payload = await response.json();
        const price = payload?.quotes?.USD?.price;
        if (isMounted) {
          setCurrentPrice(typeof price === "number" ? price : null);
        }
      } catch (error) {
        if (isMounted) {
          setCurrentPrice(null);
          setErrorMessage(error.message || "Неуспешно зареждане на текущата цена.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPrice(false);
        }
      }
    }

    loadPrice();
    return () => {
      isMounted = false;
    };
  }, [coinId]);

  useEffect(() => {
    let isMounted = true;

    async function loadOwnedQuantity() {
      if (!isLoggedIn || !user?.id) {
        setOwnedQuantity(0);
        return;
      }
      const entries = await listPortfolioByUserId(user.id);
      const totalForCoin = entries
        .filter((entry) => entry.crypto_title === coinName)
        .reduce((sum, entry) => sum + Number(entry.quantity ?? 0), 0);
      const rounded = parseFloat(totalForCoin.toFixed(10));
      if (isMounted) {
        setOwnedQuantity(rounded < 1e-9 ? 0 : rounded);
      }
    }

    loadOwnedQuantity();
    return () => {
      isMounted = false;
    };
  }, [coinName, isLoggedIn, user?.id]);

  async function refreshOwnedQuantity() {
    if (!isLoggedIn || !user?.id) {
      setOwnedQuantity(0);
      return;
    }
    const entries = await listPortfolioByUserId(user.id);
    const totalForCoin = entries
      .filter((entry) => entry.crypto_title === coinName)
      .reduce((sum, entry) => sum + Number(entry.quantity ?? 0), 0);
    const rounded = parseFloat(totalForCoin.toFixed(10));
    setOwnedQuantity(rounded < 1e-9 ? 0 : rounded);
  }

  async function handleBuy() {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!isLoggedIn || !user?.id) {
        throw new Error("Влизането е задължително за търговия.");
      }
      if (!currentPrice) {
        throw new Error("Текущата цена не е налична.");
      }
      if (!Number.isFinite(tradeQuantity) || tradeQuantity <= 0) {
        throw new Error("Въведете валидно количество, по-голямо от 0.");
      }

      const totalCost = currentPrice * tradeQuantity;
      const availableFunds = Number(user.availableFunds ?? 0);
      if (totalCost > availableFunds) {
        throw new Error("Недостатъчни средства за тази сделка.");
      }

      setIsSubmitting(true);
      await createPortfolioEntry({
        userId: user.id,
        cryptoTitle: coinName,
        price: currentPrice,
        quantity: tradeQuantity,
      });

      const updatedUser = await updateUser(user.id, {
        fundsUsd: availableFunds - totalCost,
      });

      if (updatedUser) {
        setSessionState({
          user: {
            ...user,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profile_picture,
            availableFunds: updatedUser.funds_usd,
          },
        });
      }

      await refreshOwnedQuantity();
      setQuantity("");
      setSuccessMessage(`Bought ${tradeQuantity} ${coinName}.`);
    } catch (error) {
      setErrorMessage(error.message || "Купуването не бе успешно.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSell() {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!isLoggedIn || !user?.id) {
        throw new Error("Влизането е задължително за търговия.");
      }
      if (!currentPrice) {
        throw new Error("Текущата цена не е налична.");
      }
      if (!Number.isFinite(tradeQuantity) || tradeQuantity <= 0) {
        throw new Error("Въведете валидно количество, по-голямо от 0.");
      }
      if (tradeQuantity > ownedQuantity) {
        throw new Error("Нямате достатъчно количество за продажба.");
      }

      setIsSubmitting(true);
      const userEntries = await listPortfolioByUserId(user.id);
      const coinEntries = userEntries
        .filter((entry) => entry.crypto_title === coinName && Number(entry.quantity) > 0)
        .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)));

      let remainingToSell = tradeQuantity;
      for (const entry of coinEntries) {
        if (remainingToSell <= 0) {
          break;
        }

        const entryQuantity = Number(entry.quantity ?? 0);
        if (entryQuantity <= remainingToSell) {
          await deletePortfolioEntry(entry.id);
          remainingToSell -= entryQuantity;
        } else {
          await updatePortfolioEntry(entry.id, { quantity: entryQuantity - remainingToSell });
          remainingToSell = 0;
        }
      }

      const availableFunds = Number(user.availableFunds ?? 0);
      const proceeds = currentPrice * tradeQuantity;
      const updatedUser = await updateUser(user.id, {
        fundsUsd: availableFunds + proceeds,
      });

      if (updatedUser) {
        setSessionState({
          user: {
            ...user,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profile_picture,
            availableFunds: updatedUser.funds_usd,
          },
        });
      }

      await refreshOwnedQuantity();
      setQuantity("");
      setSuccessMessage(`Sold ${tradeQuantity} ${coinName}.`);
    } catch (error) {
      setErrorMessage(error.message || "Продажът не бе успешно.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Paper Trading (Тестова търговия)</Text>
      <Text style={[styles.description, { color: colors.text }]}>
        Търговете {coinName} с вашия тестов баланс.
      </Text>

      <View style={[styles.infoBox, { borderColor: colors.border }]}>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Текуща цена: {isLoadingPrice ? "Зареждане..." : formatMoney(currentPrice)}
        </Text>
        <Text style={[styles.infoText, { color: colors.text }]}>Имате: {parseFloat((Number(ownedQuantity).toFixed(5)))}</Text>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Оценена стойност: {formatMoney(estimatedValue)}
        </Text>
      </View>

      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Количество"
        placeholderTextColor="#94A3B8"
        keyboardType="decimal-pad"
        editable={!isSubmitting}
        style={[
          styles.input,
          { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
        ]}
      />

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

      <View style={styles.actionRow}>
        <Pressable
          disabled={isSubmitting || isLoadingPrice}
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary, opacity: isSubmitting || isLoadingPrice ? 0.6 : 1 },
          ]}
          onPress={handleBuy}
        >
          <Text style={[styles.actionButtonText, { color: colors.buttonText }]}>
            {isSubmitting ? "Работи..." : "Купи"}
          </Text>
        </Pressable>
        <Pressable
          disabled={isSubmitting || isLoadingPrice}
          style={[
            styles.actionButton,
            { backgroundColor: "#DC2626", opacity: isSubmitting || isLoadingPrice ? 0.6 : 1 },
          ]}
          onPress={handleSell}
        >
          <Text style={[styles.actionButtonText, { color: "#FFFFFF" }]}>
            {isSubmitting ? "Работи..." : "Продай"}
          </Text>
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
  infoBox: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  infoText: {
    fontSize: 12,
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  errorText: {
    marginTop: 10,
    color: "#DC2626",
    fontSize: 13,
  },
  successText: {
    marginTop: 10,
    color: "#16A34A",
    fontSize: 13,
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
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
