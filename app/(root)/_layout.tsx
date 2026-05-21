import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationTypeForReplace: 'pop',
      }}
    >
      <Stack.Screen 
        name="(tabs)" 
        options={{
          title: 'Home',
        }} 
      />
    </Stack>
  );
}
