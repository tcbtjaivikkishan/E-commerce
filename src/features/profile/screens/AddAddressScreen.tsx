// src/features/profile/screens/AddAddressScreen.tsx
// ─── Add Address Details — matches Figma screen_30 ───────────────────────────
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { addAddress, setAddresses } from "../../auth/store/userSlice";
import { addUserAddress } from "../services/user.api";

const GREEN = "#196F1B";

// ─── Data ─────────────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Jammu & Kashmir",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kadapa", "Anantapur", "Eluru"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Along", "Bomdila"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Dispur"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Nadiad"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Baddi", "Nahan", "Palampur", "Bilaspur"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Palakkad", "Alappuzha", "Malappuram", "Kannur", "Kottayam"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Thane", "Navi Mumbai"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara"],
  "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Firozpur", "Pathankot"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Jorethang"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur", "Vellore", "Erode", "Thanjavur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Secunderabad"],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Ambassa"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Prayagraj", "Ghaziabad", "Noida", "Bareilly", "Aligarh"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital", "Mussoorie"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Maheshtala", "Rajpur Sonarpur", "South Dumdum", "Bally", "Bardhaman"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Sopore", "Baramulla", "Udhampur", "Kathua", "Rajouri", "Punch"],
};

// ─── Generic Searchable Picker ────────────────────────────────────────────────
interface SearchablePickerProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

function SearchablePicker({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<TextInput>(null);

  // Sync query when value changes externally (e.g. state clears city)
  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = options.filter((s) =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const select = (item: string) => {
    onChange(item);
    setQuery(item);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleChangeText = (text: string) => {
    setQuery(text);
    onChange(text);
    if (!open) setOpen(true);
  };

  const toggleOpen = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    if (next) {
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
  };

  return (
    <View style={picker.wrapper}>
      {/* Input + chevron row */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleOpen}
        style={[
          picker.inputRow,
          open && picker.inputRowOpen,
          disabled && picker.inputRowDisabled,
        ]}
      >
        <TextInput
          ref={inputRef}
          style={picker.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={handleChangeText}
          autoCorrect={false}
          autoCapitalize="words"
          editable={!disabled}
          // prevent keyboard from auto-opening on mount
          showSoftInputOnFocus={true}
        />
        <Text style={picker.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {/* Inline list — no absolute positioning, no clipping */}
      {open && (
        <View style={picker.listContainer}>
          {filtered.length === 0 ? (
            <View style={picker.emptyRow}>
              <Text style={picker.emptyText}>No results found</Text>
            </View>
          ) : (
            filtered.map((item) => (
              <TouchableOpacity
                key={item}
                style={[picker.item, item === value && picker.itemSelected]}
                onPress={() => select(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    picker.itemText,
                    item === value && picker.itemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {item === value && (
                  <Text style={picker.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
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

  // When state changes, clear city
  const handleStateChange = (val: string) => {
    setState(val);
    setCity("");
  };

  // Cities for the selected state (or all unique cities if no match)
  const cityOptions: string[] = state && CITIES_BY_STATE[state]
    ? CITIES_BY_STATE[state]
    : Object.values(CITIES_BY_STATE).flat().sort();

  const handleSave = async () => {
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
        // Backend returns the full user object with _id on each address
        const updatedUser = await addUserAddress(userId, addressData);
        console.log('[ADD_ADDR] API response:', JSON.stringify(updatedUser));
        console.log('[ADD_ADDR] Has addresses?', !!updatedUser?.addresses, 'count:', updatedUser?.addresses?.length);
        
        // Replace all addresses in Redux with the backend's version (which has _ids)
        if (updatedUser?.addresses && updatedUser.addresses.length > 0) {
          // Verify _ids are present
          const hasIds = updatedUser.addresses.every((a: any) => !!a._id);
          console.log('[ADD_ADDR] All addresses have _id?', hasIds);
          dispatch(setAddresses(updatedUser.addresses));
        } else {
          // Fallback: fetch user profile to get addresses with _ids
          console.warn('[ADD_ADDR] API response missing addresses, fetching user profile...');
          try {
            const { fetchUserProfile } = await import('../services/user.api');
            const userProfile = await fetchUserProfile(userId);
            if (userProfile?.addresses && userProfile.addresses.length > 0) {
              console.log('[ADD_ADDR] Fetched profile addresses:', userProfile.addresses.length);
              dispatch(setAddresses(userProfile.addresses));
            } else {
              // Last resort: add locally without _id
              console.error('[ADD_ADDR] ⚠️ Could not get _id — adding locally');
              dispatch(addAddress(addressData));
            }
          } catch (fetchErr: any) {
            console.error('[ADD_ADDR] Profile fetch failed:', fetchErr?.message);
            dispatch(addAddress(addressData));
          }
        }
      } else {
        // No userId — just store locally (guest user)
        dispatch(addAddress(addressData));
      }
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

      {/* White status-bar area; content below uses gray bg */}
      <View style={styles.content}>
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

              {/* State Picker — full width */}
              <SearchablePicker
                value={state}
                onChange={handleStateChange}
                options={INDIAN_STATES}
                placeholder="State*"
              />

              {/* City Picker — full width */}
              <SearchablePicker
                value={city}
                onChange={setCity}
                options={cityOptions}
                placeholder="City*"
              />

              <TextInput
                style={styles.input}
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
                placeholder="Receiver's name*"
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
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, backgroundColor: "#F5F5F5" },

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

// ─── Picker Styles ────────────────────────────────────────────────────────────
const picker = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputRowOpen: {
    borderColor: GREEN,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputRowDisabled: {
    backgroundColor: "#F0F0F0",
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingVertical: 12,
  },
  chevron: {
    fontSize: 11,
    color: "#777",
    paddingLeft: 6,
  },
  // Inline list — renders in normal document flow, no clipping
  listContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: GREEN,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: "#fff",
    maxHeight: 220,
    overflow: "hidden",
    // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemSelected: {
    backgroundColor: "#EBF5EB",
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
  itemTextSelected: {
    color: GREEN,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 14,
    color: GREEN,
    fontWeight: "700",
  },
  emptyRow: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#999",
  },
});
