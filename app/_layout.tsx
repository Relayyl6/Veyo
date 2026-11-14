import '../global.css';
import 'expo-dev-client';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { View, StyleSheet } from 'react-native';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';
import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { PressablesConfig } from 'pressto';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import Constants from 'expo-constants';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent splash screen from auto-hiding before font loading completes
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

  const [loaded, fontError] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  const publishableKey =
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string) ||
    'pk_test_Y29ycmVjdC1jb2xsaWUtNDg2Ni5jbGVyay5hY2NvdW50cy5kZXYk';

  if (!publishableKey) {
    throw new Error('Add your Clerk Publishable Key to the .env file');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PressablesConfig 
          animationType="spring"
          animationConfig={{ 
            damping: 30, 
            stiffness: 200,
            mass: 1
          }}
          config={{ 
            minScale: 0.95,      
            activeOpacity: 0.6   
          }}
          globalHandlers={{
            onPress: () => Haptics.selectionAsync(), 
          }}
        >
          <StatusBar style='inverted' />
          <Stack screenOptions={{ animation: 'ios_from_right' }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
            <Stack.Screen name="(utils)" options={{ headerShown: false }} />
          </Stack>
        </PressablesConfig>
        {!splashAnimationFinished && (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
            <AnimatedSplashScreen 
              onComplete={() => setSplashAnimationFinished(true)} 
            />
          </View>
        )}
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
