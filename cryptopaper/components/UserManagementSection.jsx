import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSessionState } from "../constants/session";
import { adminDeleteUser, adminSetUserPassword, listUsers } from "../database/repositories";

export default function UserManagementSection({ colors }) {
  const session = useSessionState();
  const actorUserId = session.user?.id;
  const isAdmin = session.isLoggedIn && session.user?.role === "admin";

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedPasswordUserId, setExpandedPasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Неуспешно зареждане на потребителите.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (!isAdmin || !actorUserId) {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.title }]}>Управление на потребителите</Text>
        <Text style={[styles.note, { color: colors.text }]}>
          Само администраторите могат да достъпят тази секция.
        </Text>
      </View>
    );
  }

  async function handleDeleteUser(targetUser) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setBusyUserId(targetUser.id);
      await adminDeleteUser(actorUserId, targetUser.id);
      setSuccessMessage(`Потребителя @${targetUser.username} беше изтрит.`);
      await loadUsers();
    } catch (error) {
      setErrorMessage(error.message || "Неуспешно изтриване на потребителя.");
    } finally {
      setBusyUserId(null);
    }
  }

  async function handleSetPassword(targetUser) {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      setBusyUserId(targetUser.id);
      await adminSetUserPassword(actorUserId, targetUser.id, newPassword);
      setSuccessMessage(`Паролата за @${targetUser.username} беше обновена.`);
      setNewPassword("");
      setIsPasswordVisible(false);
      setExpandedPasswordUserId(null);
    } catch (error) {
      setErrorMessage(error.message || "Неуспешно обновяване на паролата.");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.title }]}>Всички акаунти</Text>
      <Text style={[styles.note, { color: colors.text }]}>
        Нормални потребители: промяна на парола + изтриване. Администраторски потребители: промяна на парола само.
      </Text>

      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

      <View style={[styles.tableHeader, { borderColor: colors.border }]}>
        <Text style={[styles.headerCellWide, { color: colors.title }]}>Потребител</Text>
        <Text style={[styles.headerCell, { color: colors.title }]}>Роля</Text>
        <Text style={[styles.headerCellActions, { color: colors.title }]}>Действия</Text>
      </View>

      {isLoading ? (
        <Text style={[styles.loadingText, { color: colors.text }]}>Зареждане на потребителите...</Text>
      ) : (
        users.map((user) => {
          const isTargetAdmin = user.role === "admin";
          const isBusy = busyUserId === user.id;
          const isExpanded = expandedPasswordUserId === user.id;
          return (
            <View key={user.id} style={[styles.rowWrapper, { borderColor: colors.border }]}>
              <View style={styles.tableRow}>
                <View style={styles.userCell}>
                  <Text style={[styles.rowPrimary, { color: colors.text }]}>@{user.username}</Text>
                  <Text style={[styles.rowSecondary, { color: colors.text }]}>{user.email}</Text>
                </View>
                <Text style={[styles.roleCell, { color: colors.text }]}>{user.role}</Text>
                <View style={styles.actionsCell}>
                  <Pressable
                    style={[styles.smallButton, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      setExpandedPasswordUserId(isExpanded ? null : user.id);
                      setNewPassword("");
                      setIsPasswordVisible(false);
                    }}
                    disabled={isBusy}
                  >
                    <Text style={[styles.smallButtonText, { color: colors.buttonText }]}>
                      {isExpanded ? "Отказ" : "Задаване на парола"}
                    </Text>
                  </Pressable>
                  {!isTargetAdmin && (
                    <Pressable
                      style={[styles.smallButton, { backgroundColor: "#DC2626" }]}
                      onPress={() => handleDeleteUser(user)}
                      disabled={isBusy}
                    >
                      <Text style={[styles.smallButtonText, { color: "#FFFFFF" }]}>
                        {isBusy ? "Работи..." : "Изтриване"}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {isExpanded && (
                <View style={styles.passwordPanel}>
                  <View
                    style={[
                      styles.passwordRow,
                      { borderColor: colors.border, backgroundColor: colors.background },
                    ]}
                  >
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder={`Нова парола за @${user.username}`}
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!isPasswordVisible}
                      autoCapitalize="none"
                      style={[styles.passwordInput, { color: colors.text }]}
                    />
                    <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)}>
                      <Text style={[styles.toggleText, { color: colors.primary }]}>
                        {isPasswordVisible ? "Скрий" : "Покажи"}
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable
                    style={[styles.saveButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleSetPassword(user)}
                    disabled={isBusy}
                  >
                    <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>
                      {isBusy ? "Работи..." : "Запазване на паролата"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })
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
  note: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
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
  tableHeader: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  headerCellWide: {
    flex: 1.2,
    fontSize: 12,
    fontWeight: "700",
  },
  headerCell: {
    flex: 0.7,
    fontSize: 12,
    fontWeight: "700",
  },
  headerCellActions: {
    flex: 1.4,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  rowWrapper: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCell: {
    flex: 1.2,
    paddingRight: 8,
  },
  rowPrimary: {
    fontSize: 13,
    fontWeight: "700",
  },
  rowSecondary: {
    marginTop: 2,
    fontSize: 11,
    opacity: 0.85,
  },
  roleCell: {
    flex: 0.7,
    fontSize: 12,
    textTransform: "capitalize",
  },
  actionsCell: {
    flex: 1.4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 6,
  },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  smallButtonText: {
    fontSize: 11,
    fontWeight: "700",
  },
  passwordPanel: {
    marginTop: 10,
  },
  passwordRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 8,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
