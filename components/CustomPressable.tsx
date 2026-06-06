import React from 'react';
import { createAnimatedPressable } from 'pressto';
// 1. IMPORT THE EXACT LIFECYCLE TYPE THE LIBRARY DEMANDS
import type { CustomPressableProps, AnimatedPressableOptions } from 'pressto';
import { cssInterop } from 'nativewind';
import * as Haptics from 'expo-haptics';

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
  ...props
}) => {
  
  const handlePressWithHaptic = (options: AnimatedPressableOptions) => {

    Haptics.selectionAsync().catch(() => {});

    if (onPress) onPress(options);
  };

  return (
    <PressableHybridBase
      {...props}
      onPress={handlePressWithHaptic}
    >
      {children}
    </PressableHybridBase>
  );
};