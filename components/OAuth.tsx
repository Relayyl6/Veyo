import { Image, StyleSheet, Text, View, Alert, Platform, TouchableOpacity } from 'react-native';
import React from 'react';
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
    <View style={styles.container}>
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or Continue With</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.oauthBtn}
          activeOpacity={0.8}
          onPress={handleGoogleSignIn}
        >
          <Image
            source={icons.google}
            style={styles.oauthIcon}
            resizeMode="contain"
          />
          <Text style={styles.oauthText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.oauthBtn}
          activeOpacity={0.8}
          onPress={handleAppleSignIn}
        >
          <Image
            source={icons.apple}
            style={styles.oauthIcon}
            resizeMode="contain"
          />
          <Text style={styles.oauthText}>Apple</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OAuth;

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontFamily: 'JakartaMedium',
    fontSize: 12,
    color: '#9CA3AF',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingVertical: 9,
    paddingHorizontal: 18,
    minWidth: 110,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  oauthIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  oauthText: {
    fontFamily: 'JakartaSemiBold',
    fontSize: 13,
    color: '#1F2937',
  },
});
