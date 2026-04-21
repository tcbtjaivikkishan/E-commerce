import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

/* ─── SVG Icons ─────────────────────────── */
const LeafLogo = () => (
  <Svg width="34" height="34" viewBox="0 0 36 36" fill="none">
    <Path d="M18 4C18 4 6 10 6 20C6 26.627 11.373 32 18 32C24.627 32 30 26.627 30 20C30 10 18 4 18 4Z" fill="#16a34a"/>
    <Path d="M18 4C18 4 6 10 6 20C6 26.627 11.373 32 18 32" fill="#22c55e" opacity="0.45"/>
    <Path d="M18 32V17M18 17C18 17 13 22 10 26" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
  </Svg>
);

const UserIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="7" r="4" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MailIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M22 6L12 13L2 6" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const PhoneIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.9a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.9.36 1.86.59 2.81.7A2 2 0 0122 16.92z" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const LockIcon = ({ focused }: { focused: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path d="M19 11H5C3.9 11 3 11.9 3 13V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V13C21 11.9 20.1 11 19 11Z" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M7 11V7C7 5.67 7.53 4.4 8.46 3.46C9.4 2.53 10.67 2 12 2C13.33 2 14.6 2.53 15.54 3.46C16.47 4.4 17 5.67 17 7V11" stroke={focused ? '#16a34a' : '#9ca3af'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="16" r="1.5" fill={focused ? '#16a34a' : '#9ca3af'}/>
  </Svg>
);

const EyeIcon = ({ open }: { open: boolean }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    {open ? (
      <>
        <Path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <Circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="1.8"/>
      </>
    ) : (
      <Path d="M17.94 17.94A10 10 0 0112 20C5 20 1 12 1 12a18.5 18.5 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    )}
  </Svg>
);

const CheckIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </Svg>
);

const AppleIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="#111827">
    <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </Svg>
);

/* ─── Loading Dots ──────────────────────── */
const LoadingDots = () => {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 150),
        Animated.timing(d, { toValue: -7, duration: 280, useNativeDriver: true }),
        Animated.timing(d, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.delay(450 - i * 150),
      ]))
    );
    Animated.parallel(anims).start();
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', height: 20 }}>
      {dots.map((d, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#fff', transform: [{ translateY: d }] }}/>
      ))}
    </View>
  );
};

/* ─── Floating dot animation ────────────── */
const Dot = ({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) => {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 2800, delay, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 2800, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size / 2, backgroundColor: '#bbf7d0',
      opacity: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.1, 0.5, 0.1] }),
      transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }],
    }}/>
  );
};

