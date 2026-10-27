import { Image, StyleSheet, Text, View, Alert, Platform } from 'react-native';
import React from 'react';
import CustomButton from './CustomButton';
import { icons } from '@/constants/utils';
import { useSignInWithGoogle } from '@clerk/expo/google';
import { useRouter } from 'expo-router';

declare interface GoogleSignInButtonProps {
  onSignInComplete?: () => void;
}

const OAuth = () => {
  const { startGoogleAuthenticationFlow } = useSignInWithGoogle();
  const router = useRouter();

  // Only render on iOS and Android
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  const handleGoogleSignIn = async (props?: any) => {
    try {
      const { createdSessionId, setActive } = await startGoogleAuthenticationFlow();

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        if (props?.onSignInComplete) {
          props.onSignInComplete();
        } else {
          router.replace('/(root)/(tabs)/home');
        }
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED' || err.code === '-5') {
        return;
      }

      Alert.alert('Error', err.message || 'An error occurred during Google sign-in');
      console.error('Sign in with Google error:', JSON.stringify(err, null, 2));
    }
  };

  const handleAppleSignIn = async () => {};

  return (
    <View className="mt-3">
      <View className="flex flex-row justify-center items-center gap-x-3 mb-2.5">
        <View className="h-px flex-1 bg-neutral-200" />
        <Text className="text-xs font-JakartaMedium text-neutral-400">Or Continue With</Text>
        <View className="h-px flex-1 bg-neutral-200" />
      </View>

      <View className="flex flex-row justify-center items-center gap-3">
        <CustomButton
          title="Google"
          IconLeft={() => (
            <Image
              source={icons.google}
              className="w-4 h-4"
              resizeMode="contain"
            />
          )}
          className="shadow-none px-5 py-2.5 border border-neutral-200 bg-white min-w-[120px]"
          bgVariant="outline"
          textVariant="primary"
          textClassName="text-xs font-JakartaSemiBold text-neutral-700"
          onPress={handleGoogleSignIn}
        />
        <CustomButton
          title="Apple"
          IconLeft={() => (
            <Image
              source={icons.apple}
              className="w-4 h-4"
              resizeMode="contain"
            />
          )}
          className="shadow-none px-5 py-2.5 border border-neutral-200 bg-white min-w-[120px]"
          bgVariant="outline"
          textVariant="primary"
          textClassName="text-xs font-JakartaSemiBold text-neutral-700"
          onPress={handleAppleSignIn}
        />
      </View>
    </View>
  );
};

export default OAuth;

const styles = StyleSheet.create({});
