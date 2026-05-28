import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Feather has that exact top-right arrow


interface DropProps {
    title: string;
    next: string;
}

// --- RECENT SEARCH PILL ---
export const SearchPill = ({ title, onRemove }: { title: string; onRemove?: () => void }) => {
  return (
    <TouchableOpacity 
      className="flex-row items-center bg-gray-400 px-3 py-2 rounded-full mr-2 mb-3"
      activeOpacity={0.7}
      onPress={onRemove}
    >
      <Text className="text-gray-600 font-Jakarta text-sm">{title}</Text>
      <View className="ml-2">
        <Ionicons name="close" size={14} color="black" />
      </View>
    </TouchableOpacity>
  );
};

// --- TRENDING SEARCH ITEM ---
export const TrendingItem = ({ index, title, onPress }: { index: number; title: string; onPress?: () => void }) => {
  return (
    <TouchableOpacity 
      className="flex-row items-center justify-between py-3 mx-2"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-4">
        {/* Number Badge */}
        <View className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <Text className="text-indigo-600 font-JakartaBold text-sm">{index}</Text>
        </View>
        
        {/* Title */}
        <Text className="text-black font-Jakarta text-[15px]">{title}</Text>
      </View>

      {/* Arrow Icon */}
      <Feather name="arrow-up-right" size={20} color="#B46E2A" /> {/* Matched the gold/brown arrow color from your image */}
    </TouchableOpacity>
  );
};

const Drop = ({ title, next }: DropProps) => {
  return (
    <View className="flex-row items-center justify-between mx-4 p-2 bg-transparent mt-4">
        
        <View className="flex-row items-center gap-2">
            {title !== "Popular Category" && (
                <Ionicons name={title === "Recent Search" ? "time-outline" : "stats-chart"} color="#737373" size={20} />
            )}
            <Text className="text-black text-lg font-JakartaBold">
                {title}
            </Text>
        </View>

        <Text className="text-blue-600 text-[9px] font-JakartaLight">
            {next}
        </Text>
    </View>
  )
}

export default Drop;