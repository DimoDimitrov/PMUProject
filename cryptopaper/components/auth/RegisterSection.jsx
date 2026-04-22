import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createUser } from "../../database/repositories";
import { logInUser, setPreferredAuthTab } from "../../constants/session";

export default function RegisterSection({ colors }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (!username.trim() || !email.trim() || !password.trim()) {
        setErrorMessage("Please fill all fields.");
        return;
      }

      const user = await createUser({
        role: "customer",
        fundsUsd: 10000,
        email: email.trim(),
        username: username.trim(),
        password,
        profilePicture: null,
      });

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
      setErrorMessage(error.message || "Registration failed.");
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
      <Text style={[styles.title, { color: colors.title }]}>Create Account</Text>

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        style={[
          styles.input,
          { color: colors.title, borderColor: colors.border, backgroundColor: colors.background },
        ]}
      />
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
        onPress={handleRegister}
        disabled={isSubmitting}
      >
        <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>
          {isSubmitting ? "Creating account..." : "Register"}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, { borderColor: colors.border }]}
        onPress={() => {
          setPreferredAuthTab("login");
          router.replace("/pages/login");
        }}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
          Already have account? Go to Login
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
