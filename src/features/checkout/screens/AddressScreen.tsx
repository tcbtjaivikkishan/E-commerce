import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOrder } from '../hooks/useOrder';
import type { OrderAddress } from '../types/order.types';

export default function AddressScreen() {
  const { tempAddress, updateAddress, isReadyToPlace } = useOrder();

  const [form, setForm ] = useState<Partial<OrderAddress>>({
    name: tempAddress?.name || '',
    phone: tempAddress?.phone || '',
    street: tempAddress?.street || '',
    city: tempAddress?.city || '',
    state: tempAddress?.state || '',
    pincode: tempAddress?.pincode || '',
  });

  const isFormComplete = Object.values(form).every(Boolean) && 
    form.phone?.length === 10 && 
    /^\d{6}$/.test(form.pincode || '');

  const handleNext = () => {
    if (!isFormComplete) {
      Alert.alert('Please fill all fields correctly');
      return;
    }
    updateAddress(form);
    router.push('/checkout/payment');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F5F5F5]">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Header */}
          <View className="bg-[#0F7B3C] px-4 pt-2 pb-4">
            <TouchableOpacity 
              className="flex-row items-center gap-2 mb-2" 
              onPress={() => router.back()}
            >
              <Text className="text-white text-lg font-bold">←</Text>
              <Text className="text-[22px] font-extrabold text-white">Delivery Address</Text>
            </TouchableOpacity>
            <Text className="text-white/90 text-[13px] leading-[17px]">
              No account needed — just fill your details
            </Text>
          </View>

          {/* Form Card */}
          <View className="mx-4 mt-4 bg-white rounded-2xl p-6" style={{ elevation: 2 }}>
            <Text className="text-[13px] font-bold text-[#888] uppercase tracking-widest mb-6">
              Delivery Details
            </Text>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-[#555] mb-2">Full Name *</Text>
              <TextInput
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base"
                placeholder="John Doe"
                value={form.name}
                onChangeText={(text) => setForm({...form, name: text})}
                autoCapitalize="words"
              />
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-[#555] mb-2">Phone Number *</Text>
              <TextInput
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base"
                placeholder="9876543210"
                value={form.phone}
                onChangeText={(text) => setForm({...form, phone: text.replace(/\D/g, '')})}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Street */}
            <View className="mb-4">
              <Text className="text-sm font-bold text-[#555] mb-2">Street Address *</Text>
              <TextInput
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base h-20"
                placeholder="House no, street name, landmark"
                value={form.street}
                onChangeText={(text) => setForm({...form, street: text})}
                multiline
              />
            </View>

            {/* City/State/Pin */}
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#555] mb-2">City *</Text>
                <TextInput
                  className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base"
                  placeholder="Bhopal"
                  value={form.city}
                  onChangeText={(text) => setForm({...form, city: text})}
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-[#555] mb-2">State *</Text>
                <TextInput
                  className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base"
                  placeholder="Madhya Pradesh"
                  value={form.state}
                  onChangeText={(text) => setForm({...form, state: text})}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-bold text-[#555] mb-2">Pincode *</Text>
              <TextInput
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl px-4 py-3 text-base"
                placeholder="462001"
                value={form.pincode}
                onChangeText={(text) => setForm({...form, pincode: text.replace(/\D/g, '')})}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>
        </ScrollView>

        {/* Next Button */}
        <View className="bg-white border-t border-[#EFEFEF] px-4 py-5" style={{ elevation: 8 }}>
          <TouchableOpacity
            className={`rounded-2xl py-4 px-6 flex-row items-center justify-center gap-2 ${
              isFormComplete 
                ? 'bg-[#0F7B3C]' 
                : 'bg-[#E8F5EE]'
            }`}
            onPress={handleNext}
            disabled={!isFormComplete}
          >
            <Text className={`text-lg font-extrabold ${
              isFormComplete ? 'text-white' : 'text-[#86efac]'
            }`}>
              Continue to Payment
            </Text>
            <Text className={`text-lg font-bold ${
              isFormComplete ? 'text-white' : 'text-[#86efac]'
            }`}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

