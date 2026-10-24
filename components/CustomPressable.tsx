import React from 'react';
import { createAnimatedPressable } from 'pressto';
// 1. IMPORT THE EXACT LIFECYCLE TYPE THE LIBRARY DEMANDS
import type { CustomPressableProps, AnimatedPressableOptions } from 'pressto';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';
import { View } from "react-native"

const PressableHybridBase = createAnimatedPressable((progress) => {
  'worklet';
  return {
    transform: [{ scale: 1 - progress * 0.05 }],
    opacity: 1 - progress * 0.1,
  };
});

cssInterop(PressableHybridBase, { className: 'style' });

// 2. USE ANY TEMPLATE FALLBACK HERE TO BYPASS THE ARGUMENT OVERLAP CONFLICT
type PressableHybridProps = Omit<CustomPressableProps, 'onPress'> & {
  className?: string;
  onPress?: (event: any) => void; // <-- Uses 'any' to cleanly bridge both CustomButton and pressto signatures
};

export const PressableHybrid: React.FC<PressableHybridProps> = ({
  onPress,
  children,
  className,
  ...props
}) => {
  
  const handlePressWithHaptic = (options: AnimatedPressableOptions) => {
    Haptics.selectionAsync().catch(() => {});
    if (onPress) onPress(options);
  };

  return (
    <View className={`overflow-hidden ${className ?? ''}`}>
      <PressableHybridBase
        {...props}
        onPress={handlePressWithHaptic}
        className="flex-1"
      >
        {children}
      </PressableHybridBase>
    </View>
  );
};