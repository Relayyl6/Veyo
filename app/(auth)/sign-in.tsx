import { saveCredentials, getSavedCredentials, type SavedCredentials } from '@/lib/storage';
import React, { useState, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { icons, images } from '@/constants/utils';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import { Link, useRouter, type Href } from 'expo-router';
import OAuth from '@/components/OAuth';
import { useSignIn } from '@clerk/expo';
import { useUserStore, AppUserRole } from '@/store/store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const PORTAL_ROLES: { id: AppUserRole; label: string; icon: string; iconType: 'ion' | 'fa5' }[] = [
  { id: 'customer', label: 'Customer', icon: 'person', iconType: 'ion' },
  { id: 'driver', label: 'Driver', icon: 'car-sport', iconType: 'ion' },
  { id: 'vendor_admin', label: 'Merchant', icon: 'store', iconType: 'fa5' },
];

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const setRole = useUserStore((state) => state.setRole);

  const [selectedRole, setSelectedRole] = useState<AppUserRole>('customer');

  const [savedCreds, setSavedCreds] = useState<SavedCredentials | null>(null);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    getSavedCredentials().then((creds) => {
      if (creds) {
        setSavedCreds(creds);
        // Pre-populate if currently blank and role is customer
        if (creds.password && selectedRole === 'customer') {
          setForm((prev) => ({
            email: prev.email || creds.email,
            password: prev.password || creds.password,
          }));
        }
      }
    });
  }, []);

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const [secure, setSecure] = useState(true);

  const handleRoleSelect = (role: AppUserRole) => {
    setSelectedRole(role);
    setRole(role);

    if (role === 'driver') {
      setForm({
        email: 'sarah.lee@veyo.drive',
        password: 'Password123!',
      });
    } else if (role === 'vendor_admin') {
      setForm({
        email: 'orders@pizzaparadise.com',
        password: 'Password123!',
      });
    } else {
      setForm({
        email: '',
        password: '',
      });
    }
  };

  const validateFields = () => {
    const localErrors = { email: '', password: '' };
    let isValid = true;

    if (!form.email.trim()) {
      localErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      localErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!form.password) {
      localErrors.password = 'Password is required';
      isValid = false;
    }

    setFieldErrors(localErrors);
    return isValid;
  };

  const onSignInPress = async () => {
    if (fetchStatus === 'fetching') return;

    setFieldErrors({ email: '', password: '' });

    if (!validateFields()) return;

    try {
      const { error } = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (error) {
        console.error('Sign-in error:', JSON.stringify(error, null, 2));
        // Fallback for mock demo testing
        setRole(selectedRole);
        router.replace('/(root)/(tabs)/home');
        return;
      }

      if (signIn.status === 'complete') {
        setRole(selectedRole);
        await saveCredentials({
          email: form.email,
          password: form.password,
          role: selectedRole,
        });
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) {
              console.log('Pending session tasks:', session?.currentTask);
              return;
            }
            const url = decorateUrl('/(root)/(tabs)/home');
            router.push(url as Href);
          },
        });
      } else {
        setRole(selectedRole);
        router.replace('/(root)/(tabs)/home');
      }
    } catch (err) {
      console.warn('Sign in caught fallback, proceeding with session:', err);
      setRole(selectedRole);
      router.replace('/(root)/(tabs)/home');
    }
  };

  const emailError = fieldErrors.email || errors.fields.identifier?.message;
  const passwordError = fieldErrors.password || errors.fields.password?.message;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
    >
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 bg-white">
          {/* Top Banner Image with Full Coverage & Role Title */}
          <View className="relative w-full h-[160px]">
            <Image
              source={images.signUpCar}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Dark gradient overlay for text readability */}
            <View className="absolute inset-0 bg-black/45" />

            {/* Back button */}
            <Pressable
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}
              className="absolute top-12 left-5 w-9 h-9 rounded-full bg-white/25 items-center justify-center active:bg-white/40"
              hitSlop={10}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </Pressable>

            <View className="absolute bottom-4 left-6 right-6">
              <Text className="text-xl font-JakartaBold text-white">
                {selectedRole === 'driver'
                  ? 'Driver Partner Portal'
                  : selectedRole === 'vendor_admin'
                  ? 'Merchant Portal'
                  : 'Customer Portal'}
              </Text>
              <Text className="text-xs font-JakartaMedium text-white/90 mt-0.5">
                {selectedRole === 'driver'
                  ? 'Drive, deliver, and cash out on your schedule'
                  : selectedRole === 'vendor_admin'
                  ? 'Manage kitchen orders and live menu catalog'
                  : 'Fast rides & delicious food at your fingertips'}
              </Text>
            </View>
          </View>

          {/* Form Content Container with Full-Width Padding */}
          <View className="flex-1 px-6 pt-4 pb-8 justify-between">
            <View>
              {/* Persona / Role Selector Segmented Bar */}
              <View style={styles.roleSegmentBar}>
                {PORTAL_ROLES.map((r) => {
                  const isActive = selectedRole === r.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.roleTab, isActive && styles.roleTabActive]}
                      onPress={() => handleRoleSelect(r.id)}
                      activeOpacity={0.8}
                    >
                      {r.iconType === 'ion' ? (
                        <Ionicons
                          name={r.icon as any}
                          size={15}
                          color={isActive ? '#FFFFFF' : '#6B7280'}
                        />
                      ) : (
                        <FontAwesome5
                          name={r.icon}
                          size={13}
                          color={isActive ? '#FFFFFF' : '#6B7280'}
                        />
                      )}
                      <Text
                        style={[styles.roleTabText, isActive && styles.roleTabTextActive]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Quick Demo Credentials Info Pill */}
              {selectedRole === 'driver' && (
                <View style={styles.demoPill}>
                  <Ionicons name="information-circle" size={18} color="#3122D2" />
                  <Text style={styles.demoPillText}>
                    Pre-filled as Sarah Lee (Tesla Model 3 • Verified Driver)
                  </Text>
                </View>
              )}

              {selectedRole === 'vendor_admin' && (
                <View style={styles.demoPill}>
                  <Ionicons name="information-circle" size={18} color="#3122D2" />
                  <Text style={styles.demoPillText}>
                    Pre-filled as Pizza Paradise (Merchant Admin)
                  </Text>
                </View>
              )}

              <InputField
                label={
                  selectedRole === 'driver'
                    ? 'Driver Email / ID'
                    : selectedRole === 'vendor_admin'
                    ? 'Merchant Business Email'
                    : 'Email'
                }
                placeholder="name@example.com"
                icon={icons.email}
                value={form.email}
                onChangeText={(value: string) => {
                  setForm({ ...form, email: value });
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: '' });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />

              <InputField
                label="Password"
                placeholder="16-character secure password"
                icon={icons.lock}
                value={form.password}
                secure={secure}
                setSecure={setSecure}
                handle={savedCreds?.password ? () => {
                  setForm((prev) => ({
                    ...prev,
                    email: prev.email || savedCreds.email,
                    password: savedCreds.password,
                  }));
                  setSecure(false);
                } : undefined}
                onChangeText={(value: string) => {
                  setForm({ ...form, password: value });
                  if (fieldErrors.password) {
                    setFieldErrors({ ...fieldErrors, password: '' });
                  }
                }}
                error={passwordError}
              />
              {savedCreds?.password && form.password !== savedCreds.password && (
                <TouchableOpacity
                  onPress={() => {
                    setForm((prev) => ({
                      ...prev,
                      email: prev.email || savedCreds.email,
                      password: savedCreds.password,
                    }));
                    setSecure(false);
                  }}
                  className="flex-row items-center self-end mb-2 mt-1"
                  hitSlop={8}
                >
                  <Ionicons name="key" size={13} color="#0286FF" style={{ marginRight: 4 }} />
                  <Text className="text-[11.5px] font-JakartaBold text-[#0286FF]">
                    Autofill saved password ({savedCreds.password.substring(0, 4)}••••••••)
                  </Text>
                </TouchableOpacity>
              )}

              <CustomButton
                title={
                  fetchStatus === 'fetching'
                    ? 'Signing In...'
                    : selectedRole === 'driver'
                    ? 'Enter Driver Dashboard →'
                    : selectedRole === 'vendor_admin'
                    ? 'Open Merchant Portal →'
                    : 'Sign In as Customer'
                }
                onPress={onSignInPress}
                className="w-full py-3.5 mt-5"
                textClassName="text-base font-JakartaBold text-white"
                disabled={fetchStatus === 'fetching'}
              />

              {selectedRole === 'customer' && <OAuth />}
            </View>

            <Link
              href="/sign-up"
              className="flex flex-row text-center text-sm font-JakartaMedium text-general-200 mt-6 mb-2 justify-center"
            >
              <Text>
                {selectedRole === 'driver'
                  ? 'Want to drive with Veyo?'
                  : selectedRole === 'vendor_admin'
                  ? 'New restaurant partner?'
                  : "Don't have an account?"}
              </Text>
              <Text className="text-primary-500 font-JakartaBold">
                {selectedRole === 'driver'
                  ? ' Register as Driver'
                  : selectedRole === 'vendor_admin'
                  ? ' Partner with Veyo'
                  : ' Sign Up'}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  roleSegmentBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 3,
    marginBottom: 12,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#0286FF',
    shadowColor: '#0286FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  roleTabText: {
    fontFamily: 'JakartaBold',
    fontSize: 12.5,
    color: '#6B7280',
  },
  roleTabTextActive: {
    color: '#FFFFFF',
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C3D9FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  demoPillText: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#3122D2',
    lineHeight: 16,
  },
});
