// Add Animated to your existing react-native imports
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Pressable, TextInput, Alert, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { icons, images } from '@/constants/utils'
import InputField from '@/components/InputField'
import CustomButton from '@/components/CustomButton'
import { Link, useRouter } from 'expo-router'
import OAuth from '@/components/OAuth'
import { useSignUp, useAuth, useClerk  } from '@clerk/expo'
import type { Href } from 'expo-router'
import { generateSecurePassword } from '@/lib/utils'
import Modal from 'react-native-modal';
import { SuccessAnimation } from '@/components/Check'
import { fetchAPI } from '@/lib/fetch'

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [secure, setSecure] = useState(true)
  const [code, setCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showVerification, setShowVerification] = useState(false)
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(0);
  const [codeErr, setCodeErr] = useState("");
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)

  const { signUp, errors, fetchStatus } = useSignUp()
  const { setActive } = useClerk()
  const router = useRouter()

  useEffect(() => handleStartOver, [])

  useEffect(() => {
    let interval: NodeJS.Timeout;
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
      // Optional: Show success message
    } catch (error) {
      // Handle error
      setCanResend(true);
      setTimer(0);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  const formattedUsername = form.name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '') 
    + '_' + Math.random().toString(36).substring(2, 6)

  const validateFields = () => {
    const errors = {
      name: '',
      email: '',
      password: ''
    }
    let isValid = true

    if (!form.name.trim()) {
      errors.name = 'Name is required'
      isValid = false
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email'
      isValid = false
    }

    if (!form.password) {
      errors.password = 'Password is required'
      isValid = false
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const onSignUpPress = async () => {
    if (fetchStatus === 'fetching') return

    // Clear previous errors
    setFieldErrors({ name: '', email: '', password: '' })

    // Validate fields
    if (!validateFields()) return

    try {
      const { error } = await signUp.create({
        emailAddress: form.email,
        password: form.password,
        username: formattedUsername,
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ').slice(1).join(' ') || undefined,
      })

      if (error) {
        console.error('Sign-up creation error:', JSON.stringify(error, null, 2))
        return
      }

      // 2. Send the verification code
      const { error: verifyError } = await signUp.verifications.sendEmailCode()
      
      if (verifyError) {
        console.error('Send verification error:', JSON.stringify(verifyError, null, 2))
        return
      }

      // Show verification screen after successfully sending code
      setShowVerification(true)
    } catch (err: any) {
      // Handle Clerk-specific errors
      if (err.errors) {
        err.errors.forEach((error: any) => {
          if (error.meta?.paramName === 'email_address') {
            setFieldErrors(prev => ({ ...prev, email: error.message }))
          } else if (error.meta?.paramName === 'password') {
            setFieldErrors(prev => ({ ...prev, password: error.message }))
          }
        })
      }
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const handleCodeChange = (index: number, text: string) => {
    // Clear error when user starts typing
    if (codeErr) setCodeErr("")
  
    const newCodeArray = code.split('');
    newCodeArray[index] = text.slice(-1);
    const updatedCode = newCodeArray.join('');
    setCode(updatedCode);
    
    // Auto-focus next box
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all 6 digits are entered
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
    if (fetchStatus === 'fetching') return

    const codeToSubmit = typeof finalCode === 'string' ? finalCode : code;

    try {

      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code: codeToSubmit })

      if (verifyError) {
        const apiErr = verifyError as any;
        const errorMessage = apiErr.errors?.[0]?.longMessage 
                          || apiErr.errors?.[0]?.message 
                          || verifyError.message 
                          || 'Invalid verification code.';
                          
        setCodeErr(errorMessage);
        setCode('');
        inputRefs.current[0]?.focus();
        return; 
      }

      if (signUp.status === 'complete') {
        console.log('Attempting to finalize...')

        setIsVerified(true);
        await fetchAPI('/(api)/user', { 
          method: "POST",
          body: JSON.stringify({
            clerkId: signUp.createdUserId,
            email: form.email,
            firstName: signUp.firstName || form.name.split(' ')[0],
            lastName: signUp.lastName || form.name.split(' ').slice(1).join(' ') || undefined,
            avatarUrl: `https://ui-avatars.com/api/?name=${signUp.firstName}+${signUp.lastName}&background=2563EB&color=fff`,
            role: 'customer', // or whatever your default is
          })
         })
        
        setTimeout(async () => {
          try {
            const finalizeResult = await signUp.finalize({
              navigate: ({ decorateUrl }) => {
                 router.push(decorateUrl('/(root)/(tabs)/home') as Href);
              }
            });
            
            if (finalizeResult?.error) {
              console.error('Finalize error:', finalizeResult.error);
              setCodeErr('Failed to finalize session. Please try logging in.');
              setIsVerified(false); // Send them back to the form if it fails
            }
          } catch (e) {
             console.error('Finalize catch block:', e);
             setIsVerified(false);
          }
        }, 4000);

      } else {
        // We verified the email, but Clerk still needs more info!
        console.log('Missing fields:', signUp.missingFields)
        setCodeErr('Email verified, but account is missing information (like username or phone).');
      }

    } catch (err: any) {
      console.error('Caught error:', err)
      setCodeErr('An unexpected error occurred.');
    }
  }

  const handleStartOver = () => {
    signUp?.reset()
    setShowVerification(false)
    setCode('')
    setFieldErrors({ name: '', email: '', password: '' })
  }

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(12)
    setForm({ ...form, password: newPassword })
    setSecure(false) // Show the password so user can see what was generated
  }

  // Combine your local validation errors with Clerk's API errors
  const emailError = fieldErrors.email || errors.fields.emailAddress?.message
  const passwordError = fieldErrors.password || errors.fields.password?.message
  const codeError = errors.fields.code?.message

  const inputRefs = useRef<(TextInput | null)[]>([]);
   
  return (
    <KeyboardAvoidingView bottomOffset={20} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView className='flex-1 bg-white'>
        <View className='flex-1 bg-white'>
          <View className='relative w-full h-[250px]'>
            <Image
              source={images.signUpCar}
              className='z-0 w-full h-[250px]'
            />
            <Text className='text-2xl font-JakartaSemiBold text-black absolute bottom-5 left-5'>
              Create Your Account
            </Text>
          </View>

          <View className='p-5'>
            <InputField
              label="Name"
              placeholder="John Doe"
              icon={icons.person}
              value={form.name}
              onChangeText={(value: string) => {
                setForm({ ...form, name: value })
                // Clear error when user starts typing
                if (fieldErrors.name) {
                  setFieldErrors({ ...fieldErrors, name: '' })
                }
              }}
              error={fieldErrors.name}
            />

            <InputField
              label="Email"
              placeholder="johndoe@example.com"
              icon={icons.email}
              value={form.email}
              onChangeText={(value: string) => {
                setForm({ ...form, email: value })
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: '' })
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
                setForm({ ...form, password: value })
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: '' })
                }
              }}
              error={passwordError}
              handle={handleGeneratePassword}
            />

            <CustomButton
              title={fetchStatus === 'fetching' ? "Loading..." : "Sign Up"}
              onPress={onSignUpPress}
              className='mt-6'
            />

            <OAuth />

            <Link href="/sign-in" className='flex flex-row text-center text-lg text-general-200 mt-10 justify-center'>
              <Text>Already have an account?</Text>
              <Text className="text-primary-500"> Log In</Text>
            </Link>
          </View>

          <Modal isVisible={showVerification}>
            <View className="bg-white rounded-[20px] p-6 shadow-lg mx-auto">
              {
              isVerified ? (
                <SuccessAnimation />
              ) : (
                <>
                  <Text style={styles.title}>Enter the 6-digit code</Text>
            
                  <Text style={styles.subtitle}>
                    We sent a code to <Text style={styles.emailHighlight}>{form.email}</Text>
                  </Text>

                  <View style={styles.codeInputContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <TextInput
                        key={index}
                        style={[
                          styles.codeBox,
                          code.length > index && styles.codeBoxFilled
                        ]}
                        placeholder={'123456'[index]} 
                        value={code[index] || ''}
                        onChangeText={(text) => handleCodeChange(index, text)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent)}
                        keyboardType="numeric"
                        maxLength={1}
                        ref={(el) => { inputRefs.current[index] = el }}
                        placeholderTextColor="#CCCCCC"
                      />
                    ))}
                  </View>
                  {/* Inline error message */}
                  {codeErr ? (
                      <Text style={styles.errorText}>
                        {codeErr}
                      </Text>
                    ) : null}
                  <Text style={styles.helpText} className='flex text-center'>
                    If you don't see the email in your inbox, check your spam folder. 
                    If it's not there, the email address may not be confirmed, 
                    or it may not match an existing account.
                  </Text>
                  <Pressable
                    style={[styles.button, fetchStatus === 'fetching' && styles.buttonDisabled]}
                    onPress={() => handleVerify()}
                    disabled={fetchStatus === 'fetching'}
                    className='mx-auto'
                  >
                    <Text style={styles.buttonText}>
                      {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify Email'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.resendLink}
                    onPress={handleResendCode}
                    disabled={!canResend || fetchStatus === 'fetching'}
                  >
                    <Text style={[
                      styles.resendLinkText,
                      (!canResend || fetchStatus === 'fetching') && { color: '#CCCCCC' }
                    ]}>
                      {!canResend ? `Resend code in ${timer}s` : 'Resend code'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.startOverLink}
                    onPress={handleStartOver}
                  >
                    <Text style={styles.startOverLinkText}>Start over</Text>
                  </Pressable>
                </>
              )}
            </View>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignUp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  subtitler: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 15,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  verificationContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 22,
  },
  emailHighlight: {
    color: '#1a1a1a',
    fontWeight: '500',
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 2
  },
  codeBox: {
    flex: 1, // MAGIC FIX: This tells each box to shrink/grow equally to fit the screen!
    // aspectRatio: 1, // Keeps the boxes perfectly square
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    backgroundColor: '#FAFAFA',
  },
  codeBoxFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
    marginBottom: 24,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  resendLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  resendLinkText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '500',
  },
  startOverLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  startOverLinkText: {
    color: '#888888',
    fontSize: 15,
  },
})