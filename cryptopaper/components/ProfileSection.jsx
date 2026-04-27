import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { changePassword, changeUsername, updateUser } from "../database/repositories";
import { setSessionState, useSessionState } from "../constants/session";

export default function ProfileSection({ colors }) {
  const session = useSessionState();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);

  const isLoggedIn = session.isLoggedIn;
  const user = session.user;

  async function handleTakePhoto() {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setErrorMessage("Необходимо е разрешение за камерата, за да актуализирате снимката.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const updatedUser = await updateUser(user.id, {
        profilePicture: imageUri,
      });

      if (!updatedUser) {
        setErrorMessage("Профилът не може да бъде актуализиран в момента.");
        return;
      }

      setSessionState({
        user: {
          ...user,
          profilePicture: updatedUser.profile_picture ?? imageUri,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          availableFunds: updatedUser.funds_usd,
        },
      });
      setSuccessMessage("Профилната снимка е актуализирана.");
    } catch (error) {
      setErrorMessage(error.message || "Заснемането на снимка не бе успешно.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangeUsername() {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      const updatedUser = await changeUsername(user.id, newUsername);
      setSessionState({
        user: {
          ...user,
          profilePicture: updatedUser.profile_picture,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          availableFunds: updatedUser.funds_usd,
        },
      });
      setNewUsername("");
      setSuccessMessage("Потребителското име е актуализирано.");
    } catch (error) {
      setErrorMessage(error.message || "Потребителското име не може да бъде актуализирано.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleChangePassword() {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setIsSaving(true);

      await changePassword(user.id, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setSuccessMessage("Паролата е актуализирана.");
    } catch (error) {
      setErrorMessage(error.message || "Паролата не може да бъде актуализирана.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoggedIn || !user) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.title }]}>Потребителски профил</Text>
        <Text style={[styles.description, { color: colors.text }]}>
          Трябва да влезете, за да редактирате профила си.
        </Text>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/pages/login")}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            Отидете в Вход
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Потребителски профил</Text>
      <Text style={[styles.username, { color: colors.text }]}>@{user.username}</Text>

      <View style={styles.photoWrapper}>
        {user.profilePicture ? (
          <Image source={{ uri: user.profilePicture }} style={styles.photo} />
        ) : (
          <View
            style={[
              styles.photoPlaceholder,
              { borderColor: colors.border, backgroundColor: colors.background },
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.text }]}>Няма снимка</Text>
          </View>
        )}
      </View>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

      <Pressable
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleTakePhoto}
        disabled={isSaving}
      >
        <Text style={[styles.buttonText, { color: colors.buttonText }]}>
          {isSaving ? "Saving..." : "Take Profile Photo"}
        </Text>
      </Pressable>

      <View style={[styles.formCard, { borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.title }]}>Change Username</Text>
        <TextInput
          value={newUsername}
          onChangeText={setNewUsername}
          placeholder="New username"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background,
            },
          ]}
        />
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleChangeUsername}
          disabled={isSaving}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {isSaving ? "Saving..." : "Update Username"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.formCard, { borderColor: colors.border }]}>
        <Text style={[styles.formTitle, { color: colors.title }]}>Change Password</Text>
        <View
          style={[
            styles.passwordRow,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Current password"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            secureTextEntry={!isCurrentPasswordVisible}
            style={[styles.passwordInput, { color: colors.text }]}
          />
          <Pressable onPress={() => setIsCurrentPasswordVisible((prev) => !prev)}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isCurrentPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>
        <View
          style={[
            styles.passwordRow,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="New password"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            secureTextEntry={!isNewPasswordVisible}
            style={[styles.passwordInput, { color: colors.text }]}
          />
          <Pressable onPress={() => setIsNewPasswordVisible((prev) => !prev)}>
            <Text style={[styles.toggleText, { color: colors.primary }]}>
              {isNewPasswordVisible ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleChangePassword}
          disabled={isSaving}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>
            {isSaving ? "Saving..." : "Update Password"}
          </Text>
        </Pressable>
      </View>
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
    lineHeight: 20,
  },
  username: {
    marginTop: 8,
    fontSize: 13,
  },
  photoWrapper: {
    marginTop: 12,
    alignItems: "center",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 10,
    fontSize: 13,
    color: "#DC2626",
    textAlign: "center",
  },
  successText: {
    marginTop: 10,
    fontSize: 13,
    color: "#16A34A",
    textAlign: "center",
  },
  formCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
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
  button: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
