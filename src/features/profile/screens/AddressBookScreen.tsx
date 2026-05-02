// src/features/profile/screens/AddressBookScreen.tsx
// ─── Address Book — list, edit & delete saved addresses ──────────────────────
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import type { UserAddress } from "../../auth/types/auth.types";
import { removeAddress, setAddresses, updateAddress } from "../../auth/store/userSlice";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks/useRedux";
import { deleteUserAddress, updateUserAddress } from "../services/user.api";

const GREEN = "#196F1B";
const GREEN_LIGHT = "#EBF5EB";
const RED = "#D9534F";
const RED_LIGHT = "#FDECEA";

// ─── Indian State / City data ─────────────────────────────────────────────────
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Jammu & Kashmir",
];

const CITIES_BY_STATE: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Tirupati","Rajahmundry","Kadapa","Anantapur","Eluru"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tawang","Ziro","Along","Bomdila"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Dispur"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Bihar Sharif","Arrah"],
  "Chhattisgarh": ["Raipur","Bhilai","Bilaspur","Korba","Durg","Rajnandgaon","Jagdalpur"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Junagadh"],
  "Haryana": ["Faridabad","Gurgaon","Panipat","Ambala","Rohtak","Hisar","Karnal","Sonipat"],
  "Himachal Pradesh": ["Shimla","Dharamshala","Solan","Mandi","Kullu","Baddi"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Hazaribagh"],
  "Karnataka": ["Bengaluru","Mysuru","Hubballi","Mangaluru","Belagavi","Davanagere"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad"],
  "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Thane"],
  "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur"],
  "Meghalaya": ["Shillong","Tura","Jowai"],
  "Mizoram": ["Aizawl","Lunglei","Saiha","Champhai"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali"],
  "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing","Mangan"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"],
  "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam"],
  "Tripura": ["Agartala","Dharmanagar","Udaipur"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Varanasi","Agra","Meerut","Prayagraj","Noida"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rishikesh"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri"],
  "Jammu & Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Udhampur"],
};

// ─── Searchable Picker ────────────────────────────────────────────────────────
interface SearchablePickerProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}

