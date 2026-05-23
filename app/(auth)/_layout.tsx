import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return null
  }

  if (isSignedIn) {
    return <Redirect href={'/(root)/(tabs)/home'} />
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
        contentStyle: {
          backgroundColor: '#F5F8FF',
        },
      }}
    >
      <Stack.Screen 
        name="welcome" 
        options={{
          title: 'Welcome',
        }} 
      />
      <Stack.Screen 
        name="sign-in"
        options={{
          title: 'Sign In',
          presentation: 'formSheet',
          sheetAllowedDetents: [0.9],
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
          sheetExpandsWhenScrolledToEdge: true
        }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{
          title: 'Sign Up',
        }} 
      />
    </Stack>
  );
}