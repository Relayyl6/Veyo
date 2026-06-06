Here is the complete implementation and documentation for upgrading your UI with `pressto`.

First, we will transform your static "View Map" text into an interactive, animated button featuring an expanding-arrows SVG. Then, I have provided a comprehensive guide on how to configure and scale `pressto` across your entire app.

### 1. The Animated "View Map" SVG Button

We will use `react-native-svg` to draw the expansion arrows and wrap the entire component in `PressableScale` from `pressto` to give it a satisfying, native-feeling "squish" when tapped.

```tsx
import React from 'react';
import { Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PressableScale } from 'pressto'; 

export const ViewMapButton = ({ onPress }) => {
  return (
    <PressableScale 
      onPress={onPress} 
      // Replaced your <View> with PressableScale and kept your Tailwind classes
      className="flex-row items-center gap-1.5 px-2 py-1 rounded-md"
    >
      <Text className="text-[#3122D2] text-[10px] font-JakartaBold">
        View Map
      </Text>
      
      {/* Expansion Arrows SVG */}
      <Svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#3122D2" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {/* Top Right Arrow */}
        <Path d="M15 3h6v6" />
        <Path d="M21 3l-7 7" />
        {/* Bottom Left Arrow */}
        <Path d="M9 21H3v-6" />
        <Path d="M3 21l7-7" />
      </Svg>
    </PressableScale>
  );
};

```

---

### 2. Pressto Configuration Guide

To maintain a consistent feel across the Veyo app, here is a reference guide on how to configure and customize other buttons using the `pressto` library.

#### A. The Built-in Presets

Pressto comes with two ready-to-use wrappers that you can drop in anywhere to replace standard React Native `Pressable` or `TouchableOpacity` components.

* **`PressableScale`**: Shrinks slightly when pressed (great for primary buttons, cards, and icons).
* **`PressableOpacity`**: Fades slightly when pressed (great for text links or ghost buttons).

```tsx
import { PressableScale, PressableOpacity } from 'pressto';

// Standard Scaling Button
<PressableScale onPress={() => handlePress()}>
  <Text>Confirm Ride</Text>
</PressableScale>

// Standard Fading Button
<PressableOpacity onPress={() => handlePress()}>
  <Text>Cancel</Text>
</PressableOpacity>

```

#### B. Global Configuration (App.tsx)

Instead of styling the animation timing on every single button, you can wrap your entire app in `<PressablesConfig>`. This allows you to define a universal physics spring or timing animation, ensuring every button feels identical. You can also inject global haptics here.

```tsx
import { PressablesConfig } from 'pressto';
import * as Haptics from 'expo-haptics';

export default function App() {
  return (
    <PressablesConfig 
      animationType="spring"
      animationConfig={{ damping: 30, stiffness: 200 }}
      config={{ 
        minScale: 0.95,      // How small buttons get when pressed
        activeOpacity: 0.6   // How transparent buttons get when pressed
      }}
      globalHandlers={{
        // Automatically triggers a tiny vibration on EVERY pressto button in the app
        onPress: () => Haptics.selectionAsync(), 
      }}
    >
      <YourMainAppNavigation />
    </PressablesConfig>
  );
}

```

#### C. Building Custom Animated Buttons

If you need a button to do something unique (like a refresh button that spins, or a toggle button that changes color), you can use `createAnimatedPressable`.

*Note: You must include the `'worklet';` directive inside the function so it runs on the UI thread at a smooth 60fps.*

```tsx
import { createAnimatedPressable } from 'pressto';

// 1. Define the custom animation behavior
const PressableRotate = createAnimatedPressable((progress) => {
  'worklet'; // Required for UI thread performance
  
  return {
    // progress goes from 0 (idle) to 1 (pressed)
    transform: [{ rotate: `${progress * 45}deg` }],
    opacity: 1 - (progress * 0.2), // Dims slightly
  };
});

// 2. Use it in your UI
export const RefreshButton = () => (
  <PressableRotate onPress={() => fetchNewDrivers()}>
    <Icon name="refresh" />
  </PressableRotate>
);

```

#### D. Advanced Interaction States

Pressto also exposes internal states to your custom animations, such as `isToggled` or `isSelected`. This is perfect for things like a row of vehicle options (Economy, Premium, XL) where you want the selected option to stay highlighted.

```tsx
const VehicleOption = createAnimatedPressable((progress, options) => {
  'worklet';
  const { isPressed, isSelected } = options; 

  return {
    transform: [{ scale: 1 - (progress * 0.05) }], // Squish on press
    backgroundColor: isSelected ? '#3122D2' : '#FFFFFF', // Highlight if active
    borderColor: isSelected ? '#3122D2' : '#E5E7EB',
    borderWidth: 2,
  };
});

```