import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { colors } from "@/styles/commonStyles";
import { IconSymbol } from "@/components/IconSymbol";

import { signInWithEmail, signInWithApple, signInWithGoogle } from "@/utils/auth";
import { userHasFamily } from "@/utils/familyService";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [step, setStep] = useState<"auth" | "email">("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const goAfterLogin = async (userId: string) => {
    try {
      // Check family
      const hasFamily = await userHasFamily(userId);

      // Nav
      if (!hasFamily) {
        router.replace("/(auth)/add-family-members");
        return;
      }

      router.replace("/(tabs)/(home)");
    } catch (e: any) {
      console.error("❌ goAfterLogin error:", e?.message ?? e);
      Alert.alert(
        t("common.error"),
        "Er ging iets mis bij het controleren van je gezin. Probeer het opnieuw."
      );
    }
  };

  const handleApple = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(t("auth.login.appleNotAvailable"), t("auth.login.appleOnlyIOS"));
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithApple();

      if (!result?.success || !result?.user?.id) {
        console.error("❌ Apple sign-in failed:", result?.error ?? "Unknown error");
        Alert.alert(t("common.error"), result?.error || "Er ging iets mis bij het inloggen met Apple.");
        return;
      }

      await goAfterLogin(result.user.id);
    } catch (e: any) {
      console.error("❌ Apple exception:", e?.message ?? e);
      Alert.alert(t("common.error"), "Er ging iets mis bij het inloggen met Apple.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (!result?.success || !result?.user?.id) {
        console.error("❌ Google sign-in failed:", result?.error ?? "Unknown error");
        Alert.alert(t("common.error"), result?.error || "Er ging iets mis bij het inloggen met Google.");
        return;
      }

      await goAfterLogin(result.user.id);
    } catch (e: any) {
      console.error("❌ Google exception:", e?.message ?? e);
      Alert.alert(t("common.error"), "Er ging iets mis bij het inloggen met Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      Alert.alert(t("common.error"), t("auth.login.fillEmail"));
      return;
    }
    if (!cleanPass) {
      Alert.alert(t("common.error"), t("auth.login.fillPassword"));
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(cleanEmail, cleanPass);

      if (!result?.success) {
        // Verificatie flow
        if (result?.requiresVerification) {
          Alert.alert(
            "E-mail niet bevestigd",
            "Je e-mailadres is nog niet bevestigd. Controleer je inbox.\n\nKomt er niks binnen? Neem contact op met support@flowfam.nl."
          );
          return;
        }

        console.error("❌ Email sign-in failed:", result?.error ?? "Unknown error");
        Alert.alert(t("common.error"), result?.error || "Er ging iets mis bij het inloggen.");
        return;
      }

      if (!result?.user?.id) {
        console.error("❌ Email sign-in: missing user.id");
        Alert.alert(t("common.error"), "Er ging iets mis bij het inloggen. Probeer het opnieuw.");
        return;
      }

      await goAfterLogin(result.user.id);
    } catch (e: any) {
      console.error("❌ Email exception:", e?.message ?? e);
      Alert.alert(t("common.error"), "Er ging iets mis bij het inloggen. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI - EMAIL STEP
  // ---------------------------
  if (step === "email") {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => !loading && setStep("auth")}
          disabled={loading}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t("auth.login.withEmail")}</Text>
          <Text style={styles.subtitle}>{t("auth.login.fillDetails")}</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("common.email")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("auth.login.emailPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t("common.password")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("auth.login.passwordPlaceholder")}
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
              onPress={handleEmail}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.orangeButtonText}>{t("common.login")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ---------------------------
  // UI - AUTH STEP
  // ---------------------------
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => !loading && router.back()}
        disabled={loading}
      >
        <IconSymbol
          ios_icon_name="chevron.left"
          android_material_icon_name="arrow-back"
          size={24}
          color={colors.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>{t("auth.login.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.login.subtitle")}</Text>

        <View style={styles.authButtons}>
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
              onPress={handleApple}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="apple.logo"
                    android_material_icon_name="apple"
                    size={20}
                    color={colors.card}
                  />
                  <Text style={styles.orangeButtonText}>{t("auth.login.withApple")}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
            onPress={handleGoogle}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.card} />
            ) : (
              <>
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="language"
                  size={20}
                  color={colors.card}
                />
                <Text style={styles.orangeButtonText}>{t("auth.login.withGoogle")}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.orangeButton, loading && styles.buttonDisabled]}
            onPress={() => setStep("email")}
            disabled={loading}
            activeOpacity={0.85}
          >
            <IconSymbol
              ios_icon_name="envelope.fill"
              android_material_icon_name="email"
              size={20}
              color={colors.card}
            />
            <Text style={styles.orangeButtonText}>{t("auth.login.withEmail")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ---------------------------
// STYLES
// ---------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
    fontFamily: "Poppins_700Bold",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 40,
    fontFamily: "Nunito_400Regular",
  },
  authButtons: {
    gap: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,

    // RN shadow (iOS) + elevation (Android)
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  orangeButton: {
    backgroundColor: colors.vibrantOrange,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  orangeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.card,
    fontFamily: "Poppins_600SemiBold",
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Poppins_600SemiBold",
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontFamily: "Nunito_400Regular",
    borderWidth: 1,
    borderColor: colors.textSecondary + "20",
  },
});
