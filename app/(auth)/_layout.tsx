import { Stack, Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href={'/(root)/(tabs)/home'} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'push',
        contentStyle: {
          backgroundColor: '#FFFFFF',
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
