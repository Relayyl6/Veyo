import React from 'react';
import { PressableProps } from 'react-native';
import { createAnimatedPressable } from 'pressto';
import { cssInterop } from 'nativewind';

// 1. Define the hybrid animation
const PressableHybridBase = createAnimatedPressable((progress) => {
  'worklet'; 

  return {
    transform: [{ scale: 1 - progress * 0.05 }], 
    opacity: 1 - progress * 0.1, 
  };
});

// 2. Teach NativeWind how to map className to style
cssInterop(PressableHybridBase, { className: 'style' });

// 3. THE FIX: Force TypeScript to recognize that this component accepts className
export const PressableHybrid = PressableHybridBase as React.FC<
  PressableProps & { 
    className?: string; 
    children?: React.ReactNode; 
  }
>;