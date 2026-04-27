import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY || "";
const NEWS_QUERY = "Crypto";

function getNewsItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.articles)) {
    return payload.articles;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  return [];
}

function formatNewsDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleString();
}

function buildNewsEndpoint() {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    q: NEWS_QUERY,
    language: "en",
  });

  return `https://newsdata.io/api/1/latest?${params.toString()}`;
}

async function fetchNews() {
  if (!NEWS_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_NEWS_API_KEY in .env");
  }

  const endpoint = buildNewsEndpoint();
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return getNewsItems(payload);
}

export default function NewsFeedSection({ colors }) {
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadNews() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const items = await fetchNews();
        if (isMounted) {
          setNewsItems(items);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Неуспешно зареждане на новини.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.feedbackContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Зареждане на последните крипто новини...
        </Text>
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          {errorMessage}
        </Text>
      </View>
    );
  }

  if (!newsItems.length) {
    return (
      <View style={styles.feedbackContainer}>
        <Text style={[styles.feedbackText, { color: colors.text }]}>
          Няма новини от NewsData.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.newsList}>
      {newsItems.map((item, index) => {
        const title = item.title ?? item.headline ?? "Untitled article";
        const summary =
          item.description ??
          item.summary ??
          item.content ??
          item.full_description ??
          "No summary.";
        const source =
          item.source_name ??
          item.source_id ??
          item.source ??
          "Unknown source";
        const publishedAt =
          item.pubDate ?? item.published_at ?? item.publishedAt ?? item.created_at;
        const articleUrl = item.link ?? item.url;

        return (
          <Pressable
            key={`${title}-${index}`}
            style={[
              styles.newsCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {
              if (articleUrl) {
                Linking.openURL(articleUrl);
              }
            }}
          >
            <Text style={[styles.newsTitle, { color: colors.title }]}>{title}</Text>
            <Text style={[styles.newsMeta, { color: colors.text }]}>
              {source} • {formatNewsDate(publishedAt)}
            </Text>
            <Text style={[styles.newsSummary, { color: colors.text }]}>
              {summary}
            </Text>
            <Text style={[styles.newsAction, { color: colors.primary }]}>
              Read full article
            </Text>
          </Pressable>
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
  newsList: {
    marginTop: 16,
    gap: 12,
  },
  newsCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  newsMeta: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.9,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  newsAction: {
    fontSize: 13,
    fontWeight: "700",
  },
});