/* ════════════════════════════════════════════
   SIGNUP SCREEN
════════════════════════════════════════════ */
export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const cardY = useRef(new Animated.Value(50)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(cardY, { toValue: 0, tension: 55, friction: 9, delay: 100, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const toggleAgreed = () => {
    Animated.sequence([
      Animated.timing(checkScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
    ]).start();
    setAgreed(p => !p);
  };

  const handleSignup = () => {
    if (!agreed) return;
    // Backend uses OTP-based auth — redirect to login which handles both new and existing users
    router.replace('/auth/login');
  };

  // Password strength
  const strength = password.length === 0 ? 0 : password.length < 5 ? 1 : password.length < 9 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#16a34a'][strength];

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* green wave */}
      <View style={S.wave}>
        <Dot x={20} y={30} size={10} delay={0}/>
        <Dot x={300} y={60} size={7} delay={700}/>
        <Dot x={150} y={110} size={5} delay={400}/>
      </View>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={S.logoSection}>
          <View style={S.logoBox}>
            <LeafLogo/>
          </View>
          <Text style={S.brand}>Jaivik Mart</Text>
          <Text style={S.sub}>Join thousands of healthy shoppers</Text>
        </View>

        {/* Card */}
        <Animated.View style={[S.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>
          <View style={S.cardBar}/>
          <Text style={S.cardHead}>Create Account</Text>
          <Text style={S.cardCaption}>Fill in your details to get started.</Text>

          {/* Name */}
          <View style={S.fg}>
            <Text style={S.lbl}>Full Name</Text>
            <View style={[S.inp, focused === 'name' && S.inpFocus]}>
              <UserIcon focused={focused === 'name'}/>
              <TextInput style={S.ti} placeholder="Priya Sharma" placeholderTextColor="#d1d5db" value={name} onChangeText={setName} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} autoCapitalize="words"/>
            </View>
          </View>

          {/* Email */}
          <View style={S.fg}>
            <Text style={S.lbl}>Email Address</Text>
            <View style={[S.inp, focused === 'email' && S.inpFocus]}>
              <MailIcon focused={focused === 'email'}/>
              <TextInput style={S.ti} placeholder="you@example.com" placeholderTextColor="#d1d5db" value={email} onChangeText={setEmail} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} keyboardType="email-address" autoCapitalize="none"/>
            </View>
          </View>

          {/* Phone */}
          <View style={S.fg}>
            <Text style={S.lbl}>Phone Number</Text>
            <View style={[S.inp, focused === 'phone' && S.inpFocus]}>
              <PhoneIcon focused={focused === 'phone'}/>
              <TextInput style={S.ti} placeholder="+91 98765 43210" placeholderTextColor="#d1d5db" value={phone} onChangeText={setPhone} onFocus={() => setFocused('phone')} onBlur={() => setFocused(null)} keyboardType="phone-pad"/>
            </View>
          </View>

          {/* Password */}
          <View style={S.fg}>
            <Text style={S.lbl}>Password</Text>
            <View style={[S.inp, focused === 'password' && S.inpFocus]}>
              <LockIcon focused={focused === 'password'}/>
              <TextInput style={S.ti} placeholder="Minimum 8 characters" placeholderTextColor="#d1d5db" value={password} onChangeText={setPassword} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} secureTextEntry={!showPassword}/>
              <TouchableOpacity onPress={() => setShowPassword(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <EyeIcon open={showPassword}/>
              </TouchableOpacity>
            </View>
            {/* Strength bar */}
            {password.length > 0 && (
              <View style={S.strRow}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={[S.strBar, { backgroundColor: strength >= i ? strengthColor : '#e5e7eb' }]}/>
                ))}
                <Text style={[S.strTxt, { color: strengthColor }]}>{strengthLabel}</Text>
              </View>
            )}
          </View>

          {/* Terms */}
          <TouchableOpacity style={S.terms} onPress={toggleAgreed} activeOpacity={0.8}>
            <Animated.View style={[S.chk, agreed && S.chkOn, { transform: [{ scale: checkScale }] }]}>
              {agreed && <CheckIcon/>}
            </Animated.View>
            <Text style={S.termsTxt}>
              I agree to the <Text style={S.termsLink}>Terms of Service</Text> and <Text style={S.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          {/* CTA */}
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity style={[S.cta, !agreed && S.ctaDim]} onPress={handleSignup} disabled={!agreed} activeOpacity={0.88}>
              {loading ? <LoadingDots/> : <Text style={S.ctaTxt}>Create Account</Text>}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={S.div}>
            <View style={S.divL}/><Text style={S.divT}>or sign up with</Text><View style={S.divL}/>
          </View>

          {/* Social */}
          <View style={S.socials}>
            <TouchableOpacity style={S.socBtn} activeOpacity={0.75}>
              <GoogleIcon/><Text style={S.socTxt}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.socBtn} activeOpacity={0.75}>
              <AppleIcon/><Text style={S.socTxt}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Switch */}
          <View style={S.sw}>
            <Text style={S.swT}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={S.swL}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Trust */}
        <View style={S.trust}>
          {['🔒 100% Secure', '🌿 Certified Organic', '🚚 Free Delivery'].map(t => (
            <Text key={t} style={S.trustT}>{t}</Text>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0fdf4' },
  wave: { position: 'absolute', top: 0, left: 0, right: 0, height: 230, backgroundColor: '#16a34a', borderBottomLeftRadius: 56, borderBottomRightRadius: 56, overflow: 'hidden' },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 36 },

  logoSection: { alignItems: 'center', paddingTop: 50, paddingBottom: 22 },
  logoBox: { width: 66, height: 66, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 14, shadowColor: '#166534', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  brand: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.4 },
  sub: { fontSize: 12, color: '#dcfce7', marginTop: 3, letterSpacing: 0.4, opacity: 0.9 },

  card: { backgroundColor: '#fff', borderRadius: 28, padding: 26, marginTop: 4, shadowColor: '#166534', shadowOpacity: 0.1, shadowRadius: 28, shadowOffset: { width: 0, height: 8 }, elevation: 10, overflow: 'hidden' },
  cardBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#16a34a' },
  cardHead: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 6, marginBottom: 4 },
  cardCaption: { fontSize: 13, color: '#9ca3af', marginBottom: 20, lineHeight: 18 },

  fg: { marginBottom: 14 },
  lbl: { fontSize: 11, fontWeight: '700', color: '#374151', letterSpacing: 0.9, marginBottom: 7, textTransform: 'uppercase' },
  inp: { flexDirection: 'row', alignItems: 'center', gap: 11, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 15, height: 52 },
  inpFocus: { borderColor: '#16a34a', backgroundColor: '#f0fdf4', shadowColor: '#16a34a', shadowOpacity: 0.12, shadowRadius: 6, elevation: 2 },
  ti: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },

  strRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  strBar: { flex: 1, height: 3, borderRadius: 2 },
  strTxt: { fontSize: 11, fontWeight: '700', width: 40, textAlign: 'right' },

  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 14 },
  chk: { width: 22, height: 22, borderRadius: 7, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  chkOn: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  termsTxt: { flex: 1, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  termsLink: { color: '#16a34a', fontWeight: '700' },

  cta: { backgroundColor: '#16a34a', borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', shadowColor: '#16a34a', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  ctaDim: { backgroundColor: '#86efac', shadowOpacity: 0 },
  ctaTxt: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },

  div: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  divL: { flex: 1, height: 1, backgroundColor: '#f3f4f6' },
  divT: { color: '#d1d5db', fontSize: 12, fontWeight: '500' },

  socials: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  socBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f9fafb', borderWidth: 1.5, borderColor: '#e5e7eb', borderRadius: 14, height: 48 },
  socTxt: { fontSize: 14, color: '#374151', fontWeight: '600' },

  sw: { flexDirection: 'row', justifyContent: 'center' },
  swT: { fontSize: 13, color: '#9ca3af' },
  swL: { fontSize: 13, color: '#16a34a', fontWeight: '700' },

  trust: { marginTop: 22, gap: 5, alignItems: 'center' },
  trustT: { fontSize: 11, color: '#6b7280', fontWeight: '500' },
});
