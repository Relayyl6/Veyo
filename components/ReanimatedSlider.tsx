import React, { useState } from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  runOnJS, 
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Presets, useRealtimeComposer } from 'react-native-pulsar';
import { FontAwesome5 } from '@expo/vector-icons';

interface FullWidthSliderProps {
  onComplete: () => void;
  text?: string;
}

const ReanimatedSlider = ({ onComplete, text = "Swipe to Confirm" }: FullWidthSliderProps) => {
  // 1. Dynamic Width State
  const [trackWidth, setTrackWidth] = useState(0);
  
  // Sizing constants (match these to your Tailwind classes below)
  const THUMB_SIZE = 48; // h-12 w-12 = 48px
  const PADDING = 4;     // p-1 = 4px padding on all sides
  
  // The absolute maximum distance the thumb can travel
  const MAX_TRANSLATE = Math.max(0, trackWidth - THUMB_SIZE - (PADDING * 2));

  const translateX = useSharedValue(0);
  const isCompleted = useSharedValue(false);
  const { set, stop } = useRealtimeComposer();

  const pan = Gesture.Pan()
    // Prevent interaction if already completed or if width hasn't measured yet
    .enabled(!isCompleted.value && MAX_TRANSLATE > 0) 
    .onUpdate((event) => {
      // 2. Clamping: Restrict movement between 0 and the end of the track
      const newPosition = Math.max(0, Math.min(event.translationX, MAX_TRANSLATE));
      translateX.value = newPosition;

      // 3. Dynamic Haptics: Map position to a 0.0 -> 1.0 intensity scale
      const intensity = newPosition / MAX_TRANSLATE;
      
      // Update hardware vibration (Pulsar handles this cleanly on the UI thread)
      set(intensity, intensity);
    })
    .onEnd(() => {
      stop();

      // 4. Threshold Logic: If swiped past 80% of the total width
      if (translateX.value > MAX_TRANSLATE * 0.8) {
        isCompleted.value = true;
        
        // Snap to the very end
        translateX.value = withSpring(MAX_TRANSLATE, { damping: 15 });
        
        // Play the heavy completion clunk and trigger the function
        runOnJS(Presets.lock)();
        runOnJS(onComplete)();
      } else {
        // Let go too early? Spring back to the start
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      }
    });

  // Animate the thumb's position
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Fade out the background text as the thumb slides across
  const textStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, MAX_TRANSLATE / 2], // Fully visible at 0, fully hidden halfway across
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View 
      className="h-14 w-full bg-blue-100 rounded-full justify-center p-1"
      // Grab the exact pixel width of the track when it renders
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      {/* Background Text */}
      <Animated.View style={textStyle} className="absolute w-full items-center pointer-events-none">
        <Text className="text-blue-600 font-JakartaBold text-base tracking-wide">
          {text}
        </Text>
      </Animated.View>

      {/* The Draggable Thumb */}
      <GestureDetector gesture={pan}>
        <Animated.View 
          style={thumbStyle} 
          className="h-12 w-12 bg-blue-600 rounded-full items-center justify-center shadow-md shadow-neutral-400 z-10"
        >
          <FontAwesome5 name="chevron-right" size={16} color="#ffffff" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default ReanimatedSlider;