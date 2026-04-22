import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { authenticateUser } from "../../database/repositories";
import { logInUser, setPreferredAuthTab } from "../../constants/session";

export default function LoginSection({ colors }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const user = await authenticateUser(email.trim(), password);
      if (!user) {
        setErrorMessage("Invalid email or password.");
        return;
      }

      logInUser({
        id: user.id,
        role: user.role,
        email: user.email,
        username: user.username,
        profilePicture: user.profile_picture ?? null,
        availableFunds: user.funds_usd ?? 0,
      });

      router.replace("/");
    } catch (error) {
      setErrorMessage(error.message || "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Sign In</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#94A3B8"
        keyboardType="email-address"
        autoCapitalize="none"
        style={[
          styles.input,
          { color: colors.title, borderColor: colors.border, backgroundColor: colors.background },
        ]}
      />
      <View
        style={[
          styles.passwordRow,
          { borderColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!isPasswordVisible}
          style={[styles.passwordInput, { color: colors.title }]}
        />
        <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)}>
          <Text style={[styles.toggleText, { color: colors.primary }]}>
            {isPasswordVisible ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {!!errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>
          {isSubmitting ? "Signing in..." : "Login"}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={() => {
          setPreferredAuthTab("register");
          router.replace("/pages/register");
        }}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
          No account? Go to Register
        </Text>
      </Pressable>
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
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  passwordRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    paddingLeft: 10,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
