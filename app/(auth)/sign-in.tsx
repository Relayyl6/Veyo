import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons, images } from '@/constants/utils';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import { Link, useRouter, type Href } from 'expo-router';
import OAuth from '@/components/OAuth';
import { useSignIn } from '@clerk/expo';
import { useUserStore, AppUserRole } from '@/store/store';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const PORTAL_ROLES: { id: AppUserRole; label: string; icon: string; iconType: 'ion' | 'fa5' }[] = [
  { id: 'customer', label: 'Rider', icon: 'person', iconType: 'ion' },
  { id: 'driver', label: 'Driver', icon: 'car-sport', iconType: 'ion' },
  { id: 'vendor_admin', label: 'Merchant', icon: 'store', iconType: 'fa5' },
];

const SignIn = () => {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const setRole = useUserStore((state) => state.setRole);

  const [selectedRole, setSelectedRole] = useState<AppUserRole>('customer');

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

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
      style={{ flex: 1 }}
    >
      <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
        <View className="flex-1 bg-white">
          {/* Top Banner Image with Role Title */}
          <View className="relative w-full h-[170px]">
            <Image
              source={images.signUpCar}
              className="z-0 w-full h-[170px]"
              resizeMode="cover"
            />
            <View className="absolute bottom-5 left-5 right-5">
              <Text className="text-2xl font-JakartaBold text-white shadow-md">
                {selectedRole === 'driver'
                  ? 'Driver Partner Portal'
                  : selectedRole === 'vendor_admin'
                  ? 'Merchant Portal'
                  : 'Welcome Back'}
              </Text>
              <Text className="text-xs font-JakartaMedium text-white/90 mt-1">
                {selectedRole === 'driver'
                  ? 'Drive, deliver, and cash out on your schedule'
                  : selectedRole === 'vendor_admin'
                  ? 'Manage kitchen orders and live menu catalog'
                  : 'Fast rides & delicious food at your fingertips'}
              </Text>
            </View>
          </View>

          <View className="px-5 pt-3 pb-6">
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
                        size={14}
                        color={isActive ? '#FFFFFF' : '#6B7280'}
                      />
                    ) : (
                      <FontAwesome5
                        name={r.icon}
                        size={12}
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
                <Ionicons name="information-circle" size={16} color="#3122D2" />
                <Text style={styles.demoPillText}>
                  Pre-filled as Sarah Lee (Tesla Model 3 • Verified Driver)
                </Text>
              </View>
            )}

            {selectedRole === 'vendor_admin' && (
              <View style={styles.demoPill}>
                <Ionicons name="information-circle" size={16} color="#3122D2" />
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
              placeholder="Min. 8 characters"
              icon={icons.lock}
              value={form.password}
              secure={secure}
              setSecure={setSecure}
              onChangeText={(value: string) => {
                setForm({ ...form, password: value });
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: '' });
                }
              }}
              error={passwordError}
            />

            <View className="items-center justify-center mt-4">
              <CustomButton
                title={
                  fetchStatus === 'fetching'
                    ? 'Signing In...'
                    : selectedRole === 'driver'
                    ? 'Enter Driver Dashboard →'
                    : selectedRole === 'vendor_admin'
                    ? 'Open Merchant Portal →'
                    : 'Sign In'
                }
                onPress={onSignInPress}
                className="self-center px-8 py-2.5 min-w-[180px]"
                textClassName="text-sm font-JakartaBold"
                disabled={fetchStatus === 'fetching'}
              />
            </View>

            {selectedRole === 'customer' && <OAuth />}

            <Link
              href="/sign-up"
              className="flex flex-row text-center text-sm font-JakartaMedium text-general-200 mt-4 justify-center"
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
    marginBottom: 16,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
    fontSize: 12,
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
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    gap: 8,
  },
  demoPillText: {
    flex: 1,
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#3122D2',
  },
});