function SearchablePicker({ value, onChange, options, placeholder, disabled = false }: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<TextInput>(null);

  // Sync query when value changes externally — don't force close the dropdown
  React.useEffect(() => {
    if (!open) setQuery(value);
  }, [value]);

  const filtered = options.filter((s) => s.toLowerCase().includes(query.toLowerCase()));

  const select = (item: string) => {
    onChange(item);
    setQuery(item);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <View style={pk.wrapper}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (disabled) return;
          const next = !open;
          setOpen(next);
          if (next) inputRef.current?.focus();
          else inputRef.current?.blur();
        }}
        style={[pk.inputRow, open && pk.inputRowOpen, disabled && pk.inputRowDisabled]}
      >
        <TextInput
          ref={inputRef}
          style={pk.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => { setQuery(text); onChange(text); if (!open) setOpen(true); }}
          autoCorrect={false}
          autoCapitalize="words"
          editable={!disabled}
        />
        <Text style={pk.chevron}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      {open && (
        <View style={pk.listContainer}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: 180 }}
          >
            {filtered.length === 0 ? (
              <View style={pk.emptyRow}><Text style={pk.emptyText}>No results found</Text></View>
            ) : (
              filtered.map((item) => (
                <TouchableOpacity key={item} style={[pk.item, item === value && pk.itemSelected]} onPress={() => select(item)} activeOpacity={0.7}>
                  <Text style={[pk.itemText, item === value && pk.itemTextSelected]}>{item}</Text>
                  {item === value && <Text style={pk.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Address Card ─────────────────────────────────────────────────────────────
interface AddressCardProps {
  address: UserAddress;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

function AddressCard({ address, index, onEdit, onDelete }: AddressCardProps) {
  const labelColors: Record<string, { bg: string; text: string }> = {
    Home: { bg: "#E3F2FD", text: "#1565C0" },
    Work: { bg: "#FFF3E0", text: "#E65100" },
    Other: { bg: "#F3E5F5", text: "#6A1B9A" },
  };
  const labelKey = address.label in labelColors ? address.label : "Other";
  const { bg, text } = labelColors[labelKey];

  return (
    <View style={card.container}>
      {/* Label badge */}
      <View style={card.topRow}>
        <View style={[card.badge, { backgroundColor: bg }]}>
          <Text style={[card.badgeText, { color: text }]}>{address.label || "Address"}</Text>
        </View>
      </View>

      {/* Address lines */}
      <Text style={card.name}>{address.receiver_name}</Text>
      <Text style={card.line}>{address.line1}</Text>
      {!!address.line2 && <Text style={card.line}>{address.line2}</Text>}
      <Text style={card.line}>{address.city}, {address.state} — {address.pincode}</Text>
      {!!address.receiver_phone && (
        <Text style={card.phone}>📞 {address.receiver_phone}</Text>
      )}

      {/* Actions */}
      <View style={card.actions}>
        <TouchableOpacity style={card.editBtn} onPress={() => onEdit(index)} activeOpacity={0.8}>
          <Text style={card.editIcon}>✏️</Text>
          <Text style={card.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={card.deleteBtn} onPress={() => onDelete(index)} activeOpacity={0.8}>
          <Text style={card.deleteIcon}>🗑️</Text>
          <Text style={card.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Edit Address Modal ───────────────────────────────────────────────────────
interface EditModalProps {
  visible: boolean;
  address: UserAddress | null;
  onClose: () => void;
  onSave: (updated: UserAddress) => void;
}

function EditAddressModal({ visible, address, onClose, onSave }: EditModalProps) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [label, setLabel] = useState("");

  // Populate fields when modal opens
  React.useEffect(() => {
    if (address) {
      setLine1(address.line1 || "");
      setLine2(address.line2 || "");
      setState(address.state || "");
      setCity(address.city || "");
      setPincode(address.pincode || "");
      setReceiverName(address.receiver_name || "");
      setReceiverPhone(address.receiver_phone || "");
      setLabel(address.label || "");
    }
  }, [address, visible]);

  const handleStateChange = (val: string) => { setState(val); setCity(""); };
  const cityOptions = state && CITIES_BY_STATE[state] ? CITIES_BY_STATE[state] : Object.values(CITIES_BY_STATE).flat().sort();

  const handleSave = () => {
    if (!line1.trim()) { Alert.alert("Required", "Address line 1 is required"); return; }
    if (!state.trim() || !city.trim()) { Alert.alert("Required", "State and City are required"); return; }
    if (!pincode.trim() || pincode.trim().length < 6) { Alert.alert("Required", "Please enter a valid 6-digit pin code"); return; }
    if (!receiverName.trim()) { Alert.alert("Required", "Receiver's name is required"); return; }
    if (!receiverPhone.trim() || receiverPhone.trim().length < 10) { Alert.alert("Required", "Please enter a valid 10-digit phone number"); return; }

    onSave({
      label: label.trim() || "Home",
      line1: line1.trim(),
      line2: line2.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      receiver_name: receiverName.trim(),
      receiver_phone: receiverPhone.trim(),
      _id: address?._id,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* Header */}
        <View style={modal.header}>
          <Text style={modal.title}>Edit Address</Text>
          <TouchableOpacity onPress={onClose} style={modal.closeBtn}>
            <Text style={modal.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={modal.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {/* Address section */}
          <Text style={modal.sectionLabel}>📍 Address Details</Text>
          <TextInput style={modal.input} placeholder="Address line 1*" placeholderTextColor="#999" value={line1} onChangeText={setLine1} />
          <TextInput style={modal.input} placeholder="Address line 2 (optional)" placeholderTextColor="#999" value={line2} onChangeText={setLine2} />
          <View style={{ zIndex: 2 }}>
            <SearchablePicker value={state} onChange={handleStateChange} options={INDIAN_STATES} placeholder="State*" />
          </View>
          <View style={{ zIndex: 1 }}>
            <SearchablePicker value={city} onChange={setCity} options={cityOptions} placeholder="City*" />
          </View>
          <TextInput style={modal.input} placeholder="Pin code*" placeholderTextColor="#999" value={pincode} onChangeText={setPincode} keyboardType="number-pad" maxLength={6} />

          {/* Contact section */}
          <Text style={modal.sectionLabel}>📞 Contact Details</Text>
          <TextInput style={modal.input} placeholder="Receiver's name*" placeholderTextColor="#999" value={receiverName} onChangeText={setReceiverName} />
          <TextInput style={modal.input} placeholder="Receiver's phone*" placeholderTextColor="#999" value={receiverPhone} onChangeText={setReceiverPhone} keyboardType="phone-pad" maxLength={10} />
          <TextInput style={modal.input} placeholder="Label (e.g. Home, Work)" placeholderTextColor="#999" value={label} onChangeText={setLabel} />
        </ScrollView>

        {/* Save button */}
        <View style={modal.footer}>
          <TouchableOpacity style={modal.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={modal.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddressBookScreen() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.userId);
  const addresses = useAppSelector((s) => s.user.addresses);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editModal, setEditModal] = useState(false);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditModal(true);
  };

  const handleDelete = (index: number) => {
    const addr = addresses[index];
    Alert.alert(
      "Delete Address",
      "Are you sure you want to remove this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (userId && addr?._id) {
                const updatedAddresses = await deleteUserAddress(userId, addr._id);
                // Backend returns the updated addresses array directly
                if (Array.isArray(updatedAddresses)) {
                  dispatch(setAddresses(updatedAddresses));
                } else {
                  dispatch(removeAddress(addr._id));
                }
              } else {
                // No backend ID — remove locally only
                if (addr?._id) dispatch(removeAddress(addr._id));
              }
            } catch (err: any) {
              Alert.alert("Error", "Failed to delete address. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleSaveEdit = async (updated: UserAddress) => {
    if (editIndex === null) return;
    const addr = addresses[editIndex];
    try {
      if (userId && addr?._id) await updateUserAddress(userId, addr._id, updated);
    } catch (_) {
      // silent
    } finally {
      dispatch(updateAddress({ index: editIndex, address: updated }));
      setEditModal(false);
      setEditIndex(null);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Address Book</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* List */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyEmoji}>📭</Text>
            <Text style={s.emptyTitle}>No saved addresses</Text>
            <Text style={s.emptySubtitle}>Add a delivery address to get started</Text>
          </View>
        ) : (
          addresses.map((addr, idx) => (
            <AddressCard key={addr._id ?? idx} address={addr} index={idx} onEdit={handleEdit} onDelete={handleDelete} />
          ))
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <View style={s.fab}>
        <TouchableOpacity style={s.fabBtn} onPress={() => router.push("/add-address" as any)} activeOpacity={0.85}>
          <Text style={s.fabIcon}>＋</Text>
          <Text style={s.fabText}>Add New Address</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <EditAddressModal
        visible={editModal}
        address={editIndex !== null ? addresses[editIndex] ?? null : null}
        onClose={() => { setEditModal(false); setEditIndex(null); }}
        onSave={handleSaveEdit}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
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
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  backIcon: { fontSize: 22, color: "#1A1A1A" },
  headerTitle: {
    flex: 1, textAlign: "center",
    fontSize: 16, fontWeight: "700", color: "#1A1A1A",
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  emptyState: {
    alignItems: "center", justifyContent: "center",
    marginTop: 80,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#1A1A1A", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#888", textAlign: "center" },

  fab: {
    position: "absolute", bottom: 24, left: 16, right: 16,
  },
  fabBtn: {
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: { fontSize: 18, color: "#fff", fontWeight: "700" },
  fabText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});

// ─── Card Styles ──────────────────────────────────────────────────────────────
const card = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  name: { fontSize: 15, fontWeight: "700", color: "#1A1A1A", marginBottom: 4 },
  line: { fontSize: 13, color: "#555", lineHeight: 20 },
  phone: { fontSize: 13, color: "#555", marginTop: 6 },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  editBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 9, borderRadius: 10,
    backgroundColor: GREEN_LIGHT, borderWidth: 1, borderColor: "#C8E6C9",
  },
  editIcon: { fontSize: 14 },
  editText: { fontSize: 13, fontWeight: "600", color: GREEN },

  deleteBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 9, borderRadius: 10,
    backgroundColor: RED_LIGHT, borderWidth: 1, borderColor: "#FFCDD2",
  },
  deleteIcon: { fontSize: 14 },
  deleteText: { fontSize: 13, fontWeight: "600", color: RED },
});

// ─── Modal Styles ─────────────────────────────────────────────────────────────
const modal = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheetWrapper: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: 8,
  },
  handle: {
    alignSelf: "center", width: 40, height: 4,
    borderRadius: 2, backgroundColor: "#DDD", marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  title: { flex: 1, fontSize: 17, fontWeight: "700", color: "#1A1A1A" },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "#F5F5F5",
    alignItems: "center", justifyContent: "center",
  },
  closeIcon: { fontSize: 14, color: "#555" },

  scrollContent: { padding: 20, paddingBottom: 16 },

  sectionLabel: {
    fontSize: 14, fontWeight: "700", color: "#1A1A1A",
    marginBottom: 12, marginTop: 4,
  },
  input: {
    borderWidth: 1, borderColor: "#E0E0E0",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#333", backgroundColor: "#FAFAFA",
    marginBottom: 12,
  },

  footer: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: "#F0F0F0",
  },
  saveBtn: {
    backgroundColor: GREEN, borderRadius: 12,
    paddingVertical: 15, alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

// ─── Picker Styles ────────────────────────────────────────────────────────────
const pk = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1, borderColor: "#E0E0E0",
    borderRadius: 10, backgroundColor: "#FAFAFA",
    paddingHorizontal: 14, paddingVertical: 2,
  },
  inputRowOpen: { borderColor: GREEN, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  inputRowDisabled: { backgroundColor: "#F0F0F0", opacity: 0.7 },
  input: { flex: 1, fontSize: 14, color: "#333", paddingVertical: 12 },
  chevron: { fontSize: 11, color: "#777", paddingLeft: 6 },
  listContainer: {
    borderWidth: 1, borderTopWidth: 0, borderColor: GREEN,
    borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
  },
  item: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  itemSelected: { backgroundColor: "#EBF5EB" },
  itemText: { fontSize: 14, color: "#333" },
  itemTextSelected: { color: GREEN, fontWeight: "600" },
  checkmark: { fontSize: 14, color: GREEN, fontWeight: "700" },
  emptyRow: { paddingHorizontal: 14, paddingVertical: 14, alignItems: "center" },
  emptyText: { fontSize: 13, color: "#999" },
});
