// src/features/profile/screens/AddAddressScreen.tsx
// ─── Add Address Details — matches Figma screen_30 ───────────────────────────
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { addAddress } from "../../auth/store/userSlice";
import { addUserAddress } from "../services/user.api";

const GREEN = "#196F1B";

export default function AddAddressScreen() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.user.userId);

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate required fields
    if (!line1.trim()) {
      Alert.alert("Required", "Address line 1 is required");
      return;
    }
    if (!state.trim() || !city.trim()) {
      Alert.alert("Required", "State and City are required");
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      Alert.alert("Required", "Please enter a valid 6-digit pin code");
      return;
    }
    if (!receiverName.trim()) {
      Alert.alert("Required", "Receiver's name is required");
      return;
    }
    if (!receiverPhone.trim() || receiverPhone.trim().length < 10) {
      Alert.alert("Required", "Please enter a valid 10-digit phone number");
      return;
    }

    const addressData = {
      label: label.trim() || "Home",
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      receiver_name: receiverName.trim(),
      receiver_phone: receiverPhone.trim(),
    };

    setSaving(true);
    try {
      if (userId) {
        await addUserAddress(userId, addressData);
      }
      dispatch(addAddress(addressData));
      Alert.alert("Success", "Address saved successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add address details</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Address Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📍</Text>
              <Text style={styles.sectionTitle}>Address details</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Address line 1*"
              placeholderTextColor="#999"
              value={line1}
              onChangeText={setLine1}
            />
            <TextInput
              style={styles.input}
              placeholder="Address line 2 (optional)"
              placeholderTextColor="#999"
              value={line2}
              onChangeText={setLine2}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="State"
                placeholderTextColor="#999"
                value={state}
                onChangeText={setState}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="City"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <TextInput
              style={[styles.input, { width: "48%" }]}
              placeholder="Pin code"
              placeholderTextColor="#999"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          {/* Contact Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>📞</Text>
              <Text style={styles.sectionTitle}>Contact details</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Receiver's address*"
              placeholderTextColor="#999"
              value={receiverName}
              onChangeText={setReceiverName}
            />
            <TextInput
              style={styles.input}
              placeholder="Receiver's Phone number*"
              placeholderTextColor="#999"
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
            <TextInput
              style={styles.input}
              placeholder="Save Address (optional)"
              placeholderTextColor="#999"
              value={label}
              onChangeText={setLabel}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveBtnText}>
              {saving ? "Saving..." : "Save Address"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F5F5" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: { fontSize: 22, color: "#1A1A1A" },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },

  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ECECEC",
  },
  saveBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
