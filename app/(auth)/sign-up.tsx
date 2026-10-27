import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { icons, images } from '@/constants/utils';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';
import { Link, useRouter, type Href } from 'expo-router';
import OAuth from '@/components/OAuth';
import { useSignUp, useClerk } from '@clerk/expo';
import { generateSecurePassword } from '@/lib/utils';
import Modal from 'react-native-modal';
import { SuccessAnimation } from '@/components/Check';
import { registerUserAccount, registerDriverProfile, registerVendorProfile } from '@/services/authService';
import { useUserStore } from '@/store/store';

type SignupRole = 'customer' | 'driver' | 'vendor_admin';

const SignUp = () => {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const { setActive } = useClerk();
  const { setUserSession } = useUserStore();

  // 1. Role State
  const [selectedRole, setSelectedRole] = useState<SignupRole>('customer');

  // 2. Base Form
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  // 3. Driver Role Form
  const [driverForm, setDriverForm] = useState({
    vehicleType: 'standard' as 'standard' | 'luxury' | 'suv' | 'taxi' | 'auto',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '2023',
    vehicleColor: 'Silver',
    licensePlate: '',
    licenseNumber: '',
  });

  // 4. Vendor Role Form
  const [vendorForm, setVendorForm] = useState({
    businessName: '',
    businessCategory: 'fast_food' as
      | 'italian'
      | 'japanese'
      | 'american'
      | 'chinese'
      | 'mexican'
      | 'indian'
      | 'thai'
      | 'fast_food'
      | 'bakery'
      | 'cafe',
    address: '',
    phone: '',
    description: '',
  });

  const [secure, setSecure] = useState(true);
  const [code, setCode] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showVerification, setShowVerification] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [codeErr, setCodeErr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => handleStartOver, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResendCode = async () => {
    if (!canResend) return;

    setCanResend(false);
    setTimer(30);

    try {
      await signUp?.verifications.sendEmailCode();
    } catch (error) {
      setCanResend(true);
      setTimer(0);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };



  const validateFields = () => {
    const errs: Record<string, string> = {};
    let isValid = true;

    if (!form.name.trim()) {
      errs.name = 'Full name is required';
      isValid = false;
    }

    if (!form.email.trim()) {
      errs.email = 'Email address is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!form.password) {
      errs.password = 'Password is required';
      isValid = false;
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    // Role-specific validations
    if (selectedRole === 'driver') {
      if (!driverForm.vehicleMake.trim() || !driverForm.vehicleModel.trim()) {
        errs.vehicle = 'Vehicle Make and Model are required';
        isValid = false;
      }
      if (!driverForm.licensePlate.trim()) {
        errs.licensePlate = 'License plate is required';
        isValid = false;
      }
      if (!driverForm.licenseNumber.trim()) {
        errs.licenseNumber = "Driver's license number is required";
        isValid = false;
      }
    } else if (selectedRole === 'vendor_admin') {
      if (!vendorForm.businessName.trim()) {
        errs.businessName = 'Business or restaurant name is required';
        isValid = false;
      }
      if (!vendorForm.address.trim()) {
        errs.vendorAddress = 'Store address is required';
        isValid = false;
      }
      if (!vendorForm.phone.trim()) {
        errs.vendorPhone = 'Business contact phone is required';
        isValid = false;
      }
    }

    setFieldErrors(errs);
    return isValid;
  };

  const onSignUpPress = async () => {
    if (fetchStatus === 'fetching') return;
    setFieldErrors({});

    if (!validateFields()) return;

    try {
      const { error } = await signUp.create({
        emailAddress: form.email.trim(),
        password: form.password,
        firstName: form.name.trim().split(' ')[0],
        lastName: form.name.trim().split(' ').slice(1).join(' ') || undefined,
      });

      if (error) {
        console.error('Sign-up creation error:', JSON.stringify(error, null, 2));
        const errObj = error as any;
        const apiErrors: any[] = errObj.errors || [];
        const errMap: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          const param = e.meta?.paramName || e.meta?.param_name;
          if (param === 'email_address') errMap.email = e.longMessage || e.message;
          if (param === 'password') errMap.password = e.longMessage || e.message;
        });

        if (Object.keys(errMap).length > 0) {
          setFieldErrors((prev) => ({ ...prev, ...errMap }));
        }

        const primaryMessage =
          apiErrors[0]?.longMessage ||
          apiErrors[0]?.message ||
          error.longMessage ||
          error.message ||
          'Sign-up failed. Please check your credentials.';

        Alert.alert(
          'Sign-up Notice',
          primaryMessage,
          [
            { text: 'Try Again', style: 'cancel' },
            {
              text: 'Continue in Demo Mode',
              onPress: async () => {
                const mockUser = await registerUserAccount({
                  clerkId: `demo_${Date.now()}`,
                  email: form.email,
                  firstName: form.name.split(' ')[0],
                  lastName: form.name.split(' ').slice(1).join(' ') || undefined,
                  role: selectedRole,
                });
                setUserSession(mockUser, null, null);
                router.replace('/(root)/(tabs)/home');
              },
            },
          ]
        );
        return;
      }

      // Send verification code
      const { error: verifyError } = await signUp.verifications.sendEmailCode();
      if (verifyError) {
        console.error('Send verification error:', JSON.stringify(verifyError, null, 2));
        const vErr = verifyError as any;
        const vMsg =
          vErr.errors?.[0]?.longMessage ||
          vErr.errors?.[0]?.message ||
          verifyError.longMessage ||
          verifyError.message ||
          'Failed to send verification code. Please try again.';
        Alert.alert('Verification Notice', vMsg);
        return;
      }

      setShowVerification(true);
    } catch (err: any) {
      console.error('Caught error during sign up:', JSON.stringify(err, null, 2));
      const msg =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'An unexpected error occurred during sign up.';
      Alert.alert('Sign-up Error', msg);
    }
  };

  const handleCodeChange = (index: number, text: string) => {
    if (codeErr) setCodeErr('');

    const newCodeArray = code.split('');
    newCodeArray[index] = text.slice(-1);
    const updatedCode = newCodeArray.join('');
    setCode(updatedCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updatedCode.length === 6) {
      setTimeout(() => {
        handleVerify(updatedCode);
      }, 100);
    }
  };

  const handleKeyPress = (index: number, nativeEvent: any) => {
    if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (finalCode?: string) => {
    if (fetchStatus === 'fetching') return;
    const codeToSubmit = typeof finalCode === 'string' ? finalCode : code;

    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({
        code: codeToSubmit,
      });

      if (verifyError) {
        const apiErr = verifyError as any;
        const errorMessage =
          apiErr.errors?.[0]?.longMessage ||
          apiErr.errors?.[0]?.message ||
          verifyError.message ||
          'Invalid verification code.';

        setCodeErr(errorMessage);
        setCode('');
        inputRefs.current[0]?.focus();
        return;
      }

      if (signUp.status === 'complete') {
        setIsVerified(true);

        // 1. Provision base user in backend
        const createdUser = await registerUserAccount({
          clerkId: signUp.createdUserId!,
          email: form.email,
          firstName: signUp.firstName || form.name.split(' ')[0],
          lastName: signUp.lastName || form.name.split(' ').slice(1).join(' ') || undefined,
          phone: form.phone || vendorForm.phone || undefined,
          avatarUrl: `https://ui-avatars.com/api/?name=${signUp.firstName}+${signUp.lastName}&background=0286FF&color=fff`,
          role: selectedRole,
        });

        let driverProfile = null;
        let vendorProfile = null;

        // 2. Provision role profile if driver or vendor
        if (selectedRole === 'driver') {
          driverProfile = await registerDriverProfile({
            userId: createdUser?.id,
            clerkId: signUp.createdUserId!,
            licenseNumber: driverForm.licenseNumber,
            vehicleType: driverForm.vehicleType,
            vehicleMake: driverForm.vehicleMake,
            vehicleModel: driverForm.vehicleModel,
            vehicleYear: Number(driverForm.vehicleYear) || 2023,
            vehicleColor: driverForm.vehicleColor,
            licensePlate: driverForm.licensePlate,
          });
        } else if (selectedRole === 'vendor_admin') {
          vendorProfile = await registerVendorProfile({
            ownerId: createdUser?.id,
            clerkId: signUp.createdUserId!,
            businessName: vendorForm.businessName,
            businessCategory: vendorForm.businessCategory,
            address: vendorForm.address,
            phone: vendorForm.phone,
            description: vendorForm.description,
          });
        }

        // 3. Update Zustand Store with full session
        if (createdUser) {
          setUserSession(createdUser, driverProfile, vendorProfile);
        }

        setTimeout(async () => {
          try {
            if (signUp.createdSessionId && setActive) {
              await setActive({ session: signUp.createdSessionId });
            }
            const finalizeResult = await signUp.finalize({
              navigate: ({ decorateUrl }) => {
                router.replace(decorateUrl('/(root)/(tabs)/home') as Href);
              },
            });

            if (finalizeResult?.error) {
              console.error('Finalize warning, navigating directly:', finalizeResult.error);
              router.replace('/(root)/(tabs)/home');
            }
          } catch (e) {
            console.error('Finalize catch, navigating directly:', e);
            router.replace('/(root)/(tabs)/home');
          }
        }, 1500);
      } else {
        setCodeErr('Email verified, but account needs additional setup.');
      }
    } catch (err: any) {
      console.error('Caught error during verify:', err);
      setCodeErr('An unexpected verification error occurred.');
    }
  };

  const handleStartOver = () => {
    signUp?.reset();
    setShowVerification(false);
    setCode('');
    setFieldErrors({});
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    setForm({ ...form, password: newPassword });
    setSecure(false);
  };

  const emailError = fieldErrors.email || errors.fields.emailAddress?.message;
  const passwordError = fieldErrors.password || errors.fields.password?.message;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 bg-white">
          {/* Header Banner */}
          <View className="relative w-full h-[170px]">
            <Image source={images.signUpCar} className="z-0 w-full h-[170px]" resizeMode="cover" />
            <Text className="text-xl font-JakartaBold text-black absolute bottom-3 left-5">
              Join Veyo
            </Text>
          </View>

          <View className="px-5 pt-3 pb-6">
            {/* 1. ROLE SELECTION CARDS */}
            <Text className="text-xs font-JakartaBold text-neutral-700 mb-1.5">
              Select Account Type
            </Text>
            <View className="flex-row gap-2 mb-3">
              {/* Customer */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'customer' && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedRole('customer')}
              >
                <View
                  style={[
                    styles.roleIconCircle,
                    selectedRole === 'customer' && styles.roleIconCircleActive,
                  ]}
                >
                  <FontAwesome5
                    name="user"
                    size={15}
                    color={selectedRole === 'customer' ? '#FFFFFF' : '#0286FF'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === 'customer' && styles.roleTitleActive,
                  ]}
                >
                  Passenger
                </Text>
                <Text style={styles.roleDesc}>Rides & Dining</Text>
              </TouchableOpacity>

              {/* Driver */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'driver' && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedRole('driver')}
              >
                <View
                  style={[
                    styles.roleIconCircle,
                    selectedRole === 'driver' && styles.roleIconCircleActive,
                  ]}
                >
                  <FontAwesome5
                    name="car"
                    size={15}
                    color={selectedRole === 'driver' ? '#FFFFFF' : '#3122D2'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === 'driver' && styles.roleTitleActive,
                  ]}
                >
                  Driver
                </Text>
                <Text style={styles.roleDesc}>Drive & Earn</Text>
              </TouchableOpacity>

              {/* Vendor */}
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  selectedRole === 'vendor_admin' && styles.roleCardActive,
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedRole('vendor_admin')}
              >
                <View
                  style={[
                    styles.roleIconCircle,
                    selectedRole === 'vendor_admin' && styles.roleIconCircleActive,
                  ]}
                >
                  <Ionicons
                    name="restaurant"
                    size={16}
                    color={selectedRole === 'vendor_admin' ? '#FFFFFF' : '#0CC25F'}
                  />
                </View>
                <Text
                  style={[
                    styles.roleTitle,
                    selectedRole === 'vendor_admin' && styles.roleTitleActive,
                  ]}
                >
                  Merchant
                </Text>
                <Text style={styles.roleDesc}>Food & Store</Text>
              </TouchableOpacity>
            </View>

            {/* 2. BASE CREDENTIALS */}
            <InputField
              label="Full Name"
              placeholder="e.g. John Doe"
              icon={icons.person}
              value={form.name}
              onChangeText={(val: string) => {
                setForm({ ...form, name: val });
                if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
              }}
              error={fieldErrors.name}
            />

            <InputField
              label="Email Address"
              placeholder="name@example.com"
              icon={icons.email}
              value={form.email}
              onChangeText={(val: string) => {
                setForm({ ...form, email: val });
                if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <InputField
              label="Password"
              placeholder="Min. 15 characters (tap arrow for secure)"
              icon={icons.lock}
              value={form.password}
              secure={secure}
              setSecure={setSecure}
              onChangeText={(val: string) => {
                setForm({ ...form, password: val });
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
              }}
              error={passwordError}
              handle={handleGeneratePassword}
            />

            {/* 3. DYNAMIC DRIVER ONBOARDING FIELDS */}
            {selectedRole === 'driver' && (
              <View style={styles.roleSpecificSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="car-sport" size={18} color="#3122D2" />
                  <Text style={styles.sectionHeaderText}>Driver Partner Details</Text>
                </View>

                {/* Vehicle Type Picker */}
                <Text style={styles.inputSubLabel}>Vehicle Category</Text>
                <View style={styles.pillRow}>
                  {(['standard', 'comfort', 'suv', 'luxury'] as const).map((vt) => {
                    const isPicked = driverForm.vehicleType === (vt === 'comfort' ? 'standard' : vt);
                    return (
                      <TouchableOpacity
                        key={vt}
                        style={[styles.typePill, isPicked && styles.typePillActive]}
                        onPress={() =>
                          setDriverForm({
                            ...driverForm,
                            vehicleType: (vt === 'comfort' ? 'standard' : vt) as any,
                          })
                        }
                      >
                        <Text style={[styles.typePillText, isPicked && styles.typePillTextActive]}>
                          {vt.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <InputField
                  label="Vehicle Make & Model"
                  placeholder="e.g. Toyota Camry"
                  value={driverForm.vehicleMake}
                  onChangeText={(val: string) =>
                    setDriverForm({
                      ...driverForm,
                      vehicleMake: val.split(' ')[0] || val,
                      vehicleModel: val.split(' ').slice(1).join(' ') || 'Sedan',
                    })
                  }
                  error={fieldErrors.vehicle}
                />

                <InputField
                  label="License Plate Number"
                  placeholder="e.g. LAG-234-XY"
                  value={driverForm.licensePlate}
                  onChangeText={(val: string) =>
                    setDriverForm({ ...driverForm, licensePlate: val.toUpperCase() })
                  }
                  autoCapitalize="characters"
                  error={fieldErrors.licensePlate}
                />

                <InputField
                  label="Driver's License Number"
                  placeholder="e.g. DL-123456789"
                  value={driverForm.licenseNumber}
                  onChangeText={(val: string) =>
                    setDriverForm({ ...driverForm, licenseNumber: val.toUpperCase() })
                  }
                  autoCapitalize="characters"
                  error={fieldErrors.licenseNumber}
                />
              </View>
            )}

            {/* 4. DYNAMIC VENDOR ONBOARDING FIELDS */}
            {selectedRole === 'vendor_admin' && (
              <View style={styles.roleSpecificSection}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="storefront" size={18} color="#0CC25F" />
                  <Text style={styles.sectionHeaderText}>Merchant / Restaurant Details</Text>
                </View>

                {/* Category Picker */}
                <Text style={styles.inputSubLabel}>Cuisine / Store Type</Text>
                <View style={styles.pillRow}>
                  {(['fast_food', 'italian', 'bakery', 'cafe', 'japanese', 'american'] as const).map(
                    (cat) => {
                      const isPicked = vendorForm.businessCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.typePill, isPicked && styles.typePillActive]}
                          onPress={() => setVendorForm({ ...vendorForm, businessCategory: cat })}
                        >
                          <Text style={[styles.typePillText, isPicked && styles.typePillTextActive]}>
                            {cat.replace('_', ' ').toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    }
                  )}
                </View>

                <InputField
                  label="Business / Restaurant Name"
                  placeholder="e.g. Pizza Paradise"
                  value={vendorForm.businessName}
                  onChangeText={(val: string) =>
                    setVendorForm({ ...vendorForm, businessName: val })
                  }
                  error={fieldErrors.businessName}
                />

                <InputField
                  label="Store Address"
                  placeholder="e.g. 14 Marina St, Lagos"
                  value={vendorForm.address}
                  onChangeText={(val: string) =>
                    setVendorForm({ ...vendorForm, address: val })
                  }
                  error={fieldErrors.vendorAddress}
                />

                <InputField
                  label="Business Contact Phone"
                  placeholder="e.g. +234 801 234 5678"
                  value={vendorForm.phone}
                  onChangeText={(val: string) => setVendorForm({ ...vendorForm, phone: val })}
                  keyboardType="phone-pad"
                  error={fieldErrors.vendorPhone}
                />
              </View>
            )}

            {/* Submit Action */}
            <View className="items-center justify-center mt-4">
              <CustomButton
                title={fetchStatus === 'fetching' ? 'Registering...' : `Sign Up as ${selectedRole === 'driver' ? 'Driver' : selectedRole === 'vendor_admin' ? 'Merchant' : 'User'}`}
                onPress={onSignUpPress}
                className="self-center px-8 py-2.5 min-w-[200px]"
                textClassName="text-sm font-JakartaBold"
              />
            </View>

            <OAuth />

            <Link
              href="/sign-in"
              className="flex flex-row text-center text-sm font-JakartaMedium text-general-200 mt-4 justify-center"
            >
              <Text>Already have an account?</Text>
              <Text className="text-primary-500 font-JakartaBold"> Log In</Text>
            </Link>
          </View>

          {/* 5. 6-DIGIT EMAIL VERIFICATION MODAL */}
          <Modal isVisible={showVerification}>
            <View className="bg-white rounded-[20px] p-6 shadow-lg mx-auto w-full max-w-[360px]">
              {isVerified ? (
                <SuccessAnimation />
              ) : (
                <>
                  <Text style={styles.modalTitle}>Verify Email Code</Text>
                  <Text style={styles.modalSubtitle}>
                    We sent a 6-digit confirmation code to{' '}
                    <Text style={styles.emailHighlight}>{form.email}</Text>
                  </Text>

                  <View style={styles.codeInputContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <TextInput
                        key={index}
                        style={[
                          styles.codeBox,
                          code.length > index && styles.codeBoxFilled,
                        ]}
                        placeholder={'123456'[index]}
                        value={code[index] || ''}
                        onChangeText={(text) => handleCodeChange(index, text)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent)}
                        keyboardType="numeric"
                        maxLength={1}
                        ref={(el) => {
                          inputRefs.current[index] = el;
                        }}
                        placeholderTextColor="#CCCCCC"
                      />
                    ))}
                  </View>

                  {codeErr ? <Text style={styles.errorText}>{codeErr}</Text> : null}

                  <Pressable
                    style={[
                      styles.verifyButton,
                      fetchStatus === 'fetching' && styles.buttonDisabled,
                    ]}
                    onPress={() => handleVerify()}
                    disabled={fetchStatus === 'fetching'}
                  >
                    <Text style={styles.verifyButtonText}>
                      {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify & Continue'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.resendLink}
                    onPress={handleResendCode}
                    disabled={!canResend || fetchStatus === 'fetching'}
                  >
                    <Text
                      style={[
                        styles.resendLinkText,
                        (!canResend || fetchStatus === 'fetching') && { color: '#CCCCCC' },
                      ]}
                    >
                      {!canResend ? `Resend code in ${timer}s` : 'Resend code'}
                    </Text>
                  </Pressable>

                  <Pressable style={styles.startOverLink} onPress={handleStartOver}>
                    <Text style={styles.startOverLinkText}>Start over</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  roleCard: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1.5,
    borderColor: '#EEEEEE',
    alignItems: 'center',
  },
  roleCardActive: {
    backgroundColor: '#EBF4FF',
    borderColor: '#0286FF',
  },
  roleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  roleIconCircleActive: {
    backgroundColor: '#0286FF',
  },
  roleTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#333333',
  },
  roleTitleActive: {
    color: '#0286FF',
  },
  roleDesc: {
    fontFamily: 'JakartaMedium',
    fontSize: 8.5,
    color: '#858585',
    marginTop: 1,
  },
  roleSpecificSection: {
    backgroundColor: '#F5F8FF',
    padding: 14,
    borderRadius: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#C3D9FF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeaderText: {
    fontFamily: 'JakartaBold',
    fontSize: 14,
    color: '#0B1528',
  },
  inputSubLabel: {
    fontFamily: 'JakartaBold',
    fontSize: 11,
    color: '#666666',
    marginBottom: 6,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  typePillActive: {
    backgroundColor: '#0286FF',
    borderColor: '#0286FF',
  },
  typePillText: {
    fontFamily: 'JakartaBold',
    fontSize: 10,
    color: '#666666',
  },
  typePillTextActive: {
    color: '#FFFFFF',
  },
  modalTitle: {
    fontFamily: 'JakartaBold',
    fontSize: 18,
    color: '#0B1528',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#858585',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  emailHighlight: {
    fontFamily: 'JakartaBold',
    color: '#0286FF',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  codeBox: {
    width: 44,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CED1DD',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'JakartaBold',
    color: '#0B1528',
    backgroundColor: '#F8F8F8',
  },
  codeBoxFilled: {
    borderColor: '#0286FF',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#F56565',
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
  },
  verifyButton: {
    backgroundColor: '#0286FF',
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 180,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontFamily: 'JakartaBold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  resendLink: {
    alignItems: 'center',
    marginTop: 12,
  },
  resendLinkText: {
    fontFamily: 'JakartaBold',
    fontSize: 12,
    color: '#0286FF',
  },
  startOverLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  startOverLinkText: {
    fontFamily: 'JakartaMedium',
    fontSize: 11,
    color: '#858585',
  },
});
