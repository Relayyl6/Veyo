import React from 'react';
import { createAnimatedPressable } from 'pressto';
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

const PressableComponent = PressableHybridBase as React.ComponentType<any>;

type PressableHybridProps = Omit<CustomPressableProps, 'onPress'> & {
  className?: string;
  style?: any;
  onPress?: (event: any) => void;
};

export const PressableHybrid: React.FC<PressableHybridProps> = ({
  onPress,
  children,
  className,
  style,
  ...props
}) => {
  const handlePressWithHaptic = (options: AnimatedPressableOptions) => {
    Haptics.selectionAsync().catch(() => {});
    if (onPress) onPress(options);
  };

  return (
    <PressableComponent
      {...props}
      onPress={handlePressWithHaptic}
      className={`overflow-hidden ${className ?? ''}`}
      style={style}
    >
      {children}
    </PressableComponent>
  );
};
