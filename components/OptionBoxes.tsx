import React from 'react';
import { Text, View } from 'react-native';
import { PressableHybrid } from './CustomPressable'; // Double check this matches your exact relative path

interface ActionCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  Icon: React.ComponentType<any> | React.ReactNode;
  iconBgColor?: string; // Optional: Override default background colors per card context
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  onPress,
  Icon,
  iconBgColor = 'bg-neutral-100',
}) => {
  return (
    <PressableHybrid
      onPress={onPress}
      className="flex-1 min-h-[140px] bg-white rounded-[24px] p-5 justify-between shadow-sm border border-neutral-100"
    >
      <View className="flex-1 justify-between items-start">
        {/* 1. Icon Container Box */}
        <View className={`w-12 h-12 rounded-[14px] items-center justify-center ${iconBgColor}`}>
          {typeof Icon === 'function' ? <Icon /> : Icon}
        </View>

        {/* 2. Text Content Block */}
        <View className="mt-4 w-full">
          <Text className="text-[#022150] text-lg font-JakartaBold tracking-tight" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-neutral-400 text-xs font-JakartaMedium mt-0.5" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
    </PressableHybrid>
  );
};

export default ActionCard;